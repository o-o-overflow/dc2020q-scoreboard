import base64
import logging
import os

import boto3
import psycopg2

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


def kms_decrypt(b64data):
    session = boto3.session.Session()
    kms = session.client('kms')
    data = base64.b64decode(b64data)
    return kms.decrypt(CiphertextBlob=data)['Plaintext'].decode('utf-8')


def latest_migration():
    with PSQL.cursor() as cursor:
        LOGGER.info('Create schema_migration if necessary')
        cursor.execute("""CREATE TABLE IF NOT EXISTS schema_migrations (
id           integer PRIMARY KEY,
date_applied date NOT NULL
);""")
        LOGGER.info("Find latest migration")
        cursor.execute("""SELECT id from schema_migrations
ORDER BY id DESC
LIMIT 1;""")
        return cursor.fetchone()


PSQL = psycopg2.connect(dbname='scoreboard', host=os.getenv('DB_HOST'),
                        password=kms_decrypt(os.getenv('DB_PASSWORD')),
                        user='scoreboard')


def migrate(_event, _context):
    result = latest_migration()
    LOGGER.info('COMMIT')
    PSQL.commit()
    return {
        "statusCode": 200,
        "body": {"result": result}
    }


def hello(_event, _context):
    with PSQL.cursor() as cursor:
        cursor.execute("SELECT * from schema_migrations;")
        result = cursor.fetchone()
    return {
        "statusCode": 200,
        "body": {"result": result}
    }
