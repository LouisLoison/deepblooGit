// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { dbLambda } = require('deepbloo').lambda;
const { BddTool } = require('deepbloo');

const handler =  async function(event, context, client ) {
  const { uuid } = event.storedData
  let { tenderCriterions, tenderCriterionCpvs } = event.analyzedData

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

  const query3 = `
        update tenderimport set tenderuuid = uuid
        where mergeMethod is null and status = 20 and uuid = $1;`
  await BddTool.QueryExecPrepared(client, query3, [ uuid ]);

  const fields = `tenderuuid, biddeadlinedate, buyercountry, buyername, contactaddress, contactcity,
    contactcountry, contactemail, contactfirstname, contactlastname, contactphone, contactstate,
    country, cpvdescriptions, cpvs, cpvsorigine, currency, datasource, datasourceid, description,
    estimatedcost, filesource, lang, noticetype, procurementid, procurementmethod, publicationdate,
    sourceurl, title, creationdate, updatedate`


  const query4 = `select ${fields} from tenderimport 
          where status = 20 and uuid = $1`

  const [tenderData] = await BddTool.QueryExecPrepared(client, query4, [ uuid ], 'tenderimport')


  // Overwrite data if found interesting

  if (tenderData) {
    await BddTool.RecordAddUpdate('tenders', tenderData, 'tenderuuid', client)
  }

  const query5 = `select tenders.*
        from tenders, tenderimport
	where tenders.tenderuuid = tenderimport.tenderuuid
	and tenderimport.uuid = $1`;

  const [ tender ] = await BddTool.QueryExecPrepared(client, query5, [ uuid ], 'tenders');
  const data = (tender !== undefined) ? tender : false
  const newSourceUrls = []
  if(tender) {

    // Bulk insert into tenderCriterion table
    if (tenderCriterionCpvs && tenderCriterionCpvs.length) {
      for (const tenderCriterionCpv of tenderCriterionCpvs) {
        tenderCriterionCpv.tenderId = tender.id
        tenderCriterionCpv.tenderUuid = tender.tenderUuid
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

    tenderCriterions = tenderCriterions || []

    if (tenderCriterions && tenderCriterions.length) {
      for (const tenderCriterion of tenderCriterions) {
        tenderCriterion.tenderId = tender.id
        tenderCriterion.tenderUuid = tender.tenderUuid
        tenderCriterion.creationDate = new Date()
        tenderCriterion.updateDate = tenderCriterion.creationDate
        //      const upsertKey = tenderCriterion.textparseId ? 'tenderUuid, scope, textparseId' :
        //	tenderCriterion.entity ?
        await BddTool.RecordAddUpdate (
          'tenderCriterion',
          tenderCriterion,
          'tenderUuid, scope, textParseId, word',
          client,
        )
      }
    }


    event.convertedData.sourceUrl.forEach(sourceUrl => newSourceUrls.push({
      tenderUuid: data.tenderUuid,
      tenderId: data.id,
      sourceUrl,
    }))
  }

  console.log('mergedProcurementId',mergedProcurementId,'mergedBuyerBiddeadline',mergedBuyerBiddeadline, 'data', (tender !== undefined) )
  const error = !(mergedProcurementId || mergedBuyerBiddeadline || data)

  return {
    mergedProcurementId,
    mergedBuyerBiddeadline,
    data,
    error,
    newSourceUrls,
    hasDocuments: !!newSourceUrls.length,
  }
}

exports.handler = dbLambda(handler)
