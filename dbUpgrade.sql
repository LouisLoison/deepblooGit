


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
--alter table tenders add column if not exists uuid UUID NOT NULL  DEFAULT uuid_generate_v4();
alter table tenders alter column tenderuuid type UUID USING tenderuuid::uuid;
alter table tenders alter column tenderuuid set DEFAULT uuid_generate_v4();
update tenders set tenderuuid = uuid_generate_v4() where tenderuuid is null; -- 618467 updates

alter table tenders alter column tenderuuid set NOT NULL;
create unique index if not exists tenders_tenderuuid_unique on tenders(tenderuuid);

alter table tenders rename dgmarketId to datasourceid;
alter table tenders add column dataSource varchar;
alter table tenders alter column sourceUrl type varchar[] using regexp_split_to_array(sourceUrl,',');
alter table tenders alter column publicationdate type date using (substring(publicationdate, 1, 4) || '-' || substring(publicationdate, 5, 2) ||'-' || substring(publicationdate, 7, 2))::date ;

update tenders set biddeadlinedate = NULL where biddeadlinedate=''; -- 19673 updates

alter table tenders alter column biddeadlinedate type date using (substring(biddeadlinedate, 1, 4) || '-' || substring(biddeadlinedate, 5, 2) ||'-' || substring(biddeadlinedate, 7, 2))::date ;


alter table "user" add column if not exists uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4();
-- create unique index if not exists user_uuid_unique on "user"(uuid);

alter table importdgmarket rename to tenderimport;

-- create table tenderimport as select * from importdgmarket limit 0;

alter table tenderimport rename importdgmarketid to tenderimportid;
create sequence tenderimport_id_seq;
alter table tenderimport alter column tenderimportid set default nextval('tenderimport_id_seq');
select setval('tenderimport_id_seq',  (SELECT MAX(tenderimportid) FROM tenderimport));

alter table tenderimport rename dgmarketId to datasourceid;

alter table tenderimport add column dataSource varchar;
alter table tenderimport add column dataRaw json;
alter table tenderimport add column if not exists uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4();
-- create unique index if not exists tenderimport_uuid_unique on tenderimport(uuid);

alter table tenderimport add column if not exists tenderuuid UUID;
update tenderimport set tenderuuid=tenders.tenderuuid from tenders where tenderimport.tenderid=tenders.id;

alter table tenderimport add column cpvDescriptions varchar;
alter table tenderimport add column cpvsOrigine varchar;
alter table tenderimport alter column sourceUrl type varchar[] using regexp_split_to_array(sourceUrl,',');
alter table tenderimport alter column publicationdate type date using (substring(publicationdate, 1, 4) || '-' || substring(publicationdate, 5, 2) ||'-' || substring(publicationdate, 7, 2))::date ;

update tenderimport set biddeadlinedate = NULL where biddeadlinedate=''; -- 35248 updates 
alter table tenderimport alter column biddeadlinedate type date using (substring(biddeadlinedate, 1, 4) || '-' || substring(biddeadlinedate, 5, 2) ||'-' || substring(biddeadlinedate, 7, 2))::date ;

create unique index if not exists source_id_import_unicity_key on tenderimport(dataSource, dataSourceId);

alter table tenderCriterion add column if not exists tenderuuid UUID;
update tenderCriterion set tenderuuid=tenders.tenderuuid from tenders where tenderCriterion.tenderid=tenders.id;
-- alter table tenderCriterion  drop column tenderid;

create sequence tendercriterion_id_seq;
alter table tendercriterion alter column tendercriterionid set default nextval('tendercriterion_id_seq');
select setval('tendercriterion_id_seq',  (SELECT MAX(tendercriterionid) FROM tendercriterion));


alter table tenderCriterionCpv add column if not exists tenderuuid UUID;
update tenderCriterionCpv set tenderuuid=tenders.tenderuuid from tenders where tenderCriterionCpv.tenderid=tenders.id;
-- alter table tenderCriterionCpv  drop column tenderid;
create unique index tendercriterioncpv_cpvid_scope_tenderuuid_unique on tendercriterioncpv(cpvid, scope, tenderuuid);
alter table tenderCriterionCpv  drop column tenderCriterionCpvId;
create index tenderCriterionCpv_tenderuuid_index on tendercriterioncpv(tenderuuid);

alter table document add column if not exists tenderuuid UUID; 
update document set tenderuuid=tenders.tenderuuid from tenders where document.tenderid=tenders.id;
alter table document add column if not exists documentuuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4();
alter table document add column contenthash varchar unique;

alter table documentMessage add column if not exists  documentuuid UUID;
update documentMessage set documentuuid=document.documentuuid from document where documentMessage.documentid = document.documentid;
alter table documentMessage drop column documentid;

alter table tenderCriterion add column if not exists  documentuuid UUID;
update tenderCriterion  set documentuuid=document.documentuuid from document where tenderCriterion.documentid = document.documentid;
alter table tenderCriterion  drop column documentid;

alter table tenderCriterionCpv add column if not exists  documentuuid UUID;
update tenderCriterionCpv  set documentuuid=document.documentuuid from document where tenderCriterionCpv.documentid = document.documentid;
alter table tenderCriterionCpv  drop column documentid;

alter table tendercriterion add column entity varchar;
alter table tendercriterion add column numericvalue numeric;

create table tendercriteriondocument as select * from tendercriterion where documentuuid is not null;
delete from tendercriterion where documentuuid is not null;
alter table tendercriterion drop column documentuuid;
create unique index tendercriterion_textparseid_scope_tenderuuid_unique on tendercriterion(textparseid, scope, tenderuuid);
-- create unique index tendercriterion_textparseid_scope_tenderuuid_documentuuid_val on tendercriterion(textparseid, scope, tenderuuid, documentuuid, value, word);

create unique index document_tenderuuid_sourceurl_unique on document(tenderuuid, sourceurl);

alter table document drop column documentid;
alter table document add column contenttype varchar;
alter table document add column objectname varchar;

alter table tendercriterion ADD CONSTRAINT tendercriterion_tenders_tenderuuid_fk FOREIGN KEY (tenderuuid) references tenders(tenderuuid);

create index tendercriterion_tenderuuid_idx on tendercriterion(tenderuuid);


update tenders set datasource='dgmarket' where origine='DgMarket';
update tenders set datasource='tenderinfo' where origine='TenderInfo';

update tenders set creationdate = publicationdate where creationdate is null;

alter table tenders add column owner_id uuid default null;

alter table document drop constraint document_contenthash_key;
/*
create table referenceunit (
	entity varchar unique not null,
        unit varchar,
	name varchar
);

insert into referenceunit values
	('power','W','watt'),
	('electric potential','V','volt'),
	('current','A','ampere'),
	('length','m','meter')
	;
*/

create table resourceaccesslist (
	resourceid uuid,
	granteeid uuid,
	role varchar
);

create table account (
	accountid uuid default uuid_generate_v4(),
	organizationid uuid,
	name varchar,
	creationdate timestamptz,
	updatedate timestamptz
);
