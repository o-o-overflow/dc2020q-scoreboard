from functools import wraps
import hashlib
import time

from const import TIMESTAMP_MAX_DELTA, TOKEN_PROOF_OF_WORK
from helper import api_response, log_request, parse_json_request


def callback_submit_proof_of_work(digest, data):
    if data["challenge_id"].startswith("speedrun-0"):
        return digest.startswith("abc")
    else:
        return digest.startswith(TOKEN_PROOF_OF_WORK)


def extract_headers(**headers):
    def initial_wrap(function):
        @wraps(function)
        def wrapped(event, _context):
            result = {}
            for variable, header in headers.items():
                result[variable] = event["headers"].get(header, None)
                if not result[variable]:
                    return api_response(422, "{} header missing".format(header))
            return function(event, **result)

        return wrapped

    return initial_wrap


def proof_of_work(fields, prefix):
    fields.extend(["timestamp", "nonce"])

    def initial_wrap(function):
        @wraps(function)
        def wrapped(data, stage, **headers):
            message = "!".join([str(data[x]) for x in fields])
            digest = hashlib.sha256(message.encode()).hexdigest()

            passed = False
            if callable(prefix):
                passed = prefix(digest, data)
            else:
                passed = digest.startswith(prefix)

            if not passed:
                return api_response(422, "incorrect nonce")
            del data["nonce"]
            del data["timestamp"]
            return function(data, stage, **headers)

        return wrapped

    return initial_wrap


def valid_challenge_id(challenge_id, _stage):
    return isinstance(challenge_id, str) and 1 <= len(challenge_id) <= 32


def valid_confirmation(confirmation, _stage):
    return isinstance(confirmation, str) and len(confirmation) == 36


def valid_email(email, _stage):
    return (
        isinstance(email, str)
        and 6 <= len(email) <= 320
        and "@" in email
        and "." in email
        and " " not in email
    )


def valid_flag(flag, _stage):
    return isinstance(flag, str) and 1 <= len(flag) <= 160


def valid_int(data, _stage):
    return isinstance(data, int)


def valid_int_as_string(value, _stage):
    if value == "":
        return True
    if not isinstance(value, str) or not value.isnumeric():
        return False
    return 1 <= int(value) <= 1000000


def valid_password(password, _stage):
    return isinstance(password, str) and 10 <= len(password) <= 72


def valid_team(team, _stage):
    return isinstance(team, str) and 0 < len(team) <= 80


def valid_timestamp(timestamp, _stage):
    if not isinstance(timestamp, int):
        return "invalid timestamp"
    now = int(time.time())
    if timestamp - 30 > now:
        return "POW timestamp is ahead of server time by {} second(s)".format(
            30 + timestamp - now
        )
    if now - timestamp > TIMESTAMP_MAX_DELTA:
        return "POW timestamp expired {} second(s) ago".format(
            now - timestamp - TIMESTAMP_MAX_DELTA
        )
    return True


def validate(validate_data=True, **validators):
    def initial_wrap(function):
        @wraps(function)
        def wrapped(event, _context=None, **headers):
            if validate_data:
                data = parse_json_request(event)
            else:
                data = event["pathParameters"]
            if data is None:
                return api_response(422, "invalid request")

            log_request(data)

            stage = event["requestContext"]["stage"]

            parameters = {}
            for parameter, validator in validators.items():
                result = validator(data.get(parameter), stage)
                if result is False:
                    return api_response(422, "invalid {}".format(parameter))
                elif isinstance(result, dict):
                    return api_response(**result)
                elif not isinstance(result, bool):
                    return api_response(422, result)
                parameters[parameter] = data[parameter]
                del data[parameter]
            if data:
                return api_response(422, "unexpected {}".format(list(data)[0]))
            return function(parameters, stage, **headers)

        return wrapped

    return initial_wrap
