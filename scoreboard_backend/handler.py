import json

import psycopg2

DB_HOST = 'scoreboard-dev.cgwgx6ftjwg2.us-east-2.rds.amazonaws.com'
DB_PASSWORD = 'INVALID'


def hello(event, context):
    psql = psycopg2.connect(dbname='scoreboard', host=DB_HOST,
                            password=DB_PASSWORD, user='scoreboard')
    body = {
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response
