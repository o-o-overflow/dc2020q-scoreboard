from contextlib import contextmanager
import base64
import logging
import os

import boto3
import psycopg2

import migrations

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


def api_response(status_code=200, message=None):
    response = {'body': {'success': status_code < 400},
                'statusCode': status_code}
    if message:
        response['body']['message'] = message
    return response


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

def user_register(event, _context):
    email = event.get('email', '').lower().strip()
    password = event.get('password', '')
    if not 6 <= len(email) <= 320 or '@' not in email or '.' not in email:
        return api_response(422, 'invalid email')
    if not 10 <= len(password) <= 72:
        return api_response(
            422, 'password must be between 10 and 72 characters')

    with psql_connection() as psql:
        with psql.cursor() as cursor:
            LOGGER.info('ADD USER {}'.format(email))
            try:
                cursor.execute('INSERT INTO users VALUES (DEFAULT, now(), %s, '
                               'crypt(%s, gen_salt(\'bf\', 10)))',
                               (email, password))
            except psycopg2.IntegrityError:
                return api_response(422, 'duplicate email')
        psql.commit()
    return api_response(201)
