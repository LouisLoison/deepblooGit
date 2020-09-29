LOAD DATABASE
FROM mysql://deepbloo:deepbloo@localhost/deepbloo
INTO pgsql://deepbloo:secret@localhost/deepbloo
with batch rows = 500, prefetch rows = 2500
alter schema 'deepbloo' rename to 'public'
CAST type datetime to timestamp;

-- create unique index dgmarket_dgmarketid_unique on dgmarket(dgmarketid) where dgmarketid >0;
-- alter table dgmarket alter COLUMN dgmarketid drop not null;
SET search_path TO public;
