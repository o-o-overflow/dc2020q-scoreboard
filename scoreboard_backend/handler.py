from pprint import pprint
import hashlib
import logging
import time
import uuid

import jwt
import psycopg2

from const import (CHALLENGE_FIELDS, REGISTRATION_PROOF_OF_WORK,
                   TOKEN_PROOF_OF_WORK, TWELVE_HOURS)
from helper import (api_response, decrypt_secrets, parse_json_request,
                    psql_connection, send_email)
from validator import (proof_of_work, valid_email, valid_int, valid_password,
                       valid_timestamp, validate)
import migrations


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


SECRETS = decrypt_secrets()


def challenges_set(event, _context):
    if not event:
        return api_response(422, 'data for the scoreboard must be provided')
    if not isinstance(event, list):
        return api_response(422, 'invalid scoreboard data')
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
            cursor.execute('TRUNCATE challenges, categories;')

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


def migrate(event, _context):
    reset = event.get('reset')
    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        result = migrations.run_migrations(psql, reset_db=reset)
        psql.commit()
    return api_response(200, result)


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
        now = max(now, 1526083200)

    payload = {'exp': now + TWELVE_HOURS, 'nbf': now, 'user_id': response[0]}
    token = jwt.encode(payload, SECRETS['JWT_SECRET'],
                       algorithm='HS256').decode('utf-8')
    return api_response(200, {'token': token})


def user_confirm(event, _context):
    confirmation_id = event['pathParameters']['id']
    if len(confirmation_id) != 36:
        return api_response(422, 'invalid confirmation')

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
               stage=event['requestContext']['stage'])
    return api_response(200, 'confirmation complete')


def user_register(event, _context):
    app_url = event['headers'].get('origin', None)
    if not app_url:
        return api_response(422, 'origin header missing')

    data = parse_json_request(event)
    if data is None:
        return api_response(422, 'invalid request')
    ctf_time_team_id = data.get('ctf_time_team_id', '').strip()
    email = data.get('email', '').strip()
    nonce = data.get('nonce', '')
    password = data.get('password', '')
    team_name = data.get('team_name', '').strip()
    timestamp = data.get('timestamp', '')
    if not isinstance(nonce, int):
        return api_response(422, 'invalid nonce')
    if not valid_int_as_string(ctf_time_team_id, min_value=1,
                               max_value=100000):
        return api_response(422, 'invalid CTF Time team id')
    if not valid_email(email):
        return api_response(422, 'invalid email')
    if not valid_team(team_name):
        return api_response(422, 'invalid team name')
    if not valid_password(password):
        return api_response(
            422, 'password must be between 10 and 72 characters')
    timestamp_error = valid_timestamp(timestamp)
    if timestamp_error is not True:
        return api_response(422, timestamp_error)

    digest = hashlib.sha256('{}!{}!{}'.format(email, timestamp, nonce)
                            .encode()).hexdigest()
    if not digest.startswith(REGISTRATION_PROOF_OF_WORK):
        return api_response(422, 'invalid nonce')

    if ctf_time_team_id == '':
        ctf_time_team_id = None
    else:
        ctf_time_team_id = int(ctf_time_team_id)

    with psql_connection(SECRETS['DB_PASSWORD']) as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER REGISTER {}'.format(email))
            try:
                cursor.execute('INSERT INTO users VALUES (DEFAULT, now(), '
                               'NULL, %s, crypt(%s, gen_salt(\'bf\', 10)), '
                               '%s, %s)',
                               (email, password, team_name, ctf_time_team_id))
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
               stage=event['requestContext']['stage'])
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


def valid_int_as_string(value, max_value, min_value):
    if value == '':
        return True
    if not isinstance(value, str) or not value.isnumeric():
        return False
    return min_value <= int(value) <= max_value


def valid_team(team):
    return 0 < len(team) <= 80
