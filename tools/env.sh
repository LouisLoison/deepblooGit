#!/bin/bash
#set -xe
TOPLEVEL=`git rev-parse --show-toplevel`
[ -z $NODE_ENV ] && NODE_ENV=dev
export TOPLEVEL NODE_ENV

`cat $TOPLEVEL/cdk/lib/config.ts  |grep '^  '|sed "s/ *: *'/=/"|sed 's/^ *//'| sed "s/',$//" |grep '^[A-Z]' |sed 's/^/export /'`

APPSEARCH_PRIVATE=`aws secretsmanager get-secret-value --secret-id $APPSEARCH_SECRET |jq -r '.SecretString | fromjson | .appsearchPrivateKey'`
