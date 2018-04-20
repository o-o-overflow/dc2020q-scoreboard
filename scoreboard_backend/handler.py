from contextlib import contextmanager
import base64
import logging
import os

import boto3
import psycopg2

import migrations

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


def kms_decrypt(b64data):
    session = boto3.session.Session()
    kms = session.client('kms')
    data = base64.b64decode(b64data)
    return kms.decrypt(CiphertextBlob=data)['Plaintext'].decode('utf-8')


def migrate(_event, _context):
    with psql_connection() as psql:
        result = migrations.run_migrations(psql)
        psql.commit()
    return {'body': {'result': result},
            'statusCode': 200}


def user_register(_event, _context):
    with psql_connection() as psql:
        with psql.cursor() as cursor:
            email = 'test@example.com'
            password = 'thisisnotarealpassword'
            LOGGER.info('ADD USER {}'.format(email))
            cursor.execute('INSERT INTO users VALUES (DEFAULT, now(), %s, '
                           'crypt(%s, gen_salt(\'bf\', 10)))',
                           (email, password))
        psql.commit()
    return {'body': {'result': 'success'},
            'statusCode': 200}


@contextmanager
def psql_connection():
    psql = psycopg2.connect(dbname='scoreboard', host=os.getenv('DB_HOST'),
                            password=kms_decrypt(os.getenv('DB_PASSWORD')),
                            user='scoreboard')
    try:
        yield psql
    finally:
        psql.close()
