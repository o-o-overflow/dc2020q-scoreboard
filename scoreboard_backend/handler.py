from contextlib import contextmanager
import base64
import hashlib
import json
import logging
import os
import time

import boto3
import psycopg2

import migrations

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

CHALLENGE_FIELDS = ['id', 'title', 'description', 'flag_hash']
PROOF_OF_WORK = '000c7f'
TIMESTAMP_MAX_DELTA = 600


def api_response(status_code=200, message=None):
    body = {'success': status_code < 400}
    if message:
        body['message'] = message
    return {'body': json.dumps(body),
            'headers': {'Access-Control-Allow-Origin': '*'},
            'statusCode': status_code}


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

    with psql_connection() as psql:
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


def kms_decrypt(b64data):
    session = boto3.session.Session()
    kms = session.client('kms')
    data = base64.b64decode(b64data)
    return kms.decrypt(CiphertextBlob=data)['Plaintext'].decode('utf-8')


def migrate(event, _context):
    reset = event.get('reset')
    with psql_connection() as psql:
        result = migrations.run_migrations(psql, reset_db=reset)
        psql.commit()
    return api_response(200, result)


def parse_json_request(event, min_body_size=2, max_body_size=512):
    headers = event.get('headers', {})
    content_type = ''
    for header in headers:
        if header.lower() == 'content-type':
            content_type = headers[header]
            break
    if content_type.lower() != 'application/json' or \
       not min_body_size <= len(event['body']) <= max_body_size:
        return None
    try:
        return json.loads(event['body'])
    except:
        return None


@contextmanager
def psql_connection():
    psql = psycopg2.connect(dbname='scoreboard', host=os.getenv('DB_HOST'),
                            password=kms_decrypt(os.getenv('DB_PASSWORD')),
                            user='scoreboard')
    try:
        yield psql
    finally:
        psql.close()


def user_login(event, _context):
    email = event.get('email', '').lower().strip()
    password = event.get('password', '')
    if not valid_email(email):
        return api_response(422, 'invalid email')
    if not valid_password(password):
        return api_response(
            422, 'password must be between 10 and 72 characters')

    with psql_connection() as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER LOGIN {}'.format(email))
            cursor.execute('SELECT id FROM users where lower(email)=%s AND '
                           'password=crypt(%s, password);', (email, password))
            response = cursor.fetchone()
    if not response:
        return api_response(401, 'invalid credentials')
    return api_response(200)


def user_register(event, _context):
    data = parse_json_request(event)
    if data is None:
        return api_response(422, 'invalid request')
    email = data.get('email', '').strip()
    nonce = data.get('nonce', '')
    password = data.get('password', '')
    team_name = data.get('team_name', '').strip()
    timestamp = data.get('timestamp', '')
    if not isinstance(nonce, int):
        return api_response(422, 'invalid nonce')
    if not valid_email(email):
        return api_response(422, 'invalid email')
    if not valid_team(team_name):
        return api_response(422, 'invalid team name')
    if not valid_password(password):
        return api_response(
            422, 'password must be between 10 and 72 characters')
    timestamp_error = validate_timestamp(timestamp)
    if timestamp_error:
        return api_response(422, timestamp_error)

    digest = hashlib.sha256('{}!{}!{}'.format(email, timestamp, nonce)
                            .encode()).hexdigest()
    if not digest.startswith(PROOF_OF_WORK):
        return api_response(422, 'invalid nonce')

    email = email.lower()  # Store email in lowercase
    with psql_connection() as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER REGISTER {}'.format(email))
            try:
                cursor.execute('INSERT INTO users VALUES (DEFAULT, now(), %s, '
                               'crypt(%s, gen_salt(\'bf\', 10)), %s)',
                               (email, password, team_name))
            except psycopg2.IntegrityError as exception:
                if 'email' in exception.diag.constraint_name:
                    return api_response(422, 'duplicate email')
                return api_response(422, 'duplicate team name')
        psql.commit()
    return api_response(201)


def valid_email(email):
    return 6 <= len(email) <= 320 and '@' in email and '.' in email


def valid_team(team):
    return 0 < len(team) <= 80


def valid_password(password):
    return 10 <= len(password) <= 72


def validate_timestamp(timestamp):
    if not isinstance(timestamp, int):
        return 'invalid timestamp'
    now = int(time.time())
    if timestamp > now:
        return 'timestamp is too recent'
    if now - timestamp > TIMESTAMP_MAX_DELTA:
        return 'timestamp has expired'
    return None
