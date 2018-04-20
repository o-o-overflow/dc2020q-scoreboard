import logging

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

MIGRATIONS = [
    ('CREATE TABLE users ('
     'id serial PRIMARY KEY, '
     'date_created timestamp with time zone NOT NULL, '
     'email varchar(320) NOT NULL, '
     'password char(60) NOT NULL'
     ');')
]


def latest_migration(psql):
    with psql.cursor() as cursor:
        LOGGER.info('Create schema_migrations if necessary')
        cursor.execute('CREATE TABLE IF NOT EXISTS schema_migrations ( '
                       'id integer PRIMARY KEY, '
                       'date_applied timestamp with time zone NOT NULL);')
        LOGGER.info("Find latest migration")
        cursor.execute('SELECT id from schema_migrations '
                       'ORDER BY id DESC  LIMIT 1;')
        return (cursor.fetchone() or (-1,))[0]


def reset(psql):
    with psql.cursor() as cursor:
        LOGGER.info('DROP TABLEs')
        cursor.execute('DROP TABLE schema_migrations, users;')


def run_migrations(psql):
    #  reset(psql)
    last = latest_migration(psql)
    if last + 1 >= len(MIGRATIONS):
        return last
    with psql.cursor() as cursor:
        for i, migration in enumerate(MIGRATIONS[last + 1:]):
            LOGGER.info('up: {}'.format(migration))
            cursor.execute(migration)
            cursor.execute('INSERT INTO schema_migrations VALUES (%s, now());',
                           (last + 1 + i,))
    return last + 1 + i
