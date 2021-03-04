
const { BddTool } = require('deepbloo')
const { analyzeTender } = require('deepbloo').tenderformat
const { indexToElasticsearch } = require('deepbloo').elastic
const { indexObjectToAppsearch } = require('deepbloo').appsearch
const { stripHtml } = require("string-strip-html")

const main = async (limit = 9) => {
  const client = await BddTool.getClient()

  const query = `select tenders.* from tenders
    where now() - creationdate < interval '1 month'
    order by tenders.creationdate desc
    nulls last
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
  let promiseTranche = []
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

    promiseTranche.push(analyzeTender(result).then(async ({ analyzedData, formatedData }) => {
    await BddTool.RecordAddUpdate (
          'tenders',
          analyzedData,
          'tenderUuid',
          client,
        )

    const query = `select array_agg(distinct tendergroupid)
      from tendergrouplink
      where tenderuuid=$1`

    const {rows} = await BddTool.QueryExecPrepared(client, query, [analyzedData.tenderUuid])
    const [[ groups ]] = rows
    formatedData.groups = groups
	    console.log(groups)



    const { tenderCriterions, tenderCriterionCpvs } = analyzedData

    await BddTool.QueryExecPrepared(client, `
      delete from tenderCriterionCpv where tenderUuid = $1;
      `, [analyzedData.tenderUuid])

    if (tenderCriterionCpvs && tenderCriterionCpvs.length) {
      for (const tenderCriterionCpv of tenderCriterionCpvs) {
        tenderCriterionCpv.tenderId = analyzedData.id
        tenderCriterionCpv.tenderUuid = analyzedData.tenderUuid
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
    await BddTool.QueryExecPrepared(client, `
      delete from tenderCriterion where tenderUuid = $1;
      `, [analyzedData.tenderUuid])



      for (const tenderCriterion of tenderCriterions) {
        tenderCriterion.tenderId = analyzedData.id
        tenderCriterion.tenderUuid = analyzedData.tenderUuid
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
      id: analyzedData.tenderUuid,
    }
    delete elasticDoc.tenderUuid
    const appsearchDoc = {
      ...formatedData,
      id: analyzedData.tenderUuid,
      account_id: analyzedData.owner_id || 'none',
    }
    delete appsearchDoc.tenderUuid
    tranche.push(elasticDoc)

    if (analyzedData.status === 20) {
      appTranche.push(appsearchDoc)
    }
    processed += 1
    }))
    //const elasticRes = await indexToElasticsearch([elasticDoc], 'newtenders')
    //console.log(JSON.stringify(elasticRes, null, 2))

    if (promiseTranche.length >= 18) {
      await Promise.all(promiseTranche)
      await indexToElasticsearch(tranche, 'tenders')
      if(appTranche.length) {
        await indexObjectToAppsearch(appTranche, 'tenders-dev')
        appTranche.forEach((r, index) => delete appTranche[index])
      }
      console.log(processed) //, JSON.stringify(res, null, 2))
      tranche.forEach((r, index) => delete tranche[index])
      promiseTranche.forEach((r, index) => delete promiseTranche[index])
      promiseTranche = []
      tranche = []
      appTranche = []
    }
    //console.log(formated.title, formated.cpv)
  }
  await Promise.all(promiseTranche)
  if (tranche.length) {
    await indexToElasticsearch(tranche, 'tenders')
  }
  if(appTranche.length) {
    await indexObjectToAppsearch(appTranche, 'tenders-dev')
  }
  
  console.log(processed)
  // return result.length
}

main(40)// .then(process.exit())
