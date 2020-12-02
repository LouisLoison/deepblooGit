// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { BddTool } = require('deepbloo');

exports.handler =  async function(event, ) {
  const { uuid } = event.storedData
  const { tenderCriterions, tenderCriterionCpvs } = event.analyzedData

  const client = await BddTool.bddInit()

  await BddTool.QueryExecPrepared(client, 'BEGIN;');

  const query = `UPDATE tenderimport
  SET  tenderUuid = tenders.tenderuuid,
       tenderId = tenders.id, 
       mergeMethod = 'PROCUREMENT_ID'
	  FROM tenders
          WHERE tenderimport.procurementId = tenders.procurementId
	  AND tenderimport.procurementId != ''
	  AND tenderimport.uuid = $1
    AND tenderimport.tenderUuid IS NULL`

  const mergedProcurementId = await BddTool.QueryExecPrepared(client, query, [ uuid ])

  const query2 = `UPDATE      tenderimport 
    SET   tenderUuid = tenders.tenderuuid,
          tenderId = tenders.id, 
          mergeMethod = 'TITLE_BUYER_BIDDEADLINE'
    FROM tenders
    WHERE tenderimport.buyerName = tenders.buyerName 
      AND tenderimport.title = tenders.title 
      AND tenderimport.title != '' 
      AND tenderimport.bidDeadlineDate = tenders.bidDeadlineDate 
	    AND tenderimport.uuid = $1
      AND tenderimport.tenderUuid IS NULL`

  const mergedBuyerBiddeadline = await BddTool.QueryExecPrepared(client, query2, [ uuid ]);

  const fields = 'tenderuuid, biddeadlinedate, buyercountry, buyername, contactaddress, contactcity, contactcountry, contactemail, contactfirstname, contactlastname, contactphone, contactstate, country, cpvdescriptions, cpvs, cpvsorigine, currency, datasourceid, description, estimatedcost, filesource, lang, noticetype, procurementid, procurementmethod, publicationdate, sourceurl, title'
  const query3 = `
        update tenderimport set tenderuuid = uuid
        where mergeMethod is null and status = 20 and uuid = $1;`
  await BddTool.QueryExecPrepared(client, query3, [ uuid ]);

  const query4 = `	
        insert into tenders (${fields})
        select ${fields} from tenderimport 
          where mergeMethod is null and status = 20 and uuid = $1 returning *;` // TODO: upsert
  await BddTool.QueryExecPrepared(client, query4, [ uuid ])

  const query5 = `select tenders.*
        from tenders, tenderimport
	where tenders.tenderuuid = tenderimport.tenderuuid
	and tenderimport.uuid = $1`;

  const [ tender ] = await BddTool.QueryExecPrepared(client, query5, [ uuid ], 'tenders');

  // Bulk insert into tenderCriterion table
  if (tenderCriterionCpvs && tenderCriterionCpvs.length) {
    for (const tenderCriterionCpv of tenderCriterionCpvs) {
      tenderCriterionCpv.tenderUuid = tender.tenderuuid
      tenderCriterionCpv.cpv = undefined
      tenderCriterionCpv.creationDate = new Date()
      tenderCriterionCpv.updateDate = new Date()
      await BddTool.RecordAddUpdate (
        'tenderCriterionCpv',
        tenderCriterionCpv,
        'tenderUuid, scope, cpvId',
        client,
      )
    }
  }
  if (tenderCriterions && tenderCriterions.length) {
    for (const tenderCriterion of tenderCriterions) {
      tenderCriterion.tenderUuid = tender.tenderuuid
      tenderCriterion.creationDate = new Date()
      tenderCriterion.updateDate = new Date()
      await BddTool.RecordAddUpdate (
        'tenderCriterion',
        tenderCriterion,
        'tenderUuid, scope, textparseId',
        client,
      )
    }
  }


  const data = (tender !== undefined) ? tender : false
  console.log('mergedProcurementId',mergedProcurementId,'mergedBuyerBiddeadline',mergedBuyerBiddeadline, 'data', (tender !== undefined) )
  const error = !(mergedProcurementId || mergedBuyerBiddeadline || data)

  await BddTool.QueryExecPrepared(client, 'COMMIT;');
  client.release()
  return {
    mergedProcurementId,
    mergedBuyerBiddeadline,
    data,
    error,
  }
}
