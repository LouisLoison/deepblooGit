LOAD DATABASE
FROM mysql://deepbloo:deepbloo@localhost/deepbloo
INTO pgsql://deepbloo:secret@localhost/deepbloo
WITH schema only -- , quote identifiers
alter schema 'deepbloo' rename to 'public'
CAST type datetime to timestamp;

LOAD DATABASE
FROM mysql://deepbloo:deepbloo@localhost/deepbloo
INTO pgsql://deepbloo:secret@localhost/deepbloo
-- WITH quote identifiers
including only table names matching ~/cpv/, 'user', 'organization', 'tenderfilter', 'tenderdetail', 'tendergrouplink', 'tendergroup', 'document'
alter schema 'deepbloo' rename to 'public'
CAST type datetime to timestamp;

LOAD DATABASE
FROM mysql://deepbloo:deepbloo@localhost/deepbloo
INTO pgsql://deepbloo:secret@localhost/deepbloo
-- WITH quote identifiers
with batch rows = 50, prefetch rows = 250
including only table names matching 'dgmarket'
alter schema 'deepbloo' rename to 'public'
CAST type datetime to timestamp;

-- create unique index dgmarket_dgmarketid_unique on dgmarket(dgmarketid) where dgmarketid >0;
