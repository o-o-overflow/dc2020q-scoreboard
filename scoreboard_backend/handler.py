import base64
import os

import boto3
import psycopg2


def kms_decrypt(b64data):
    session = boto3.session.Session()
    kms = session.client('kms')
    data = base64.b64decode(b64data)
    return kms.decrypt(CiphertextBlob=data)['Plaintext'].decode('utf-8')


PSQL = psycopg2.connect(dbname='scoreboard', host=os.getenv('DB_HOST'),
                        password=kms_decrypt(os.getenv('DB_PASSWORD')),
                        user='scoreboard')


def hello(event, context):
    with PSQL.cursor() as cursor:
        cursor.execute("SELECT * FROM pg_catalog.pg_tables;")
        result = cursor.fetchone()
    return {
        "statusCode": 200,
        "body": {"result": result}
    }
