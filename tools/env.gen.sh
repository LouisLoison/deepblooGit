#!/bin/bash
#set -xe
TOPLEVEL=`git rev-parse --show-toplevel`
[ -z $NODE_ENV ] && NODE_ENV=dev
export TOPLEVEL NODE_ENV

CONFIG_FILE=$TOPLEVEL/cdk/lib/config.dev.ts   # Default value
[ -e $TOPLEVEL/cdk/lib/config.$NODE_ENV.ts ] && CONFIG_FILE=$TOPLEVEL/cdk/lib/config.$NODE_ENV.ts

`cat $CONFIG_FILE  |grep '^  '|sed "s/ *: *'/=/"|sed 's/^ *//'| sed "s/',$//" |grep '^[A-Z]' |sed 's/^/export /'`
