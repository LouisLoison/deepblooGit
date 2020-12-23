
const { BddTool } = require('deepbloo')
const { tenderFormat } = require('deepbloo').tenderformat
const { indexToElasticsearch, getElasticMapping } = require('deepbloo').elastic
const { CpvList } = require('deepbloo').cpv
const stripHtml = require("string-strip-html")

const main = async (limit = 9) => {
  const cpvList = await CpvList()
  const client = await BddTool.getClient()

  const query = `
    
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
    select tenders.*, '{}' as "tenderCriterions" from tenders
    where tenderuuid not in (select distinct tenderuuid from tenderCriterions)
    order by tenders.creationdate desc
    nulls last
    limit $1`

  // console.log(JSON.stringify((await getElasticMapping('tenders')).body['tenders-dev'], null, 2))
  // console.log(JSON.stringify((await getElasticMapping('newtenders')).body['newtenders-dev'], null, 2))
  const results = await BddTool.QueryExecPrepared(client, query2, [limit], 'tenders')
  // console.log(results)
  processResults(results)
  process.exit()
}

const processResults = (results) => {
  let tranche = []
  let processed = 0
  for (const result of results) {
    result.title = stripHtml(result.title).result
    result.description = stripHtml(result.description).result
    result.contactAddress = stripHtml(result.contactAddress).result
    const formated = await tenderFormat(result, cpvList)
    const elasticDoc = { ...formated, ...result, id: result.tenderUuid }
    // console.log(elasticDoc)
    tranche.push(elasticDoc)
    processed += 1
    //const elasticRes = await indexToElasticsearch([elasticDoc], 'newtenders')
    //console.log(JSON.stringify(elasticRes, null, 2))

    if (tranche.length >= 300) {
      const res = await indexToElasticsearch(tranche, 'newtenders')
      console.log(processed) //, JSON.stringify(res, null, 2))
      tranche = []
    }
    //console.log(formated.title, formated.cpv)
  }
  if (tranche.length) {
    await indexToElasticsearch(tranche, 'newtenders')
  }
  
  console.log(processed)
  // return result.length
}

main(10000000)// .then(process.exit())
