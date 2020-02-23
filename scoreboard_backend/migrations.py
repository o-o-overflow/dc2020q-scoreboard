import logging

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

MIGRATIONS = [
    "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
    (
        "CREATE TABLE categories ("
        "id serial PRIMARY KEY, "
        "date_created timestamp with time zone NOT NULL, "
        "name varchar(80) NOT NULL"
        ");"
    ),
    (
        "CREATE TABLE challenges ("
        "id varchar(32) PRIMARY KEY, "
        "date_created timestamp with time zone NOT NULL, "
        "category_id integer NOT NULL REFERENCES categories, "
        "flag_hash char(64) NOT NULL, "
        "name varchar(160) NOT NULL, "
        "description text, "
        "tags text NOT NULL"
        ");"
    ),
    (
        "CREATE TABLE users ("
        "id serial PRIMARY KEY, "
        "date_created timestamp with time zone NOT NULL, "
        "date_updated timestamp with time zone NOT NULL, "
        "ctf_time_team_id integer NULL, "
        "date_confirmed timestamp with time zone NULL, "
        "email varchar(320) NOT NULL, "
        "password char(60) NOT NULL, "
        "team_name varchar(80) NOT NULL"
        ");"
    ),
    (
        "CREATE TABLE confirmations ("
        "id char(36) PRIMARY KEY, "
        "user_id integer NOT NULL REFERENCES users UNIQUE);"
    ),
    (
        "CREATE TABLE solves ("
        "date_created timestamp with time zone NOT NULL, "
        "challenge_id varchar(32) NOT NULL REFERENCES challenges, "
        "user_id integer NOT NULL REFERENCES users, "
        "PRIMARY KEY(challenge_id, user_id)"
        ");"
    ),
    (
        "CREATE TABLE submissions ("
        "id serial PRIMARY KEY, "
        "date_created timestamp with time zone NOT NULL, "
        "challenge_id varchar(32) NOT NULL REFERENCES challenges, "
        "flag varchar(160) NOT NULL, "
        "user_id integer NOT NULL REFERENCES users"
        ");"
    ),
    (
        "CREATE TABLE unopened_challenges ("
        "id varchar(32) PRIMARY KEY, "
        "date_created timestamp with time zone NOT NULL, "
        "category_id integer NOT NULL REFERENCES categories, "
        "flag_hash char(64) NOT NULL, "
        "name varchar(160) NOT NULL, "
        "description text, "
        "tags text NOT NULL"
        ");"
    ),
    "CREATE INDEX submissions_challenge_id_user_id ON submissions (challenge_id, user_id);",
    "CREATE INDEX submissions_date_created ON submissions (date_created);",
    "CREATE UNIQUE INDEX users_lower_email on users (lower(email));",
    "CREATE UNIQUE INDEX users_lower_team_name on users (lower(team_name));",
]


def latest_migration(psql):
    with psql.cursor() as cursor:
        LOGGER.info("Create schema_migrations if necessary")
        cursor.execute(
            "CREATE TABLE IF NOT EXISTS schema_migrations ( "
            "id integer PRIMARY KEY, "
            "date_applied timestamp with time zone NOT NULL);"
        )
        LOGGER.info("Find latest migration")
        cursor.execute("SELECT id from schema_migrations ORDER BY id DESC LIMIT 1;")
        return (cursor.fetchone() or (-1,))[0]


def reset(psql):
    with psql.cursor() as cursor:
        LOGGER.info("DROP and CREATE DATABASE")
        cursor.execute("DROP DATABASE IF EXISTS scoreboard;")
        cursor.execute("CREATE DATABASE scoreboard;")


def run_migrations(psql):
    last = latest_migration(psql)
    if last + 1 >= len(MIGRATIONS):
        return last
    with psql.cursor() as cursor:
        for i, migration in enumerate(MIGRATIONS[last + 1 :]):
            LOGGER.info("up: {}".format(migration))
            cursor.execute(migration)
            cursor.execute(
                "INSERT INTO schema_migrations VALUES (%s, now());", (last + 1 + i,)
            )
    return last + 1 + i
