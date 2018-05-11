#!/bin/bash

if [ "$#" -ne 1 ]; then
	echo "usage: $0 <challenge_id>"
	exit -1
fi


CHALLENGE_ID=$1

if [ ! -e "../../challs-manager/cloned_repos/chall-$CHALLENGE_ID" ]
then
	echo "Error, '$CHALLENGE_ID' is not a valid challenge id"
	exit -1
fi

sls invoke -lf challenge_open -d "{\"id\": \"$CHALLENGE_ID\" }" --stage prod
