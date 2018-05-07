#!/bin/sh
sls invoke -lf challenges_set --path ../../challs-manager/scoreboard.json

for challenge in $(cat ../../challs-manager/scoreboard.json | grep '"id"' | cut -d'"' -f 4); do
    sls invoke -lf challenge_open -d "{\"id\": \"$challenge\" }"
done
