import logging
import hashlib
import os
import time
import uuid
from datetime import datetime

import jwt
import psycopg2

import migrations
from const import (
    ACCESS_TOKEN_DURATION,
    COMPETITION_END,
    COMPETITION_START,
    REGISTRATION_PROOF_OF_WORK,
    SUBMISSION_DELAY,
    TOKEN_PROOF_OF_WORK,
)
from helper import api_response, psql_connection, send_email
from validator import (
    callback_submit_proof_of_work,
    extract_headers,
    proof_of_work,
    valid_challenge_id,
    valid_confirmation,
    valid_email,
    valid_flag,
    valid_int,
    valid_int_as_string,
    valid_password,
    valid_team,
    valid_timestamp,
    validate,
)


DB_PASSWORD = os.environ["DB_PASSWORD"]
JWT_SECRET = os.environ["JWT_SECRET"]


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


def valid_token(token_type):
    def fail():
        return {
            "status_code": 401,
            "message": "invalid {} token".format(token_type),
        }

    def validate(token, stage):
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.InvalidTokenError:
            if stage != "development":
                return fail()
            try:
                payload = jwt.decode(
                    token, JWT_SECRET, algorithms=["HS256"], verify=False
                )
            except jwt.InvalidTokenError:
                return fail()
            if payload.get("verify") is not False:
                return fail()

        return payload["token_type"] == token_type

    return validate


@validate(id=valid_challenge_id, token=valid_token("access"), validate_data=False)
def challenge(data, _stage):
    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            cursor.execute(
                "SELECT description FROM challenges where id=%s", (data["id"],)
            )
            result = cursor.fetchone()
    if not result:
        return api_response(404)
    return api_response(200, result[0])


def challenge_delete(event, _context):
    if not event:
        return api_response(422, "data must be provided")
    challenge_id = event.get("id", None)
    if not challenge_id:
        return api_response(422, "invalid challenge id")

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            cursor.execute(
                "DELETE FROM unopened_challenges WHERE id=%s", (challenge_id,)
            )
            if cursor.rowcount != 1:
                return api_response(
                    400, "that challenge does not exist or was already opened"
                )
        psql.commit()
    return api_response(200)


def challenge_open(event, _context):
    if not event:
        return api_response(422, "data must be provided")
    challenge_id = event.get("id", None)
    if not challenge_id:
        return api_response(422, "invalid challenge id")

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            cursor.execute(
                "SELECT name, description, category_id, flag_hash, "
                "tags FROM unopened_challenges WHERE id=%s",
                (challenge_id,),
            )
            result = cursor.fetchone()
            if not result:
                return api_response(
                    400, "that challenge does not exist or was already opened"
                )

            cursor.execute(
                "DELETE FROM unopened_challenges WHERE id=%s", (challenge_id,)
            )
            cursor.execute(
                "INSERT INTO challenges VALUES (%s, now(), %s, %s, %s, %s, %s);",
                (challenge_id, *result),
            )
        psql.commit()
    return api_response(201)


def challenge_update(event, _context):
    if not event:
        return api_response(422, "data must be provided")
    challenge_id = event["id"]
    description = event["description"]
    flag_hash = event["flag_hash"]
    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            cursor.execute("SELECT 1 FROM challenges WHERE id=%s", (challenge_id,))
            result = cursor.fetchone()
            table = "challenges" if result else "unopened_challenges"
            cursor.execute(
                f"UPDATE {table} set description=%s, flag_hash=%s where id=%s;",
                (description, flag_hash, challenge_id),
            )
        psql.commit()
    return api_response(200)


def challenges(event, _context):
    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            cursor.execute(
                "SELECT challenges.id, challenges.name, "
                "challenges.tags, categories.name, "
                "EXTRACT(EPOCH from challenges.date_created) FROM  "
                "challenges JOIN categories ON category_id = categories.id "
                "ORDER BY challenges.date_created ASC;"
            )
            open_challenge_data = cursor.fetchall()
            cursor.execute(
                "SELECT challenge_id, team_name,"
                "EXTRACT(EPOCH FROM solves.date_created) FROM "
                "solves JOIN users ON user_id=id;"
            )
            solves = cursor.fetchall()
            cursor.execute(
                "SELECT categories.name, count(unopened_challenges.id) FROM "
                "unopened_challenges JOIN categories ON "
                "category_id=categories.id GROUP BY categories.name;"
            )
            unopened_by_category = dict(cursor.fetchall())
    return api_response(
        200,
        {
            "open": open_challenge_data,
            "solves": solves,
            "unopened_by_category": unopened_by_category,
        },
        log_message=False,
    )


def challenges_add(event, _context):
    if not event:
        return api_response(422, "data for the scoreboard must be provided")
    if not isinstance(event, list):
        return api_response(422, "invalid scoreboard data")
    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            LOGGER.info("Get category IDs")
            cursor.execute("SELECT id, name FROM categories;")
            categories = {x[1]: x[0] for x in cursor.fetchall()}

            LOGGER.info("Get opened challenges")
            cursor.execute("SELECT name FROM challenges;")
            existing_challenges = [x[0] for x in cursor.fetchall()]

            LOGGER.info("Get unopened challenges")
            cursor.execute("SELECT name FROM unopened_challenges;")
            existing_challenges.extend(x[0] for x in cursor.fetchall())
            LOGGER.info(f"Existing challenges: {sorted(existing_challenges)}")

            new_challenges = []
            challenge_values = []
            try:
                for challenge in event:
                    if challenge["id"] in existing_challenges:
                        continue
                    new_challenges.append(challenge["id"])
                    challenge_values.append(challenge["id"])
                    challenge_values.append(challenge["title"])
                    challenge_values.append(challenge["description"])
                    challenge_values.append(categories[challenge["category"]])
                    challenge_values.append(challenge["flag_hash"])
                    challenge_values.append(", ".join(sorted(challenge["tags"])))
            except (KeyError, TypeError):
                return api_response(422, "invalid scoreboard data")

            if not new_challenges:
                return api_response(304)

            LOGGER.info(f"Adding challenges: {sorted(new_challenges)}")

            challenges_sql = ", ".join(
                ["(%s, now(), %s, %s, %s, %s, %s)"] * len(new_challenges)
            )
            cursor.execute(
                "INSERT INTO unopened_challenges VALUES {};".format(challenges_sql),
                tuple(challenge_values),
            )
        psql.commit()
    return api_response(201, "added {} challenge(s)".format(len(new_challenges)))


def challenges_set(event, context):
    if not event:
        return api_response(422, "data for the scoreboard must be provided")
    if not isinstance(event, list):
        return api_response(422, "invalid scoreboard data")

    if (
        "-development-" not in context.function_name
        and int(time.time()) > COMPETITION_START
    ):
        LOGGER.error("Cannot set challenges once the competition has started")
        return api_response(400, "competition has already started")

    categories = {}
    challenge_values = []
    try:
        for challenge in event:
            categories[challenge["category"]] = None
            challenge_values.append(challenge["id"])
            challenge_values.append(challenge["title"])
            challenge_values.append(challenge["description"])
            challenge_values.append(challenge["category"])
            challenge_values.append(challenge["flag_hash"])
            challenge_values.append(", ".join(sorted(challenge["tags"])))
    except (KeyError, TypeError):
        return api_response(422, "invalid scoreboard data")
    categories_sql = ", ".join(["(DEFAULT, now(), %s)"] * len(categories))
    challenges_sql = ", ".join(["(%s, now(), %s, %s, %s, %s, %s)"] * len(event))

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            LOGGER.info("Empty challenges and categories tables")
            cursor.execute(
                "TRUNCATE categories, challenges, solves, "
                "submissions, unopened_challenges;"
            )

            LOGGER.info("Add categories")
            cursor.execute(
                "INSERT INTO categories VALUES {};".format(categories_sql),
                tuple(categories),
            )

            LOGGER.info("Get category IDs")
            cursor.execute("SELECT id, name FROM categories;")
            results = cursor.fetchall()
            for category_id, category_name in results:
                categories[category_name] = category_id

            # Replace category name with category_id
            for index in range(3, len(challenge_values), 6):
                challenge_values[index] = categories[challenge_values[index]]

            LOGGER.info("Add challenges")
            cursor.execute(
                "INSERT INTO unopened_challenges VALUES {};".format(challenges_sql),
                tuple(challenge_values),
            )
        psql.commit()
    return api_response(201, "unopened_challenges set")


def migrate(event, context):
    production = "-development-" not in context.function_name
    reset = event.get("reset")
    if production and reset:
        reset = False
        LOGGER.warn("Cannot reset the production environment")
    if reset:
        with psql_connection(
            DB_PASSWORD, "scoreboard", reset=True
        ) as psql:
            migrations.reset(psql)

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        result = migrations.run_migrations(psql)
        psql.commit()
    return api_response(200, result)


def ping(_event, _context):
    return api_response(200, "ok")


@validate(
    challenge_id=valid_challenge_id,
    flag=valid_flag,
    nonce=valid_int,
    timestamp=valid_timestamp,
    token=valid_token("access"),
)
@proof_of_work(["challenge_id", "flag", "token"], callback_submit_proof_of_work)
def submit(data, stage):
    challenge_id = data["challenge_id"]
    flag = data["flag"].strip()
    user_id = jwt.decode(data["token"], verify=False)["user_id"]

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            # Verify if valid ID before doing anything else
            cursor.execute("SELECT 1 FROM challenges WHERE id=%s", (challenge_id,))
            response = cursor.fetchone()
            if not response:
                LOGGER.warning(
                    "INVALID SUBMIT {} {} {}".format(user_id, challenge_id, flag)
                )
                return api_response(422, "invalid challenge_id")

            cursor.execute(
                "SELECT EXTRACT(EPOCH FROM (now() - date_created)) FROM submissions "
                "WHERE challenge_id=%s AND user_id=%s order by date_created desc limit 1",
                (challenge_id, user_id),
            )
            response = cursor.fetchone()
            if response and response[0] < SUBMISSION_DELAY:
                wait_time = SUBMISSION_DELAY - response[0]
                return api_response(429, {"seconds": wait_time})
            LOGGER.info("SUBMIT {} {} {}".format(user_id, challenge_id, flag))

            # Check to see if they've already solved the challenge
            cursor.execute(
                "SELECT 1 FROM solves where challenge_id=%s AND user_id=%s",
                (challenge_id, user_id),
            )
            response = cursor.fetchone()
            if response:
                return api_response(409, "challenge already solved")

            # Check if correct solution
            flag_hash = hashlib.sha256(flag.encode()).hexdigest()
            cursor.execute(
                "SELECT 1 FROM challenges WHERE id=%s AND flag_hash=%s",
                (challenge_id, flag_hash),
            )
            response = cursor.fetchone()

            # Allow a special flag in the development environment
            if not response and stage == "development" and flag == "OOO{DEV_VALID}":
                response = True

            if response:
                cursor.execute(
                    "INSERT INTO solves VALUES (now(), %s, %s);",
                    (challenge_id, user_id),
                )
                message = "success!"
                status = 201
            else:
                message = "incorrect flag"
                status = 400
                # Log submission
                #
                # Note: We only want to log incorrect submissions, this way the
                #       DB does not contain valid flags.
                try:
                    cursor.execute(
                        "INSERT INTO submissions VALUES (DEFAULT, "
                        "now(), %s, %s, %s);",
                        (user_id, challenge_id, flag),
                    )
                except psycopg2.IntegrityError:
                    return api_response(409, "invalid submission data")
        psql.commit()

    return api_response(status, message)


def test_email(_event, context):
    stage = "production" if "-production-" in context.function_name else "development"
    print("Sending test email in stage {}".format(stage))
    email = "OOO Debug <debug@oooverflow.io>"
    send_email(email, email, "[OOO] Debug Email", "", stage=stage)
    return api_response(200, "ok")


@validate(
    email=valid_email,
    nonce=valid_int,
    password=valid_password,
    timestamp=valid_timestamp,
)
@proof_of_work(["email", "password"], TOKEN_PROOF_OF_WORK)
def token(data, _stage):
    now = int(time.time())
    if now >= COMPETITION_END:
        return api_response(400, "the competition is over")

    email = data["email"]
    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            LOGGER.info("USER LOGIN {}".format(email))
            cursor.execute(
                "SELECT date_updated, id, team_name FROM users where "
                "date_confirmed IS NOT NULL AND "
                "lower(email)=%s AND password=crypt(%s, password);",
                (email.lower(), data["password"]),
            )
            response = cursor.fetchone()
    if not response:
        return api_response(401, "invalid credentials")

    access_payload = {
        "exp": min(COMPETITION_END, now + ACCESS_TOKEN_DURATION),
        "nbf": now,
        "token_type": "access",
        "user_id": response[1],
    }
    access_token = jwt.encode(
        access_payload, JWT_SECRET, algorithm="HS256"
    ).decode("utf-8")

    refresh_payload = {
        "exp": COMPETITION_END,
        "nbf": now,
        "token_type": "refresh",
        "user_id": response[1],
        "user_updated": datetime.timestamp(response[0]),
    }
    refresh_token = jwt.encode(
        refresh_payload, JWT_SECRET, algorithm="HS256"
    ).decode("utf-8")

    return api_response(
        200,
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "team": response[2],
        },
    )


@validate(token=valid_token("refresh"))
def token_refresh(data, _stage):
    payload = jwt.decode(data["token"], verify=False)
    now = int(time.time())

    updated = payload["user_updated"]
    user_id = payload["user_id"]

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            LOGGER.info("TOKEN REFRESH {}".format(payload["user_id"]))
            cursor.execute(
                "SELECT 1 FROM users where extract(epoch from date_updated)=%s AND id=%s;",
                (updated, user_id),
            )
            response = cursor.fetchone()
    if not response:
        return api_response(401, f"cannot find user({user_id}, {updated})")

    access_payload = {
        "exp": min(COMPETITION_END, now + ACCESS_TOKEN_DURATION),
        "nbf": now,
        "token_type": "access",
        "user_id": payload["user_id"],
    }
    access_token = jwt.encode(
        access_payload, JWT_SECRET, algorithm="HS256"
    ).decode("utf-8")

    return api_response(200, {"access_token": access_token})


@validate(id=valid_confirmation, validate_data=False)
def user_confirm(data, stage):
    confirmation_id = data["id"]
    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            LOGGER.info("CONFIRM: {}".format(confirmation_id))
            cursor.execute(
                "SELECT user_id FROM confirmations where id=%s;", (confirmation_id,)
            )
            response = cursor.fetchone()
            if not response:
                return api_response(
                    409, "invalid confirmation or confirmation already completed"
                )
            user_id = response[0]
            cursor.execute("DELETE FROM confirmations where id=%s;", (confirmation_id,))
            cursor.execute(
                "UPDATE users SET date_confirmed=now() where id=%s;", (user_id,)
            )
            cursor.execute("SELECT email FROM users where id=%s;", (user_id,))
            email = cursor.fetchone()[0]
        psql.commit()

        LOGGER.info("EMAIL: {}".format(email))
    body = (
        "Your registration to DEF CON 2019 CTF Quals is complete.\n\n"
        "https://scoreboard.oooverflow.io/\n"
    )
    send_email(
        "OOO Account Registration <accounts@oooverflow.io>",
        email,
        "[OOO] Registration Complete",
        body,
        stage=stage,
    )
    return api_response(200, "confirmation complete")


@extract_headers(app_url="origin")
@validate(
    ctf_time_team_id=valid_int_as_string,
    email=valid_email,
    nonce=valid_int,
    password=valid_password,
    team_name=valid_team,
    timestamp=valid_timestamp,
)
@proof_of_work(["email"], REGISTRATION_PROOF_OF_WORK)
def user_register(data, stage, app_url):
    team_id = data["ctf_time_team_id"]
    team_id = None if team_id == "" else int(team_id)
    email = data["email"]
    password = data["password"]
    team_name = data["team_name"]

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            LOGGER.info("USER REGISTER {}".format(email))
            try:
                cursor.execute(
                    "INSERT INTO users (id, date_created, date_updated, ctf_time_team_id, "
                    "email, password, team_name) VALUES (DEFAULT, now(), now(), %s, %s, "
                    "crypt(%s, gen_salt('bf', 10)), %s)",
                    (team_id, email, password, team_name),
                )
            except psycopg2.IntegrityError as exception:
                if "email" in exception.diag.constraint_name:
                    return api_response(409, "duplicate email")
                return api_response(409, "duplicate team name")
            cursor.execute("SELECT id FROM users where email=%s;", (email,))
            user_id = cursor.fetchone()[0]
            confirmation_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO confirmations (id, user_id) VALUES (%s, %s);",
                (confirmation_id, user_id),
            )
        psql.commit()

    confirmation_url = "{}/#/confirm/{}".format(app_url, confirmation_id)
    body = "Please confirm your account creation:\n\n{}\n".format(confirmation_url)
    send_email(
        "OOO Account Registration <accounts@oooverflow.io>",
        email,
        "[OOO] Please Confirm Your Registration",
        body,
        stage=stage,
    )
    return api_response(201)


def user_reset_password(event, _context):
    if not event:
        return api_response(422, "data must be provided")
    email = event.get("email", None)
    password = event.get("password", None)
    if not email or not password:
        return api_response(422, "both email and password must be set")
    if not valid_password(password):
        return api_response(422, "invalid password")

    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            cursor.execute(
                "UPDATE users set password=crypt(%s, gen_salt('bf', 10)) where lower(email)=%s;",
                (password, email.lower()),
            )
            if cursor.rowcount != 1:
                return api_response(422, "invalid email")
        psql.commit()
    return api_response(200, "password updated")


def users(_event, _context):
    with psql_connection(DB_PASSWORD, "scoreboard") as psql:
        with psql.cursor() as cursor:
            cursor.execute(
                "SELECT date_created, date_confirmed, email, ctf_time_team_id, team_name "
                "FROM users ORDER BY date_created;"
            )
            users = cursor.fetchall()
    if users:
        confirmed_users = len([x for x in users if x[1] is not None])
        unconfirmed_users = len(users) - confirmed_users
        print(f"  Confirmed Users: {confirmed_users}")
        if unconfirmed_users > 0:
            print(f"Unconfirmed Users: {unconfirmed_users}")
        print(f"Last {min(32, len(users))} Registered Users:")
        for user in users[-32:]:
            unconfirmed = "" if user[1] else "unconfirmed"
            created = str(user[0])[:19]
            print(
                f"{created} {unconfirmed:11s} {user[2]:32s} {str(user[3] or ''):>5s} {user[4]}"
            )
    return api_response(200)
