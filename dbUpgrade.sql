


--alter table dgmarket alter COLUMN dgmarketid drop not null;
--update dgmarket set dgmarketid = null where dgmarketid=0;
--create unique index if not exists dgmarket_dgmarketid_unique on dgmarket(dgmarketid);

alter table dgmarket rename to tenders;
--create table tenders as select * from dgmarket limit 1000;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create sequence tenders_id_seq;
alter table tenders alter column id set default nextval('tenders_id_seq');
select setval('tenders_id_seq',  (SELECT MAX(id) FROM tenders));

-- alter table tenders rename id to old_id;
alter table tenders add column if not exists uuid UUID NOT NULL  DEFAULT uuid_generate_v4();
create unique index if not exists tenders_uuid_unique on tenders(uuid);
alter table tenders rename dgmarketId to datasourceid;
alter table tenders add column dataSource varchar;
alter table tenders alter column sourceUrl type varchar[] using regexp_split_to_array(sourceUrl,',');
alter table tenders alter column publicationdate type date using (substring(publicationdate, 1, 4) || '-' || substring(publicationdate, 5, 2) ||'-' || substring(publicationdate, 7, 2))::date ;

update tenders set biddeadlinedate = NULL where biddeadlinedate=''; -- 19673 updates

alter table tenders alter column biddeadlinedate type date using (substring(biddeadlinedate, 1, 4) || '-' || substring(biddeadlinedate, 5, 2) ||'-' || substring(biddeadlinedate, 7, 2))::date ;


alter table "user" add column if not exists uuid UUID NOT NULL DEFAULT uuid_generate_v4();
create unique index if not exists user_uuid_unique on "user"(uuid);

alter table importdgmarket rename to tenderimport;

-- create table tenderimport as select * from importdgmarket limit 0;

alter table tenderimport rename importdgmarketid to tenderimportid;
create sequence tenderimport_id_seq;
alter table tenderimport alter column tenderimportid set default nextval('tenderimport_id_seq');
select setval('tenderimport_id_seq',  (SELECT MAX(tenderimportid) FROM tenderimport));

alter table tenderimport rename dgmarketId to datasourceid;

alter table tenderimport add column dataSource varchar;
alter table tenderimport add column dataRaw json;
alter table tenderimport add column if not exists uuid UUID NOT NULL DEFAULT uuid_generate_v4();
alter table tenderimport add column if not exists tenderuuid UUID;
update tenderimport set tenderuuid=tenders.uuid from tenders where tenderimport.tenderid=tenders.id;

alter table tenderimport add column cpvDescriptions varchar;
alter table tenderimport add column cpvsOrigine varchar;
alter table tenderimport alter column sourceUrl type varchar[] using regexp_split_to_array(sourceUrl,',');
alter table tenderimport alter column publicationdate type date using (substring(publicationdate, 1, 4) || '-' || substring(publicationdate, 5, 2) ||'-' || substring(publicationdate, 7, 2))::date ;

update tenderimport set biddeadlinedate = NULL where biddeadlinedate=''; -- 35248 updates 
alter table tenderimport alter column biddeadlinedate type date using (substring(biddeadlinedate, 1, 4) || '-' || substring(biddeadlinedate, 5, 2) ||'-' || substring(biddeadlinedate, 7, 2))::date ;

create unique index if not exists source_id_import_unicity_key on tenderimport(dataSource, dataSourceId);

alter table tenderCriterion add column if not exists tenderuuid UUID;
update tenderCriterion set tenderuuid=tenders.uuid from tenders where tenderCriterion.tenderid=tenders.id;

alter table tenderCriterionCpv add column if not exists tenderuuid UUID;
update tenderCriterionCpv set tenderuuid=tenders.uuid from tenders where tenderCriterionCpv.tenderid=tenders.id;
