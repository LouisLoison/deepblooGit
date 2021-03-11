LOAD DATABASE
FROM mysql://admin:secret@database-deepbloo-prd.cxvdonhye3yz.eu-west-1.rds.amazonaws.com/deepbloo
INTO pgsql://deepbloo:secret@localhost/deepbloo
with batch rows = 500, prefetch rows = 2500
alter schema 'deepbloo' rename to 'public'
CAST type datetime to timestamp;

-- use with
-- sudo docker run --rm -v $PWD:/opt:ro,delegated --network local_default --name pgloader dimitri/pgloader:latest pgloader /opt/pgloader-local.cmd


