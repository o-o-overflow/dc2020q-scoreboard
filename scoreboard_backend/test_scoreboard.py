from __future__ import print_function
import hashlib
import time

import pytest
import requests

from const import TIMESTAMP_MAX_DELTA


BASE_URL = {
    'dev': 'https://bv30jcdr5b.execute-api.us-east-2.amazonaws.com/dev'}
PATHS = {'challenge': 'challenge/{id}/{token}', 'challenges': 'challenges',
         'submit': 'submit', 'token': 'token',
         'user_confirm': 'user_confirm/{id}', 'user_register': 'user_register'}

SUCCESS_EMAIL = 'a{}@a.co'.format(int(time.time()))


def assert_failure(response, message, status=422):
    assert response.status_code == status
    data = response.json()
    assert set(data.keys()) == {'message', 'success'}
    assert not data['success']
    assert data['message'] == message


def compute_nonce(message, prefix):
    nonce = -1
    sha = ''
    timestamp = int(time.time())
    while not sha.startswith(prefix):
        nonce += 1
        sha = hashlib.sha256('{}!{}!{}'.format(message, timestamp, nonce)
                             .encode()).hexdigest()
    return nonce, timestamp


@pytest.fixture(params=[None, 1, '', 'a' * 33])
def invalid_challenge_id(request):
    return request.param


@pytest.fixture(params=['', 'a' * 33])
def invalid_challenge_id_for_url(request):
    return request.param


@pytest.fixture(params=[None, 1, 'a' * 35, 'a' * 37])
def invalid_confirmation_id(request):
    return request.param


@pytest.fixture(params=[None, 1, '', 'a@a.c', 'aa.com', 'a@acom',
                        '{}@a.c'.format('a' * 317)])
def invalid_email(request):
    return request.param


@pytest.fixture(params=[None, 1, '', 'a' * 161])
def invalid_flag(request):
    return request.param


@pytest.fixture(params=[None, '', '0'])
def invalid_int(request):
    return request.param


@pytest.fixture(params=[None, 1, '', 'a' * 9, 'a' * 73])
def invalid_password(request):
    return request.param


@pytest.fixture(params=[None, 1, '0', '100001'])
def invalid_team_id(request):
    return request.param


@pytest.fixture(params=[None, 1, '', 'a' * 81])
def invalid_team_name(request):
    return request.param


@pytest.fixture(params=[None, '', '0'])
def invalid_timestamp(request):
    return request.param


@pytest.fixture(params=[None, '', 1])
def invalid_token(request):
    return request.param


@pytest.fixture(params=[None, 1])
def invalid_token_for_url(request):
    return request.param


def request_token(stage):
    email = 'bb@bb.comm'
    password = 'bb@bb.comm'

    nonce, timestamp = compute_nonce('{}!{}'.format(email, password), '00c7f')
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': password,
        'timestamp': timestamp})
    assert response.status_code == 200
    data = response.json()
    assert data['success']
    assert data['message']['team']
    token = data['message']['token']
    assert len(token) == 144
    assert token.count('.') == 2
    return token


@pytest.fixture
def stage():
    return 'dev'


def test_challenge(stage):
    token = request_token(stage)
    challenge_url = url('challenge', stage, id='mario', token=token)
    response = requests.get(challenge_url)
    assert response.status_code == 200
    assert '\n\nFiles:\n * ' in response.json()['message']


def test_challenge__invalid_challenge_id(invalid_challenge_id_for_url, stage):
    token = 'X'  # Does not matter
    challenge_url = url('challenge', stage, id=invalid_challenge_id_for_url,
                        token=token)
    response = requests.get(challenge_url)
    assert_failure(response, 'invalid id')


def test_challenge__invalid_token(invalid_token_for_url, stage):
    challenge_url = url('challenge', stage, id='mario',
                        token=invalid_token_for_url)
    response = requests.get(challenge_url)
    assert_failure(response, 'invalid token')


def test_challenge__nonexistent_challenge_id(stage):
    token = request_token(stage)
    challenge_url = url('challenge', stage, id='WRONG', token=token)
    response = requests.get(challenge_url)
    assert response.status_code == 404


def test_challenges(stage):
    response = requests.get(url('challenges', stage))
    assert response.status_code == 200
    data = response.json()['message']
    assert 'open' in data
    assert 'solves' in data
    assert 'unopened_by_category' in data


@pytest.mark.slow
def test_submit(stage):
    challenge_id = 'mario'
    flag = 'INCORRECT'
    token = request_token(stage)
    nonce, timestamp = compute_nonce(
        '{}!{}!{}'.format(challenge_id, flag, token), '00c7f')
    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    print(response.json())
    assert_failure(response, 'incorrect flag', status=400)

    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert response.status_code == 429
    wait_time = response.json()['message']['seconds']
    assert 0 < wait_time < 60
    time.sleep(wait_time)  # Wait long enough so rate limit isn't hit again

    flag = 'OOO{MARIOFLAG}'
    nonce, timestamp = compute_nonce(
        '{}!{}!{}'.format(challenge_id, flag, token), '00c7f')
    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert response.status_code == 201
    assert response.json()['message'] == 'success!'

    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert response.status_code == 429
    wait_time = response.json()['message']['seconds']
    assert 0 < wait_time < 60
    time.sleep(wait_time)  # Wait long enough so rate limit isn't hit again

    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert_failure(response, 'challenge already solved', status=409)

    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert response.status_code == 429
    wait_time = response.json()['message']['seconds']
    assert 0 < wait_time < 60
    time.sleep(wait_time)  # Wait long enough so rate limit isn't hit again


def test_submit__invalid_challenge_id(invalid_challenge_id, stage):
    flag = 'something fun'
    nonce = 0  # Does not matter
    timestamp = int(time.time())
    token = ''  # Does not matter
    response = requests.post(url('submit', stage), json={
        'challenge_id': invalid_challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert_failure(response, 'invalid challenge_id')


def test_submit__invalid_flag(invalid_flag, stage):
    challenge_id = 'mario'
    nonce = 0  # Does not matter
    timestamp = int(time.time())
    token = ''  # Does not matter
    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': invalid_flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert_failure(response, 'invalid flag')


def test_submit__invalid_nonce(invalid_int, stage):
    challenge_id = 'mario'
    flag = 'a' * 160
    timestamp = int(time.time())
    token = ''  # Does not matter
    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': invalid_int,
        'token': token, 'timestamp': timestamp})
    assert_failure(response, 'invalid nonce')


def test_submit__invalid_token(invalid_token, stage):
    challenge_id = 'mario'
    flag = 'a'
    nonce = 0  # Does not matter
    timestamp = int(time.time())
    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': invalid_token, 'timestamp': timestamp})
    assert_failure(response, 'invalid token')


def test_submit__invalid_timestamp(invalid_timestamp, stage):
    challenge_id = 'mario'
    flag = 'a'
    nonce = 0  # Does not matter
    token = ''  # Does not matter
    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': invalid_timestamp})
    assert_failure(response, 'invalid timestamp')


@pytest.mark.slow
def test_submit__nonexistent_challenge_id(stage):
    challenge_id = 'a'
    flag = 'something fun'
    token = request_token(stage)
    nonce, timestamp = compute_nonce(
        '{}!{}!{}'.format(challenge_id, flag, token), '00c7f')
    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert_failure(response, 'invalid submission data', status=409)

    response = requests.post(url('submit', stage), json={
        'challenge_id': challenge_id, 'flag': flag, 'nonce': nonce,
        'token': token, 'timestamp': timestamp})
    assert response.status_code == 429
    wait_time = response.json()['message']['seconds']
    assert 0 < wait_time < 60
    time.sleep(wait_time)  # Wait long enough so rate limit isn't hit again


def test_token_with_extra_parameter(stage):
    email = 'a@a.co'
    nonce = 0  # Doesn't need to be valid
    password = 'a' * 10
    timestamp = int(time.time())
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': password,
        'timestamp': timestamp, 'x': 1})
    assert_failure(response, 'unexpected x')


def test_token_with_expired_timestamp(stage):
    email = 'a@a.co'
    nonce = 0  # Doesn't need to be valid
    password = 'a' * 10
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': password,
        'timestamp': int(time.time()) - TIMESTAMP_MAX_DELTA - 1})
    assert_failure(response, 'timestamp has expired')


def test_token_with_future_timestamp(stage):
    email = 'a@a.co'
    nonce = 0  # Doesn't need to be valid
    password = 'a' * 10
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': password,
        'timestamp': int(time.time()) + 60})
    assert_failure(response, 'timestamp is too recent')


def test_token_with_incorrect_nonce(stage):
    email = 'a@a.co'
    nonce = 0
    password = 'a' * 10
    timestamp = int(time.time())
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': password,
        'timestamp': timestamp})
    assert_failure(response, 'incorrect nonce')


def test_token_with_invalid_email(invalid_email, stage):
    nonce = 0  # Doesn't need to be valid
    password = 'a' * 10
    timestamp = int(time.time())
    response = requests.post(url('token', stage), json={
        'email': invalid_email, 'nonce': nonce, 'password': password,
        'timestamp': timestamp})
    assert_failure(response, 'invalid email')


def test_token_with_invalid_nonce(invalid_int, stage):
    email = 'a@a.co'
    nonce = invalid_int
    password = 'a' * 10
    timestamp = int(time.time())
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': password,
        'timestamp': timestamp})
    assert_failure(response, 'invalid nonce')


def test_token_with_invalid_password(invalid_password, stage):
    email = 'a@a.co'
    nonce = 0  # Doesn't need to be valid
    timestamp = int(time.time())
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': invalid_password,
        'timestamp': timestamp})
    assert_failure(response, 'invalid password')


def test_token_with_invalid_timestamp(invalid_timestamp, stage):
    email = 'a@a.co'
    nonce = 0  # Doesn't need to be valid
    password = 'a' * 10
    response = requests.post(url('token', stage), json={
        'email': email, 'nonce': nonce, 'password': password,
        'timestamp': invalid_timestamp})
    assert_failure(response, 'invalid timestamp')


def test_user_confirm_with_incorrect_confirmation_id(stage):
    confirmation_url = url('user_confirm', stage, id='a' * 36)
    response = requests.get(confirmation_url)
    assert_failure(response, 'invalid confirmation or confirmation already '
                   'completed', status=409)


def test_user_confirm_with_invalid_confirmation_id(invalid_confirmation_id,
                                                   stage):
    confirmation_url = url('user_confirm', stage, id=invalid_confirmation_id)
    response = requests.get(confirmation_url)
    assert_failure(response, 'invalid id')


@pytest.mark.slow
def test_user_register(stage):
    ctf_time_team_id = '1'
    email = SUCCESS_EMAIL
    password = 'a' * 10
    nonce, timestamp = compute_nonce(email, '000c7f')
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': nonce, 'password': password, 'team_name': email,
            'timestamp': timestamp})
    assert response.status_code == 201


@pytest.mark.slow
def test_user_register_fail_with_duplicate_email(stage):
    ctf_time_team_id = '1'
    email = SUCCESS_EMAIL
    password = 'a' * 10
    nonce, timestamp = compute_nonce(email, '000c7f')
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': nonce, 'password': password, 'team_name': email + 'm',
            'timestamp': timestamp})
    assert_failure(response, 'duplicate email', status=409)


@pytest.mark.slow
def test_user_register_fail_with_duplicate_team_name(stage):
    ctf_time_team_id = '1'
    email = SUCCESS_EMAIL + 'm'
    password = 'a' * 10
    nonce, timestamp = compute_nonce(email, '000c7f')
    team_name = SUCCESS_EMAIL
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': nonce, 'password': password, 'team_name': team_name,
            'timestamp': timestamp})
    assert_failure(response, 'duplicate team name', status=409)


def test_user_register_with_invalid_ctf_time_team_id(invalid_team_id, stage):
    email = 'a@a.co'
    nonce = 0  # Doesn't need to be valid
    password = 'a' * 10
    team_name = 'A'
    timestamp = int(time.time())
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': invalid_team_id, 'email': email,
            'nonce': nonce, 'password': password, 'team_name': team_name,
            'timestamp': timestamp})
    assert_failure(response, 'invalid ctf_time_team_id')


def test_user_register_with_invalid_email(invalid_email, stage):
    ctf_time_team_id = '1'
    nonce = 0  # Doesn't need to be valid
    password = 'a' * 10
    team_name = 'A'
    timestamp = int(time.time())
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': invalid_email,
            'nonce': nonce, 'password': password, 'team_name': team_name,
            'timestamp': timestamp})
    assert_failure(response, 'invalid email')


def test_user_register_with_invalid_nonce(invalid_int, stage):
    ctf_time_team_id = '1'
    email = 'a@a.co'
    password = 'a' * 10
    team_name = 'A'
    timestamp = int(time.time())
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': invalid_int, 'password': password,
            'team_name': team_name, 'timestamp': timestamp})
    assert_failure(response, 'invalid nonce')


def test_user_register_with_invalid_password(invalid_password, stage):
    ctf_time_team_id = '1'
    email = 'a@a.co'
    nonce = 0  # Doesn't need to be valid
    team_name = 'A'
    timestamp = int(time.time())
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': nonce, 'password': invalid_password, 'team_name':
            team_name, 'timestamp': timestamp})
    assert_failure(response, 'invalid password')


def test_user_register_with_invalid_team_name(invalid_team_name, stage):
    ctf_time_team_id = '1'
    email = 'a@a.co'
    password = 'a' * 10
    nonce = 0  # Doesn't need to be valid
    timestamp = int(time.time())
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': nonce, 'password': password,
            'team_name': invalid_team_name, 'timestamp': timestamp})
    assert_failure(response, 'invalid team_name')


def test_user_register_with_invalid_timestamp(invalid_timestamp, stage):
    ctf_time_team_id = '1'
    email = 'a@a.co'
    password = 'a' * 10
    nonce = 0  # Doesn't need to be valid
    team_name = 'A'
    response = requests.post(
        url('user_register', stage), headers={'origin': 'a'}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': nonce, 'password': password, 'team_name': team_name,
            'timestamp': invalid_timestamp})
    assert_failure(response, 'invalid timestamp')


def test_user_register_with_missing_origin_header(stage):
    ctf_time_team_id = '1'
    email = 'a@a.co'
    password = 'a' * 10
    nonce = 0  # Doesn't need to be valid
    team_name = 'A'
    timestamp = int(time.time())
    response = requests.post(
        url('user_register', stage), headers={'origin': ''}, json={
            'ctf_time_team_id': ctf_time_team_id, 'email': email,
            'nonce': nonce, 'password': password, 'team_name': team_name,
            'timestamp': timestamp})
    assert_failure(response, 'origin header missing')


def url(action, stage, **path_params):
    return '{}/{}'.format(BASE_URL[stage], PATHS[action].format(**path_params))
