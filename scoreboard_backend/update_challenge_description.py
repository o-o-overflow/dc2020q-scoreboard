#!/usr/bin/env python
from __future__ import print_function
import pg
import json
import sys
import getpass

import sshtunnel

DB_HOST = 'scoreboard-dev.cgwgx6ftjwg2.us-east-2.rds.amazonaws.com'

def main():

        print("THIS IS ALL FOR DEV, FIX THIS LATER FOR THE REAL GAME")

        challenge_id = sys.argv[1]

        scoreboard = json.load(open("../../challs-manager/scoreboard.json", 'r'))

        challenge = None
        for c in scoreboard:
            if c['id'] == challenge_id:
                challenge = c
        if not challenge:
            print("ERROR, could not find", challenge_id)
            return
        
        with sshtunnel.SSHTunnelForwarder(("18.191.38.52", 22),
                                ssh_username='ec2-user',
                                remote_bind_address=(DB_HOST, 5432),
                                local_bind_address=('localhost', 5555)):

            db_password = getpass.getpass('gimme DB user password: ')
            conn = pg.connect('scoreboard', 'localhost', 5555, None, 'scoreboard', db_password)

            result = conn.query("select id from challenges where id = $1 limit 1",
                                (challenge_id,)).dictresult()

            print(result)
            
            table_name = ''
            if result:
                table_name = "challenges"
            else:
                table_name = "unopened_challenges"

            result = conn.query("update " + table_name + " set description = $1 where id = $2",
                                (challenge['description'], challenge_id))

            print(result)


if __name__ == '__main__':
    main()
