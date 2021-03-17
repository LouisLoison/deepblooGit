#!/bin/bash
#set -xe
TOPLEVEL=`git rev-parse --show-toplevel`
[ -z $NODE_ENV ] && NODE_ENV=dev
export TOPLEVEL NODE_ENV

export DB_SECRET=arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx
export DB_HOST=serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com
export APPSEARCH_ENDPOINT=https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/
export APPSEARCH_SECRET=arn:aws:secretsmanager:eu-west-1:669031476932:secret:appsearch-TZnQcu
export ELASTIC_SECRET=arn:aws:secretsmanager:eu-west-1:669031476932:secret:elastic-fnVFZr
export DOCUMENTS_BUCKET=textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj
export HIVEBRITE_SECRET=arn:aws:secretsmanager:eu-west-1:669031476932:secret:hivebrite-tayvUB
