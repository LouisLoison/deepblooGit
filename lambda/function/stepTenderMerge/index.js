// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { BddTool } = require('deepbloo');

exports.handler =  async function(event, ) {
  const { uuid } = event

  const client = await BddTool.bddInit('deepbloo','devAws')

  await BddTool.QueryExecPrepared(client, 'BEGIN;');

  const query = `UPDATE tenderimport
  SET  tenderUuid = tenders.uuid,
       tenderId = tenders.id, 
       mergeMethod = 'PROCUREMENT_ID'
	  FROM tenders
          WHERE tenderimport.procurementId = tenders.procurementId
	  AND tenderimport.procurementId != ''
	  AND tenderimport.uuid = $1
    AND tenderimport.tenderUuid IS NULL`

  const mergedProcurementId = await BddTool.QueryExecPrepared(client, query, [ uuid ])

  const query2 = `UPDATE      tenderimport 
    SET   tenderUuid = tenders.uuid,
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

  const fields = 'uuid, biddeadlinedate, buyercountry, buyername, contactaddress, contactcity, contactcountry, contactemail, contactfirstname, contactlastname, contactphone, contactstate, country, cpvdescriptions, cpvs, cpvsorigine, currency, datasourceid, description, estimatedcost, filesource, lang, noticetype, procurementid, procurementmethod, publicationdate, sourceurl, title'
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
	where tenders.uuid = tenderimport.tenderuuid
	and tenderimport.uuid = $1`;

  const [ tender ] = await BddTool.QueryExecPrepared(client, query5, [ uuid ], 'tenders');

  await BddTool.QueryExecPrepared(client, 'COMMIT;');

  const data = (tender !== undefined) ? tender : false
  console.log('mergedProcurementId',mergedProcurementId,'mergedBuyerBiddeadline',mergedBuyerBiddeadline, 'data', (tender !== undefined) )
  const error = !(mergedProcurementId || mergedBuyerBiddeadline || data)

  client.release()
  return {
    mergedProcurementId,
    mergedBuyerBiddeadline,
    data,
    error,
  }
}
