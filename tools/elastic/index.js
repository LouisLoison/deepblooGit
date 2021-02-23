
const { BddTool } = require('deepbloo')
const { analyzeTender } = require('deepbloo').tenderformat
const { indexToElasticsearch } = require('deepbloo').elastic
const { indexObjectToAppsearch } = require('deepbloo').appsearch
const { stripHtml } = require("string-strip-html")

const main = async (limit = 9) => {
  const client = await BddTool.getClient()

  const query = `select tenders.* from tenders
    order by tenders.creationdate asc
    nulls first
    limit $1`


  const results = await BddTool.QueryExecPrepared(client, query, [limit])
  await processResults(client, results)

  // const results2 = await BddTool.QueryExecPrepared(client, query1, [limit])
  // await processResults(results2)

  process.exit()
}

const processResults = async (client, { rows, fields, rowCount }) => {
  let tranche = []
  let appTranche = []
  let processed = 0
  for (let i=0; i < rowCount; i += 1) {
    const [result] = BddTool.pgMapResult([rows[i]], fields, 'tenders')
    delete rows[i]
    try {
      // result.title = stripHtml(result.title).result
      // result.description = stripHtml(result.description).result
      if (result.contactAddress) {
        result.contactAddress = stripHtml(result.contactAddress).result
      }
    } catch (err) {
      console.log(err)
      console.log(result.contactAddress)
    }
    const { analyzedData, formatedData } = await analyzeTender(result)

    const { tenderCriterions, tenderCriterionCpvs } = analyzedData

    await BddTool.QueryExecPrepared(client, `
      delete from tenderCriterionCpv where tenderUuid = $1;
      `, [result.tenderUuid])

    if (tenderCriterionCpvs && tenderCriterionCpvs.length) {
      for (const tenderCriterionCpv of tenderCriterionCpvs) {
        tenderCriterionCpv.tenderUuid = result.tenderUuid
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
    console.log('Has criterions')
    await BddTool.QueryExecPrepared(client, `
      delete from tenderCriterion where tenderUuid = $1;
      `, [result.tenderUuid])



      for (const tenderCriterion of tenderCriterions) {
        tenderCriterion.tenderUuid = result.tenderUuid
        tenderCriterion.creationDate = new Date()
        tenderCriterion.updateDate = tenderCriterion.creationDate
        await BddTool.RecordAddUpdate (
          'tenderCriterion',
          tenderCriterion,
          'tenderUuid, scope, textparseId',
          client,
        )
      }
    }
  

    const elasticDoc = {
      ...analyzedData,
      ...formatedData,
      id: result.tenderUuid,
    }
    delete elasticDoc.tenderUuid
    const appsearchDoc = {
      ...formatedData,
      id: result.tenderUuid,
      account_id: result.owner_id || 'none',
    }
    delete appsearchDoc.tenderUuid
    tranche.push(elasticDoc)

    if (result.status === 20) {
      appTranche.push(appsearchDoc)
    }
    processed += 1
    //const elasticRes = await indexToElasticsearch([elasticDoc], 'newtenders')
    //console.log(JSON.stringify(elasticRes, null, 2))

    if (tranche.length >= 50) {
      await indexToElasticsearch(tranche, 'tenders')
      if(appTranche.length) {
        await indexObjectToAppsearch(appTranche, 'deepbloo-dev')
        appTranche.forEach((r, index) => delete appTranche[index])
      }
      console.log(processed) //, JSON.stringify(res, null, 2))
      tranche.forEach((r, index) => delete tranche[index])
      tranche = []
      appTranche = []
    }
    //console.log(formated.title, formated.cpv)
  }
  if (tranche.length) {
    await indexToElasticsearch(tranche, 'tenders')
  }
  if(appTranche.length) {
    await indexObjectToAppsearch(appTranche, 'deepbloo-dev')
  }
  
  console.log(processed)
  // return result.length
}

main(4000000)// .then(process.exit())
