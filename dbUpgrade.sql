


--alter table dgmarket alter COLUMN dgmarketid drop not null;
--update dgmarket set dgmarketid = null where dgmarketid=0;
--create unique index if not exists dgmarket_dgmarketid_unique on dgmarket(dgmarketid);

alter table dgmarket rename to tenders;
--create table tenders as select * from dgmarket limit 1000;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--create sequence tenders_id_seq;
--alter table tenders alter column id set default nextval('tenders_id_seq');
--select setval('tenders_id_seq',  (SELECT MAX(id) FROM tenders));

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
--create sequence tenderimport_id_seq;
--alter table tenderimport alter column tenderimportid set default nextval('tenderimport_id_seq');
--select setval('tenderimport_id_seq',  (SELECT MAX(tenderimportid) FROM tenderimport));

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

--create sequence tendercriterion_id_seq;
--alter table tendercriterion alter column tendercriterionid set default nextval('tendercriterion_id_seq');
--select setval('tendercriterion_id_seq',  (SELECT MAX(tendercriterionid) FROM tendercriterion));


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
	role varchar,
	creationdate timestamptz,
	updatedate timestamptz
);

create table account (
	accountid uuid default uuid_generate_v4(),
	organizationid uuid,
	name varchar,
	creationdate timestamptz,
	updatedate timestamptz
);

delete from tendergrouplink tl using tendergroup where tl.tendergroupid=tendergroup.tendergroupid and searchrequest is not null;

delete from tendergroup where searchrequest is not null;

alter table tendergrouplink add column tenderUuid uuid;

update tendergrouplink set tenderuuid = tenders.tenderuuid from tenders where tenders.id=tenderid;


create unique index tendergrouplink_userid_tenderuuid_unique on tendergrouplink(userid, tenderuuid);

drop index tendercriterion_textparseid_scope_tenderuuid_unique ;

create unique index tendercriterion_textparseid_word_scope_tenderuuid_unique on tendercriterion(textparseid, scope, word, tenderuuid);

alter table document add column parentuuid uuid;

-- Create reversion commands :
-- select 'alter table ' || table_name || ' alter column ' || column_name || ' type varchar(' || character_maximum_length  || ');' from information_schema.columns where data_type='character varying' and character_maximum_length is not null and table_name = any(array['tenders', 'tenderimport']);
-- select 'alter table ' || table_name || ' alter column ' || column_name || ' type varchar(' || character_maximum_length  || ');' from information_schema.columns where data_type='character varying' and character_maximum_length is not null and table_schema='public';
-- produced:
-- alter table tenders alter column procurementid type varchar(100);
-- alter table tenders alter column title type varchar(500);
-- alter table tenders alter column description type varchar(8000);
-- alter table tenders alter column lang type varchar(10);
-- alter table tenders alter column contactfirstname type varchar(100);
-- alter table tenders alter column contactlastname type varchar(100);
-- alter table tenders alter column contactaddress type varchar(500);
-- alter table tenders alter column contactcity type varchar(100);
-- alter table tenders alter column contactstate type varchar(100);
-- alter table tenders alter column contactcountry type varchar(100);
-- alter table tenders alter column contactemail type varchar(200);
-- alter table tenders alter column contactphone type varchar(100);
-- alter table tenders alter column buyername type varchar(500);
-- alter table tenders alter column buyercountry type varchar(50);
-- alter table tenders alter column procurementmethod type varchar(50);
-- alter table tenders alter column noticetype type varchar(200);
-- alter table tenders alter column country type varchar(100);
-- alter table tenders alter column estimatedcost type varchar(50);
-- alter table tenders alter column currency type varchar(20);
-- alter table tenders alter column cpvsorigine type varchar(500);
-- alter table tenders alter column cpvs type varchar(500);
-- alter table tenders alter column cpvdescriptions type varchar(2000);
-- alter table tenders alter column words type varchar(4000);
-- alter table tenders alter column filesource type varchar(50);
-- alter table tenders alter column brand type varchar(255);
-- alter table tenders alter column financial type varchar(255);
-- alter table tenders alter column origine type varchar(255);
-- alter table tenderimport alter column procurementid type varchar(255);
-- alter table tenderimport alter column title type varchar(500);
-- alter table tenderimport alter column description type varchar(9000);
-- alter table tenderimport alter column lang type varchar(255);
-- alter table tenderimport alter column contactfirstname type varchar(255);
-- alter table tenderimport alter column contactlastname type varchar(255);
-- alter table tenderimport alter column contactaddress type varchar(500);
-- alter table tenderimport alter column contactcity type varchar(255);
-- alter table tenderimport alter column contactstate type varchar(255);
-- alter table tenderimport alter column contactcountry type varchar(255);
-- alter table tenderimport alter column contactemail type varchar(255);
-- alter table tenderimport alter column contactphone type varchar(255);
-- alter table tenderimport alter column buyername type varchar(500);
-- alter table tenderimport alter column buyercountry type varchar(255);
-- alter table tenderimport alter column procurementmethod type varchar(255);
-- alter table tenderimport alter column noticetype type varchar(255);
-- alter table tenderimport alter column country type varchar(255);
-- alter table tenderimport alter column estimatedcost type varchar(255);
-- alter table tenderimport alter column currency type varchar(255);
-- alter table tenderimport alter column cpvs type varchar(255);
-- alter table tenderimport alter column mergemethod type varchar(255);
-- alter table tenderimport alter column filesource type varchar(255);
-- alter table tenderimport alter column exclusion type varchar(255);
-- alter table tenderimport alter column exclusionword type varchar(255);
--
-- alter table annonce alter column title type varchar(255);
-- alter table annonce alter column description type varchar(255);
-- alter table annonce alter column image type varchar(255);
-- alter table annonce alter column url type varchar(255);
-- alter table annonceclick alter column screen type varchar(255);
-- alter table cpv alter column label type varchar(255);
-- alter table cpv alter column logo type varchar(255);
-- alter table cpv alter column picture type varchar(255);
-- alter table cpv alter column category type varchar(255);
-- alter table cpvexclusion alter column word type varchar(255);
-- alter table cpvword alter column word type varchar(255);
-- alter table document alter column cpvs type varchar(500);
-- alter table document alter column filename type varchar(255);
-- alter table document alter column sourceurl type varchar(255);
-- alter table document alter column s3url type varchar(255);
-- alter table document alter column boxfolderid type varchar(255);
-- alter table document alter column boxfileid type varchar(255);
-- alter table documentmessage alter column type type varchar(255);
-- alter table documentmessage alter column groupid type varchar(255);
-- alter table documentmessage alter column message type varchar(255);
-- alter table importtenderinfo alter column posting_id type varchar(255);
-- alter table importtenderinfo alter column date_c type varchar(255);
-- alter table importtenderinfo alter column email_id type varchar(255);
-- alter table importtenderinfo alter column region type varchar(255);
-- alter table importtenderinfo alter column region_code type varchar(255);
-- alter table importtenderinfo alter column add1 type varchar(255);
-- alter table importtenderinfo alter column add2 type varchar(255);
-- alter table importtenderinfo alter column city type varchar(255);
-- alter table importtenderinfo alter column state type varchar(255);
-- alter table importtenderinfo alter column pincode type varchar(255);
-- alter table importtenderinfo alter column country type varchar(255);
-- alter table importtenderinfo alter column country_code type varchar(255);
-- alter table importtenderinfo alter column url type varchar(255);
-- alter table importtenderinfo alter column tel type varchar(255);
-- alter table importtenderinfo alter column fax type varchar(255);
-- alter table importtenderinfo alter column contact_person type varchar(255);
-- alter table importtenderinfo alter column maj_org type varchar(255);
-- alter table importtenderinfo alter column tender_notice_no type varchar(255);
-- alter table importtenderinfo alter column notice_type type varchar(255);
-- alter table importtenderinfo alter column notice_type_code type varchar(255);
-- alter table importtenderinfo alter column bidding_type type varchar(255);
-- alter table importtenderinfo alter column global type varchar(255);
-- alter table importtenderinfo alter column mfa type varchar(255);
-- alter table importtenderinfo alter column tenders_details type varchar(9000);
-- alter table importtenderinfo alter column short_desc type varchar(500);
-- alter table importtenderinfo alter column currency type varchar(255);
-- alter table importtenderinfo alter column est_cost type varchar(255);
-- alter table importtenderinfo alter column doc_last type varchar(255);
-- alter table importtenderinfo alter column financier type varchar(255);
-- alter table importtenderinfo alter column related_documents type varchar(2000);
-- alter table importtenderinfo alter column sector type varchar(255);
-- alter table importtenderinfo alter column sector_code type varchar(255);
-- alter table importtenderinfo alter column corregendum_details type varchar(255);
-- alter table importtenderinfo alter column project_name type varchar(255);
-- alter table importtenderinfo alter column cpv type varchar(255);
-- alter table importtenderinfo alter column authorize type varchar(255);
-- alter table importtenderinfo alter column mergemethod type varchar(255);
-- alter table importtenderinfo alter column filesource type varchar(255);
-- alter table importtenderinfo alter column exclusion type varchar(255);
-- alter table importtenderinfo alter column exclusionword type varchar(255);
-- alter table mappingcountry alter column countryid type varchar(255);
-- alter table mappingcountry alter column countrycode type varchar(255);
-- alter table mappingcountry alter column countrycode3 type varchar(255);
-- alter table mappingcountry alter column name type varchar(255);
-- alter table mappingcountry alter column nameshort type varchar(255);
-- alter table mappingfinancial alter column name type varchar(255);
-- alter table mappingfinancial alter column code type varchar(255);
-- alter table organization alter column name type varchar(500);
-- alter table organization alter column countrys type varchar(255);
-- alter table organizationcpv alter column cpvcode type varchar(50);
-- alter table organizationcpv alter column cpvname type varchar(500);
-- alter table privatedeal alter column category type varchar(255);
-- alter table privatedeal alter column title type varchar(255);
-- alter table privatedeal alter column size type varchar(255);
-- alter table privatedeal alter column description type varchar(4000);
-- alter table privatedeal alter column lookingfor type varchar(255);
-- alter table privatedeal alter column information type varchar(255);
-- alter table privatedeal alter column requestforproposal type varchar(255);
-- alter table privatedeal alter column projectdevelopmentstatus type varchar(4000);
-- alter table privatedeal alter column projectattractiveness type varchar(4000);
-- alter table privatedeal alter column region type varchar(255);
-- alter table privatedeal alter column projectlocation type varchar(255);
-- alter table privatedeal alter column projectimplementationperiod type varchar(255);
-- alter table privatedeal alter column projectglobalamount type varchar(255);
-- alter table privatedeal alter column requiredinvestments type varchar(255);
-- alter table privatedeal alter column publicationdate type varchar(255);
-- alter table privatedeal alter column submissiondeadlinedate type varchar(255);
-- alter table privatedeal alter column organizationname type varchar(255);
-- alter table privatedeal alter column organizationtype type varchar(255);
-- alter table privatedeal alter column projectoverallcost type varchar(255);
-- alter table privatedeal alter column capitalcosts type varchar(255);
-- alter table privatedeal alter column internalfundsinvested type varchar(255);
-- alter table privatedeal alter column internalratereturn type varchar(255);
-- alter table privatedeal alter column availablefunds type varchar(255);
-- alter table privatedeal alter column tariff type varchar(255);
-- alter table privatedeal alter column requiredamountofinvestments type varchar(255);
-- alter table privatedeal alter column investorparticipationfrom type varchar(255);
-- alter table privatedeal alter column investmentreturn type varchar(255);
-- alter table privatedeal alter column opportunity type varchar(255);
-- alter table privatedeal alter column contactname type varchar(255);
-- alter table privatedeal alter column contactemail type varchar(255);
-- alter table privatedeal alter column contactphone type varchar(255);
-- alter table tenderdetail alter column comment type varchar(255);
-- alter table tenderdetail alter column amoutoffer type varchar(255);
-- alter table tendercriterioncpv alter column value type varchar(255);
-- alter table tendercriterioncpv alter column word type varchar(255);
-- alter table tendercriterioncpv alter column scope type varchar(255);
-- alter table tendercriterion alter column value type varchar(255);
-- alter table tendercriterion alter column word type varchar(255);
-- alter table tendercriterion alter column scope type varchar(255);
-- alter table tenderfilter alter column label type varchar(255);
-- alter table tendergroup alter column label type varchar(255);
-- alter table tendergroup alter column color type varchar(255);
-- alter table tendergroup alter column searchrequest type varchar(6000);
-- alter table usercpv alter column cpvcode type varchar(255);
-- alter table usercpv alter column cpvname type varchar(255);
-- alter table usernotify alter column recipientemail type varchar(255);
-- alter table "user" alter column email type varchar(200);
-- alter table "user" alter column username type varchar(500);
-- alter table "user" alter column password type varchar(200);
-- alter table "user" alter column country type varchar(255);
-- alter table "user" alter column countrycode type varchar(255);
-- alter table "user" alter column regions type varchar(1000);
-- alter table "user" alter column photo type varchar(255);
-- alter table "user" alter column notifcpvs type varchar(255);
-- alter table "user" alter column notifregions type varchar(255);
-- alter table "user" alter column dashboardurl type varchar(255);
-- alter table "user" alter column businesspipeline type varchar(6000);
-- alter table tendercriteriondocument alter column value type varchar(255);
-- alter table tendercriteriondocument alter column word type varchar(255);
-- alter table tendercriteriondocument alter column scope type varchar(255);
--

-- then :
-- select 'alter table ' || table_name || ' alter column ' || column_name || ' type varchar;'  from information_schema.columns where data_type='character varying' and character_maximum_length is not null and table_name = any(array['tenders', 'tenderimport']);
-- select 'alter table ' || table_name || ' alter column ' || column_name || ' type varchar;'  from information_schema.columns where data_type='character varying' and character_maximum_length is not null and table_schema='public';
-- produces :

 alter table tenders alter column procurementid type varchar;
 alter table tenders alter column title type varchar;
 alter table tenders alter column description type varchar;
 alter table tenders alter column lang type varchar;
 alter table tenders alter column contactfirstname type varchar;
 alter table tenders alter column contactlastname type varchar;
 alter table tenders alter column contactaddress type varchar;
 alter table tenders alter column contactcity type varchar;
 alter table tenders alter column contactstate type varchar;
 alter table tenders alter column contactcountry type varchar;
 alter table tenders alter column contactemail type varchar;
 alter table tenders alter column contactphone type varchar;
 alter table tenders alter column buyername type varchar;
 alter table tenders alter column buyercountry type varchar;
 alter table tenders alter column procurementmethod type varchar;
 alter table tenders alter column noticetype type varchar;
 alter table tenders alter column country type varchar;
 alter table tenders alter column estimatedcost type varchar;
 alter table tenders alter column currency type varchar;
 alter table tenders alter column cpvsorigine type varchar;
 alter table tenders alter column cpvs type varchar;
 alter table tenders alter column cpvdescriptions type varchar;
 alter table tenders alter column words type varchar;
 alter table tenders alter column filesource type varchar;
 alter table tenders alter column brand type varchar;
 alter table tenders alter column financial type varchar;
 alter table tenders alter column origine type varchar;

 alter table tenderimport alter column procurementid type varchar;
 alter table tenderimport alter column title type varchar;
 alter table tenderimport alter column description type varchar;
 alter table tenderimport alter column lang type varchar;
 alter table tenderimport alter column contactfirstname type varchar;
 alter table tenderimport alter column contactlastname type varchar;
 alter table tenderimport alter column contactaddress type varchar;
 alter table tenderimport alter column contactcity type varchar;
 alter table tenderimport alter column contactstate type varchar;
 alter table tenderimport alter column contactcountry type varchar;
 alter table tenderimport alter column contactemail type varchar;
 alter table tenderimport alter column contactphone type varchar;
 alter table tenderimport alter column buyername type varchar;
 alter table tenderimport alter column buyercountry type varchar;
 alter table tenderimport alter column procurementmethod type varchar;
 alter table tenderimport alter column noticetype type varchar;
 alter table tenderimport alter column country type varchar;
 alter table tenderimport alter column estimatedcost type varchar;
 alter table tenderimport alter column currency type varchar;
 alter table tenderimport alter column cpvs type varchar;
 alter table tenderimport alter column mergemethod type varchar;
 alter table tenderimport alter column filesource type varchar;
 alter table tenderimport alter column exclusion type varchar;
 alter table tenderimport alter column exclusionword type varchar;
 alter table annonce alter column title type varchar;
 alter table annonce alter column description type varchar;
 alter table annonce alter column image type varchar;
 alter table annonce alter column url type varchar;
 alter table annonceclick alter column screen type varchar;
 alter table cpv alter column label type varchar;
 alter table cpv alter column logo type varchar;
 alter table cpv alter column picture type varchar;
 alter table cpv alter column category type varchar;
 alter table cpvexclusion alter column word type varchar;
 alter table cpvword alter column word type varchar;
 alter table document alter column cpvs type varchar;
 alter table document alter column filename type varchar;
 alter table document alter column sourceurl type varchar;
 alter table document alter column s3url type varchar;
 alter table document alter column boxfolderid type varchar;
 alter table document alter column boxfileid type varchar;
 alter table documentmessage alter column type type varchar;
 alter table documentmessage alter column groupid type varchar;
 alter table documentmessage alter column message type varchar;
 alter table importtenderinfo alter column posting_id type varchar;
 alter table importtenderinfo alter column date_c type varchar;
 alter table importtenderinfo alter column email_id type varchar;
 alter table importtenderinfo alter column region type varchar;
 alter table importtenderinfo alter column region_code type varchar;
 alter table importtenderinfo alter column add1 type varchar;
 alter table importtenderinfo alter column add2 type varchar;
 alter table importtenderinfo alter column city type varchar;
 alter table importtenderinfo alter column state type varchar;
 alter table importtenderinfo alter column pincode type varchar;
 alter table importtenderinfo alter column country type varchar;
 alter table importtenderinfo alter column country_code type varchar;
 alter table importtenderinfo alter column url type varchar;
 alter table importtenderinfo alter column tel type varchar;
 alter table importtenderinfo alter column fax type varchar;
 alter table importtenderinfo alter column contact_person type varchar;
 alter table importtenderinfo alter column maj_org type varchar;
 alter table importtenderinfo alter column tender_notice_no type varchar;
 alter table importtenderinfo alter column notice_type type varchar;
 alter table importtenderinfo alter column notice_type_code type varchar;
 alter table importtenderinfo alter column bidding_type type varchar;
 alter table importtenderinfo alter column global type varchar;
 alter table importtenderinfo alter column mfa type varchar;
 alter table importtenderinfo alter column tenders_details type varchar;
 alter table importtenderinfo alter column short_desc type varchar;
 alter table importtenderinfo alter column currency type varchar;
 alter table importtenderinfo alter column est_cost type varchar;
 alter table importtenderinfo alter column doc_last type varchar;
 alter table importtenderinfo alter column financier type varchar;
 alter table importtenderinfo alter column related_documents type varchar;
 alter table importtenderinfo alter column sector type varchar;
 alter table importtenderinfo alter column sector_code type varchar;
 alter table importtenderinfo alter column corregendum_details type varchar;
 alter table importtenderinfo alter column project_name type varchar;
 alter table importtenderinfo alter column cpv type varchar;
 alter table importtenderinfo alter column authorize type varchar;
 alter table importtenderinfo alter column mergemethod type varchar;
 alter table importtenderinfo alter column filesource type varchar;
 alter table importtenderinfo alter column exclusion type varchar;
 alter table importtenderinfo alter column exclusionword type varchar;
 alter table mappingcountry alter column countryid type varchar;
 alter table mappingcountry alter column countrycode type varchar;
 alter table mappingcountry alter column countrycode3 type varchar;
 alter table mappingcountry alter column name type varchar;
 alter table mappingcountry alter column nameshort type varchar;
 alter table mappingfinancial alter column name type varchar;
 alter table mappingfinancial alter column code type varchar;
 alter table organization alter column name type varchar;
 alter table organization alter column countrys type varchar;
 alter table organizationcpv alter column cpvcode type varchar;
 alter table organizationcpv alter column cpvname type varchar;
 alter table privatedeal alter column category type varchar;
 alter table privatedeal alter column title type varchar;
 alter table privatedeal alter column size type varchar;
 alter table privatedeal alter column description type varchar;
 alter table privatedeal alter column lookingfor type varchar;
 alter table privatedeal alter column information type varchar;
 alter table privatedeal alter column requestforproposal type varchar;
 alter table privatedeal alter column projectdevelopmentstatus type varchar;
 alter table privatedeal alter column projectattractiveness type varchar;
 alter table privatedeal alter column region type varchar;
 alter table privatedeal alter column projectlocation type varchar;
 alter table privatedeal alter column projectimplementationperiod type varchar;
 alter table privatedeal alter column projectglobalamount type varchar;
 alter table privatedeal alter column requiredinvestments type varchar;
 alter table privatedeal alter column publicationdate type varchar;
 alter table privatedeal alter column submissiondeadlinedate type varchar;
 alter table privatedeal alter column organizationname type varchar;
 alter table privatedeal alter column organizationtype type varchar;
 alter table privatedeal alter column projectoverallcost type varchar;
 alter table privatedeal alter column capitalcosts type varchar;
 alter table privatedeal alter column internalfundsinvested type varchar;
 alter table privatedeal alter column internalratereturn type varchar;
 alter table privatedeal alter column availablefunds type varchar;
 alter table privatedeal alter column tariff type varchar;
 alter table privatedeal alter column requiredamountofinvestments type varchar;
 alter table privatedeal alter column investorparticipationfrom type varchar;
 alter table privatedeal alter column investmentreturn type varchar;
 alter table privatedeal alter column opportunity type varchar;
 alter table privatedeal alter column contactname type varchar;
 alter table privatedeal alter column contactemail type varchar;
 alter table privatedeal alter column contactphone type varchar;
 alter table tenderdetail alter column comment type varchar;
 alter table tenderdetail alter column amoutoffer type varchar;
 alter table tendercriterioncpv alter column value type varchar;
 alter table tendercriterioncpv alter column word type varchar;
 alter table tendercriterioncpv alter column scope type varchar;
 alter table tendercriterion alter column value type varchar;
 alter table tendercriterion alter column word type varchar;
 alter table tendercriterion alter column scope type varchar;
 alter table tenderfilter alter column label type varchar;
 alter table tendergroup alter column label type varchar;
 alter table tendergroup alter column color type varchar;
 alter table tendergroup alter column searchrequest type varchar;
 alter table usercpv alter column cpvcode type varchar;
 alter table usercpv alter column cpvname type varchar;
 alter table usernotify alter column recipientemail type varchar;
 alter table "user" alter column email type varchar;
 alter table "user" alter column username type varchar;
 alter table "user" alter column password type varchar;
 alter table "user" alter column country type varchar;
 alter table "user" alter column countrycode type varchar;
 alter table "user" alter column regions type varchar;
 alter table "user" alter column photo type varchar;
 alter table "user" alter column notifcpvs type varchar;
 alter table "user" alter column notifregions type varchar;
 alter table "user" alter column dashboardurl type varchar;
 alter table "user" alter column businesspipeline type varchar;
 alter table tendercriteriondocument alter column value type varchar;
 alter table tendercriteriondocument alter column word type varchar;
 alter table tendercriteriondocument alter column scope type varchar;


alter table document add column thumbnailurl varchar;
