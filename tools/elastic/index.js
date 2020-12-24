
const { BddTool } = require('deepbloo')
const { tenderFormat } = require('deepbloo').tenderformat
const { indexToElasticsearch } = require('deepbloo').elastic
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
    select tenders.*, '{}' as "tenderCriterions" from tenders
    where (select count(*)=0 from tendercriterion where tenderuuid=tenders.tenderuuid)
    order by tenders.creationdate desc
    nulls last
    limit $1`

  const results = await BddTool.QueryExecPrepared(client, query1, [limit], 'tenders')
  await processResults(results)

  const results2 = await BddTool.QueryExecPrepared(client, query2, [limit], 'tenders')
  await processResults(results2)

  process.exit()
}

const processResults = async (results) => {
  let tranche = []
  let processed = 0
  for (const result of results) {
    result.title = stripHtml(result.title).result
    result.description = stripHtml(result.description).result
    result.contactAddress = stripHtml(result.contactAddress).result
    const formated = await tenderFormat(result)
    const elasticDoc = {
      ...result,
      ...formated,
      id: result.tenderUuid,
      zone0: formated.regionLvl0[0],
      zone1: formated.regionLvl1[0],
      zone2: formated.regionLvl2[0],
    }
    delete result.tenderUuid
    tranche.push(elasticDoc)
    processed += 1
    //const elasticRes = await indexToElasticsearch([elasticDoc], 'newtenders')
    //console.log(JSON.stringify(elasticRes, null, 2))

    if (tranche.length >= 300) {
      await indexToElasticsearch(tranche, 'newtenders')
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

main(2000000)// .then(process.exit())
