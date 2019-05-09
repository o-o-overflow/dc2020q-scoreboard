#!/bin/sh
JSON_FILE="../../dc2019q-chalmanager/scoreboard.json"

if [ ! -f "$JSON_FILE" ]; then
	echo "Error, unable to find the scoreboard file $JSON_FILE" 1>&2
	exit 1
fi
sls invoke -lf challenges_add --path "$JSON_FILE"

for challenge in $(cat "$JSON_FILE" | grep '"id"' | cut -d'"' -f 4); do
    sls invoke -lf challenge_open -d "{\"id\": \"$challenge\" }"
done
