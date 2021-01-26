
const { BddTool } = require('deepbloo')
const { tenderFormat } = require('deepbloo').tenderformat
const { indexToElasticsearch } = require('deepbloo').elastic
const { indexObjectToAppsearch } = require('deepbloo').appsearch
const { CpvList } = require('deepbloo').cpv
const stripHtml = require("string-strip-html")

const main = async (limit = 9) => {
  const client = await BddTool.getClient()

  const query1 = `
    select tenders.*, json_agg(
      json_build_object(
        'status', tenderCriterion.status,
        'scope', tenderCriterion.scope,
        'findCount', tenderCriterion.findcount,
        'word', tenderCriterion.word,
        'value', tenderCriterion.value,
        'textparseId',tenderCriterion.textparseid
      )
    ) as "tenderCriterions"
    from tenders, tenderCriterion
    where tenders.tenderuuid = tenderCriterion.tenderuuid
    -- and tenders.status = 0
    group by tenders.id
    order by tenders.creationdate desc
    nulls last
    limit $1`
  const query2 = `
    select tenders.*, '[]'::json as "tenderCriterions" from tenders
    where (select count(*)=0 from tendercriterion where tenderuuid=tenders.tenderuuid)
    order by tenders.creationdate desc
    nulls last
    limit $1`

  const results = await BddTool.QueryExecPrepared(client, query2, [limit])
  await processResults(results)

  const results2 = await BddTool.QueryExecPrepared(client, query1, [limit])
  await processResults(results2)

  process.exit()
}

const processResults = async ({ rows, fields, rowCount }) => {
  let tranche = []
  let appTranche = []
  let processed = 0
  const cpvList = await CpvList()
  for (let i=0; i < rowCount; i += 1) {
    const [result] = BddTool.pgMapResult([rows[i]], fields, 'tenders')
    delete rows[i]
    try {
      result.title = stripHtml(result.title).result
      result.description = stripHtml(result.description).result
      if (result.contactAddress) {
        result.contactAddress = stripHtml(result.contactAddress).result
      }
    } catch (err) {
      console.log(err)
      console.log(result.contactAddress)
    }
    const formated = await tenderFormat(result, cpvList)
    const elasticDoc = {
      ...result,
      ...formated,
      id: result.tenderUuid,
    }
    delete elasticDoc.tenderUuid
    const appsearchDoc = {
      ...formated,
      id: result.tenderUuid,
      account_id: 'none',
    }
    delete appsearchDoc.tenderUuid
    tranche.push(elasticDoc)
    appTranche.push(appsearchDoc)
    processed += 1
    //const elasticRes = await indexToElasticsearch([elasticDoc], 'newtenders')
    //console.log(JSON.stringify(elasticRes, null, 2))

    if (tranche.length >= 50) {
      await indexToElasticsearch(tranche, 'tenders')
      await indexObjectToAppsearch(appTranche, 'deepbloo-dev')
      console.log(processed) //, JSON.stringify(res, null, 2))
      tranche.forEach((r, index) => delete tranche[index])
      appTranche.forEach((r, index) => delete appTranche[index])
      tranche = []
      appTranche = []
    }
    //console.log(formated.title, formated.cpv)
  }
  if (tranche.length) {
    await indexToElasticsearch(tranche, 'newtenders')
  }
  
  console.log(processed)
  // return result.length
}

main(4000000)// .then(process.exit())
