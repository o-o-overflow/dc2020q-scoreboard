from pprint import pprint
import logging
import time
import uuid

import jwt
import psycopg2

from const import (CHALLENGE_FIELDS, REGISTRATION_PROOF_OF_WORK,
                   TOKEN_PROOF_OF_WORK, TWELVE_HOURS)
from helper import api_response, decrypt_secrets, psql_connection, send_email
from validator import (extract_headers, proof_of_work, valid_challenge_id,
                       valid_confirmation, valid_email, valid_flag, valid_int,
                       valid_int_as_string, valid_password, valid_team,
                       valid_timestamp, validate)
import migrations


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


COMPETITION_START = 1526083200
SECRETS = decrypt_secrets()


def valid_token(token):
    try:
        jwt.decode(token, SECRETS['JWT_SECRET'], algorithms=['HS256'])
    except jwt.InvalidTokenError:
        return False
    return True


def challenges_set(event, context):
    if not event:
        return api_response(422, 'data for the scoreboard must be provided')
    if not isinstance(event, list):
        return api_response(422, 'invalid scoreboard data')

    if '-dev-' not in context.function_name and \
       int(time.time()) > COMPETITION_START:
        LOGGER.error('Cannot set challenges once the competition has started')
        return api_response(422, 'competition has already started')

    categories = {'Default': None, 'Second Category': None}
    categories_values_sql = ', '.join(
        ['(DEFAULT, now(), %s)'] * len(categories))
    challenges = []
    try:
        for challenge in event:
            challenges.append({field: challenge[field]
                               for field in CHALLENGE_FIELDS})
    except (KeyError, TypeError):
        return api_response(422, 'invalid scoreboard data')
    challenges_values_sql = ', '.join(
        ['(%s, now(), %s, %s, %s)'] * len(challenges))

    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('Empty challenges and categories tables')
            cursor.execute('TRUNCATE categories, challenges, submissions;')

            LOGGER.info('Add categories')
            cursor.execute('INSERT INTO categories VALUES {};'
                           .format(categories_values_sql), tuple(categories))

            LOGGER.info('Get category IDs')
            cursor.execute('SELECT id, name FROM categories;')
            results = cursor.fetchall()
            for category_id, category_name in results:
                categories[category_name] = category_id

            values = []
            for challenge in challenges:
                values.append(challenge['id'])
                values.append(challenge['title'])
                values.append(challenge['description'])
                #  TODO: Update to use passed in category
                values.append(categories['Default'])

            LOGGER.info('Add challenges')
            cursor.execute('INSERT INTO challenges VALUES {};'
                           .format(challenges_values_sql), tuple(values))
        psql.commit()
    return api_response(200, 'challenges set')


def migrate(event, context):
    prod = '-dev-' not in context.function_name
    reset = event.get('reset')
    if prod and reset:
        reset = False
        LOGGER.warn('Cannot reset the prod environment')
    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        result = migrations.run_migrations(psql, reset_db=reset)
        psql.commit()
    return api_response(200, result)


@validate(challenge_id=valid_challenge_id, flag=valid_flag, nonce=valid_int,
          timestamp=valid_timestamp, token=valid_token)
@proof_of_work(['challenge_id', 'flag', 'token'], TOKEN_PROOF_OF_WORK)
def submit(data, stage):
    challenge_id = data['challenge_id']
    flag = data['flag'].strip()
    user_id = jwt.decode(data['token'], verify=False)['user_id']

    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('SUBMIT {} {} {}'.format(user_id, challenge_id, flag))
            try:
                cursor.execute('INSERT INTO submissions VALUES (DEFAULT, '
                               'now(), %s, %s, %s);',
                               (user_id, challenge_id, flag))
            except psycopg2.IntegrityError as exception:
                return api_response(422, 'invalid submission data')
        psql.commit()

    return api_response(200)


@validate(email=valid_email, nonce=valid_int, password=valid_password,
          timestamp=valid_timestamp)
@proof_of_work(['email', 'password'],
               TOKEN_PROOF_OF_WORK)
def token(data, stage):
    email = data['email']
    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER LOGIN {}'.format(email))
            cursor.execute('SELECT id FROM users where lower(email)=%s AND '
                           'password=crypt(%s, password);',
                           (email, data['password']))
            response = cursor.fetchone()
    if not response:
        return api_response(401, 'invalid credentials')

    now = int(time.time())
    if stage == 'prod':
        now = max(now, COMPETITION_START)

    payload = {'exp': now + TWELVE_HOURS, 'nbf': now, 'user_id': response[0]}
    token = jwt.encode(payload, SECRETS['JWT_SECRET'],
                       algorithm='HS256').decode('utf-8')
    return api_response(200, {'token': token})


@validate(id=valid_confirmation, validate_data=False)
def user_confirm(data, stage):
    confirmation_id = data['id']
    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('CONFIRM: {}'.format(confirmation_id))
            cursor.execute('SELECT user_id FROM confirmations where id=%s;',
                           (confirmation_id,))
            response = cursor.fetchone()
            if not response:
                return api_response(422, 'invalid confirmation or confirmation'
                                    ' already completed')
            user_id = response[0]
            cursor.execute('DELETE FROM confirmations where id=%s;',
                           (confirmation_id,))
            cursor.execute('UPDATE users SET date_confirmed=now() '
                           'where id=%s;', (user_id,))
            cursor.execute('SELECT email FROM users where id=%s;', (user_id,))
            email = cursor.fetchone()[0]
        psql.commit()

        LOGGER.info('EMAIL: {}'.format(email))
    body = ('Your registration to DEF CON 2018 CTF Quals is complete.\n\n'
            'Prior to the competition you will receive an email with more '
            'information.\n\nhttps://scoreboard.oooverflow.io/\n')
    send_email('OOO Account Registration <accounts@oooverflow.io>',
               email, '[OOO] Registration Complete', body,
               stage=stage)
    return api_response(200, 'confirmation complete')


@extract_headers(app_url='origin')
@validate(ctf_time_team_id=valid_int_as_string, email=valid_email,
          nonce=valid_int, password=valid_password, team_name=valid_team,
          timestamp=valid_timestamp)
@proof_of_work(['email'], REGISTRATION_PROOF_OF_WORK)
def user_register(data, stage, app_url):
    team_id = data['ctf_time_team_id']
    team_id = None if team_id == '' else int(team_id)
    email = data['email']
    password = data['password']
    team_name = data['team_name']

    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER REGISTER {}'.format(email))
            try:
                cursor.execute('INSERT INTO users VALUES (DEFAULT, now(), '
                               'NULL, %s, crypt(%s, gen_salt(\'bf\', 10)), '
                               '%s, %s)',
                               (email, password, team_name, team_id))
            except psycopg2.IntegrityError as exception:
                if 'email' in exception.diag.constraint_name:
                    return api_response(422, 'duplicate email')
                return api_response(422, 'duplicate team name')
            cursor.execute('SELECT id FROM users where email=%s;', (email,))
            user_id = cursor.fetchone()[0]
            confirmation_id = str(uuid.uuid4())
            cursor.execute('INSERT INTO confirmations VALUES (%s, %s);',
                           (confirmation_id, user_id))
        psql.commit()

    confirmation_url = '{}/#/confirm/{}'.format(app_url, confirmation_id)
    body = 'Please confirm your account creation:\n\n{}\n'.format(
        confirmation_url)
    send_email('OOO Account Registration <accounts@oooverflow.io>',
               email, '[OOO] Please Confirm Your Registration', body,
               stage=stage)
    return api_response(201)


def users(_event, _context):
    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        with psql.cursor() as cursor:
            cursor.execute('SELECT id, email, team_name, ctf_time_team_id '
                           'FROM users ORDER BY id;')
            for row in cursor.fetchall():
                print(row)

            cursor.execute('SELECT * FROM confirmations ORDER BY user_id;')
            result = cursor.fetchall()
            if result:
                print('Pending confirmations')
                pprint(result)
    return api_response(200)
