from pprint import pprint
import logging
import hashlib
import time
import uuid

import jwt
import psycopg2

from const import (COMPETITION_END, COMPETITION_START,
                   REGISTRATION_PROOF_OF_WORK, SUBMISSION_DELAY,
                   TOKEN_PROOF_OF_WORK, TWELVE_HOURS)
from helper import api_response, decrypt_secrets, psql_connection, send_email
from validator import (extract_headers, proof_of_work, valid_challenge_id,
                       valid_confirmation, valid_email, valid_flag, valid_int,
                       valid_int_as_string, valid_password, valid_team,
                       valid_timestamp, validate)
import migrations


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

SECRETS = decrypt_secrets()


def valid_token(token):
    try:
        jwt.decode(token, SECRETS['JWT_SECRET'], algorithms=['HS256'])
    except jwt.InvalidTokenError:
        return {'status_code': 401, 'message': 'invald token'}
    return True


@validate(id=valid_challenge_id, token=valid_token, validate_data=False)
def challenge(data, stage):
    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            cursor.execute('SELECT description FROM challenges where id=%s',
                           (data['id'],))
            result = cursor.fetchone()
    if not result:
        return api_response(404)
    return api_response(200, result[0])


def challenge_open(event, _context):
    if not event:
        return api_response(422, 'data must be provided')
    challenge_id = event.get('id', None)
    if not challenge_id:
        return api_response(422, 'invalid challenge id')

    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            cursor.execute('SELECT name, description, category_id, flag_hash, '
                           'tags FROM unopened_challenges WHERE id=%s',
                           (challenge_id,))
            result = cursor.fetchone()
            if not result:
                return api_response(
                    400, 'that challenge does not exist or was already opened')

            cursor.execute('DELETE FROM unopened_challenges WHERE id=%s',
                           (challenge_id,))
            cursor.execute('INSERT INTO challenges VALUES (%s, now(), %s, %s, '
                           '%s, %s, %s);', (challenge_id, *result))
        psql.commit()
    return api_response(201)


def challenges(event, _context):
    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            cursor.execute('SELECT challenges.id, challenges.name, '
                           'challenges.tags, categories.name, '
                           'EXTRACT(EPOCH from challenges.date_created) FROM  '
                           'challenges JOIN categories ON category_id = categories.id '
                           'ORDER BY challenges.date_created ASC;')
            open_challenge_data = cursor.fetchall()
            cursor.execute('SELECT challenge_id, team_name,'
                           'EXTRACT(EPOCH FROM solves.date_created) FROM '
                           'solves JOIN users ON user_id=id;')
            solves = cursor.fetchall()
            cursor.execute(
                'SELECT categories.name, count(unopened_challenges.id) FROM '
                'unopened_challenges JOIN categories ON '
                'category_id=categories.id GROUP BY categories.name;')
            unopened_by_category = dict(cursor.fetchall())
    return api_response(200, {'open': open_challenge_data, 'solves': solves,
                              'unopened_by_category': unopened_by_category})


def challenges_set(event, context):
    if not event:
        return api_response(422, 'data for the scoreboard must be provided')
    if not isinstance(event, list):
        return api_response(422, 'invalid scoreboard data')

    if '-dev-' not in context.function_name and \
       int(time.time()) > COMPETITION_START:
        LOGGER.error('Cannot set challenges once the competition has started')
        return api_response(400, 'competition has already started')

    categories = {}
    challenge_values = []
    try:
        for challenge in event:
            categories[challenge['category']] = None
            challenge_values.append(challenge['id'])
            challenge_values.append(challenge['title'])
            challenge_values.append(challenge['description'])
            challenge_values.append(challenge['category'])
            challenge_values.append(challenge['flag_hash'])
            challenge_values.append(', '.join(sorted(challenge['tags'])))
    except (KeyError, TypeError):
        return api_response(422, 'invalid scoreboard data')
    categories_sql = ', '.join(
        ['(DEFAULT, now(), %s)'] * len(categories))
    challenges_sql = ', '.join(['(%s, now(), %s, %s, %s, %s, %s)']
                               * len(event))

    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('Empty challenges and categories tables')
            cursor.execute('TRUNCATE categories, challenges, solves, '
                           'submissions, unopened_challenges;')

            LOGGER.info('Add categories')
            cursor.execute('INSERT INTO categories VALUES {};'
                           .format(categories_sql), tuple(categories))

            LOGGER.info('Get category IDs')
            cursor.execute('SELECT id, name FROM categories;')
            results = cursor.fetchall()
            for category_id, category_name in results:
                categories[category_name] = category_id

            # Replace challenge name with challenge_id
            for index in range(3, len(challenge_values), 6):
                challenge_values[index] = categories[challenge_values[index]]

            LOGGER.info('Add challenges')
            cursor.execute('INSERT INTO unopened_challenges VALUES {};'
                           .format(challenges_sql), tuple(challenge_values))
        psql.commit()
    return api_response(201, 'unopened_challenges set')


def migrate(event, context):
    prod = '-dev-' not in context.function_name
    reset = event.get('reset')
    if prod and reset:
        reset = False
        LOGGER.warn('Cannot reset the prod environment')
    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        result = migrations.run_migrations(psql, reset_db=reset)
        psql.commit()
    return api_response(200, result)


def ping(_event, _context):
    return api_response(200, 'ok')


@validate(challenge_id=valid_challenge_id, flag=valid_flag, nonce=valid_int,
          timestamp=valid_timestamp, token=valid_token)
@proof_of_work(['challenge_id', 'flag', 'token'], TOKEN_PROOF_OF_WORK)
def submit(data, stage):
    challenge_id = data['challenge_id']
    flag = data['flag'].strip()
    user_id = jwt.decode(data['token'], verify=False)['user_id']

    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            cursor.execute('SELECT EXTRACT(EPOCH FROM (now() - '
                           'date_last_submitted)) FROM users WHERE id=%s;',
                           (user_id,))
            response = cursor.fetchone()
            if response[0] and response[0] < SUBMISSION_DELAY:
                wait_time = SUBMISSION_DELAY - response[0]
                return api_response(429, {'seconds': wait_time})
            LOGGER.info('SUBMIT {} {} {}'.format(user_id, challenge_id, flag))
            cursor.execute('UPDATE users SET date_last_submitted=now() '
                           'WHERE id=%s;', (user_id,))
            # Ensure the rate limit time is updated even if the following fails
            psql.commit()

            # Check to see if they've already solved it
            cursor.execute('SELECT 1 FROM solves where challenge_id=%s AND '
                           'user_id=%s', (challenge_id, user_id))
            response = cursor.fetchone()
            if response:
                return api_response(409, 'challenge already solved')

            # Check if correct solution
            flag_hash = hashlib.sha256(flag.encode()).hexdigest()
            cursor.execute('SELECT 1 FROM challenges WHERE id=%s AND '
                           'flag_hash=%s', (challenge_id, flag_hash))
            response = cursor.fetchone()
            if challenge_id == 'mom':
                message = 'Thanks, we hope whoever you chose appreciated the gesture.'
                status = 201
                cursor.execute('INSERT INTO solves VALUES (now(), %s, %s);',
                               (challenge_id, user_id))
                cursor.execute('INSERT INTO submissions VALUES (DEFAULT, '
                               'now(), %s, %s, %s);',
                               (user_id, challenge_id, flag))
            elif response:
                cursor.execute('INSERT INTO solves VALUES (now(), %s, %s);',
                               (challenge_id, user_id))
                message = 'success!'
                status = 201
            else:
                message = 'incorrect flag'
                status = 400
                # Log submission
                #
                # Note: We only want to log incorrect submissions, this way the
                #       DB does not contain valid flags.
                try:
                    cursor.execute('INSERT INTO submissions VALUES (DEFAULT, '
                                   'now(), %s, %s, %s);',
                                   (user_id, challenge_id, flag))
                except psycopg2.IntegrityError as exception:
                    return api_response(409, 'invalid submission data')
        psql.commit()

    return api_response(status, message)


def test_email(_event, context):
    stage = 'prod' if '-prod-' in context.function_name else 'dev'
    print('Sending test email in stage {}'.format(stage))
    email = 'OOO Debug <debug@oooverflow.io>'
    send_email(email, email, '[OOO] Debug Email', '', stage=stage)
    return api_response(200, 'ok')


@validate(email=valid_email, nonce=valid_int, password=valid_password,
          timestamp=valid_timestamp)
@proof_of_work(['email', 'password'],
               TOKEN_PROOF_OF_WORK)
def token(data, stage):
    now = int(time.time())
    if stage == 'prod' and now < COMPETITION_START:
        return api_response(400, 'the competition has not yet started')
    if now >= COMPETITION_END:
        return api_response(400, 'the competition is over')

    email = data['email']
    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER LOGIN {}'.format(email))
            cursor.execute('SELECT id, team_name FROM users where '
                           'date_confirmed IS NOT NULL AND '
                           'lower(email)=%s AND password=crypt(%s, password);',
                           (email, data['password']))
            response = cursor.fetchone()
    if not response:
        return api_response(401, 'invalid credentials')

    if stage == 'prod':
        now = max(now, COMPETITION_START)
    expire_time = min(COMPETITION_END, now + TWELVE_HOURS)

    payload = {'exp': expire_time, 'nbf': now, 'user_id': response[0]}
    token = jwt.encode(payload, SECRETS['JWT_SECRET'],
                       algorithm='HS256').decode('utf-8')
    return api_response(200, {'team': response[1], 'token': token})


@validate(id=valid_confirmation, validate_data=False)
def user_confirm(data, stage):
    confirmation_id = data['id']
    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('CONFIRM: {}'.format(confirmation_id))
            cursor.execute('SELECT user_id FROM confirmations where id=%s;',
                           (confirmation_id,))
            response = cursor.fetchone()
            if not response:
                return api_response(409, 'invalid confirmation or confirmation'
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
    body = ('Your registration to DEF CON 2019 CTF Quals is complete.\n\n'
            'https://scoreboard.oooverflow.io/\n')
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

    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER REGISTER {}'.format(email))
            try:
                cursor.execute('INSERT INTO users VALUES (DEFAULT, now(), '
                               'NULL, %s, crypt(%s, gen_salt(\'bf\', 10)), '
                               '%s, %s)',
                               (email, password, team_name, team_id))
            except psycopg2.IntegrityError as exception:
                if 'email' in exception.diag.constraint_name:
                    return api_response(409, 'duplicate email')
                return api_response(409, 'duplicate team name')
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
    with psql_connection(SECRETS['DB_PASSWORD'],
                         SECRETS['DB_USERNAME']) as psql:
        with psql.cursor() as cursor:
            cursor.execute('SELECT id, email, team_name, ctf_time_team_id '
                           'FROM users ORDER BY id;')
            result = cursor.fetchall()
            if result:
                print('Users: {}'.format(len(result)))
                pprint(result)

            cursor.execute('SELECT * FROM confirmations ORDER BY user_id;')
            result = cursor.fetchall()
            if result:
                print('Pending confirmations')
                pprint(result)
    return api_response(200)
