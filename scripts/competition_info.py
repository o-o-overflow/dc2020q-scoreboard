#!/usr/bin/env python3
from contextlib import contextmanager
import base64
import json
import pprint
import sys

import boto3
import psycopg2
import yaml


DB_HOST = {
    "dev": "sb-dev.cgwgx6ftjwg2.us-east-2.rds.amazonaws.com",
    "prod": "sb-prod.cgwgx6ftjwg2.us-east-2.rds.amazonaws.com",
}


def decrypt_secrets(environment="dev"):
    session = boto3.session.Session(profile_name="ooo")
    kms = session.client("kms")
    with open(
        "scoreboard_backend/kms-secrets.{}.us-east-2.yml".format(environment)
    ) as fp:
        encrypted = yaml.safe_load(fp)["secrets"]["SECRETS"]
    data = base64.b64decode(encrypted)
    return json.loads(kms.decrypt(CiphertextBlob=data)["Plaintext"].decode("utf-8"))


def main():
    db_password = decrypt_secrets()["DB_PASSWORD"]

    with psql_connection(db_password) as psql:
        solves(psql)

    return 0


@contextmanager
def psql_connection(db_password, environment="dev"):
    psql = psycopg2.connect(
        dbname="scoreboard",
        host=DB_HOST[environment],
        password=db_password,
        user="dc2019qmaster",
    )
    try:
        yield psql
    finally:
        psql.close()


def solves(psql):
    with psql.cursor() as cursor:
        cursor.execute("SELECT * FROM solves;")
        result = cursor.fetchall()
        pprint.pprint(result)


if __name__ == "__main__":
    sys.exit(main())
