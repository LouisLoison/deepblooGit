


alter table dgmarket alter COLUMN dgmarketid drop not null;
update dgmarket set dgmarketid = null where dgmarketid=0;
create unique index if not exists dgmarket_dgmarketid_unique on dgmarket(dgmarketid);

create table tenders as select * from dgmarket limit 1000;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- alter table tenders rename id to old_id;
alter table tenders add column if not exists uuid UUID NOT NULL primary key DEFAULT uuid_generate_v4();
create unique index if not exists tenders_id_unique on tenders(id);
alter table tenders rename dgmarketId to datasourceid;
alter table tenders add column dataSource varchar;
alter table "user" add column if not exists uuid UUID NOT NULL DEFAULT uuid_generate_v4();
create unique index if not exists user_uuid_unique on "user"(uuid);

create table tenderimport as select * from importdgmarket limit 0;

alter table tenderimport rename dgmarketId to datasourceid;

alter table tenderimport add column dataSource varchar;
alter table tenderimport add column dataRaw json;
alter table tenderimport add column if not exists uuid UUID NOT NULL DEFAULT uuid_generate_v4();
alter table tenderimport add column if not exists tenderuuid UUID;
alter table tenderimport add column cpvDescriptions varchar;
alter table tenderimport add column cpvOrigines varchar;


create unique index if not exists source_id_import_unicity_key on tenderimport(dataSource, source_id);


create table tenderimport (
  id UUID primary key DEFAULT uuid_generate_v4(),
  
}
