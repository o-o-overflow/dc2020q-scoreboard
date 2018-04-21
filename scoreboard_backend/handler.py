from contextlib import contextmanager
import base64
import logging
import os

import boto3
import psycopg2

import migrations

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

CHALLENGE_FIELDS = ['id', 'title', 'description', 'flag_hash']


def api_response(status_code=200, message=None):
    response = {'body': {'success': status_code < 400},
                'statusCode': status_code}
    if message:
        response['body']['message'] = message
    return response


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
    email = event.get('email', '').lower().strip()
    password = event.get('password', '')
    if not valid_email(email):
        return api_response(422, 'invalid email')
    if not valid_password(password):
        return api_response(
            422, 'password must be between 10 and 72 characters')

    with psql_connection() as psql:
        with psql.cursor() as cursor:
            LOGGER.info('USER REGISTER {}'.format(email))
            try:
                cursor.execute('INSERT INTO users VALUES (DEFAULT, now(), %s, '
                               'crypt(%s, gen_salt(\'bf\', 10)))',
                               (email, password))
            except psycopg2.IntegrityError:
                return api_response(422, 'duplicate email')
        psql.commit()
    return api_response(201)


def valid_email(email):
    return 6 <= len(email) <= 320 and '@' in email and '.' in email


def valid_password(password):
    return 10 <= len(password) <= 72
