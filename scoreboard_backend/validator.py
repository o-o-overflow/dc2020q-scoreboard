from functools import wraps
import hashlib
import time

from const import TIMESTAMP_MAX_DELTA
from helper import api_response, log_request, parse_json_request


def proof_of_work(fields, prefix):
    fields.extend(['timestamp', 'nonce'])

    def initial_wrap(function):
        @wraps(function)
        def wrapped(data, stage):
            message = '!'.join([str(data[x]) for x in fields])
            digest = hashlib.sha256(message.encode()).hexdigest()
            if not digest.startswith(prefix):
                return api_response(422, 'incorrect nonce')
            del data['nonce']
            del data['timestamp']
            return function(data, stage)
        return wrapped
    return initial_wrap


def valid_email(email):
    return isinstance(email, str) and 6 <= len(email) <= 320 and \
        '@' in email and '.' in email


def valid_int(data):
    return isinstance(data, int)


def valid_password(password):
    return isinstance(password, str) and 10 <= len(password) <= 72


def valid_timestamp(timestamp):
    if not isinstance(timestamp, int):
        return 'invalid timestamp'
    now = int(time.time())
    if timestamp > now:
        return 'timestamp is too recent'
    if now - timestamp > TIMESTAMP_MAX_DELTA:
        return 'timestamp has expired'
    return True


def validate(**parameter_validators):
    def initial_wrap(function):
        @wraps(function)
        def wrapped(event, _context):
            data = parse_json_request(event)
            if data is None:
                return api_response(422, 'invalid request')

            log_request(data)

            parameters = {}
            for parameter, validator in parameter_validators.items():
                result = validator(data.get(parameter))
                if result is False:
                    return api_response(422, 'invalid {}'.format(parameter))
                elif not isinstance(result, bool):
                    return api_response(422, result)
                parameters[parameter] = data[parameter]
                del data[parameter]
            if data:
                return api_response(422, 'unexpected {}'
                                    .format(data.keys()[0]))
            return function(parameters, event['requestContext']['stage'])
        return wrapped
    return initial_wrap
