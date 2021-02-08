
const parse = require('csv-parse/lib/sync');
const fs = require('fs')
const Client = require('@elastic/app-search-node/lib/client')

const csvData = fs.readFileSync('synonyms.csv')
const records = parse(csvData)
  .map(record => record
    .map(synonym => synonym.trim())
    .filter(synonym => synonym)
  )
  .filter(record => record)
// console.log(records)

const engineName = `deepbloo-${process.env.NODE_ENV || 'dev'}`
// const engineName = `deepbloo`
const client = new Client(process.env.APPSEARCH_PRIVATE, `${process.env.APPSEARCH_ENDPOINT}api/as/v1/`)

const cleanSynonyms = async () => {
  let results = { length: 1 }
  while (results.length) {
    const jsonRes = await client.get(`engines/${encodeURIComponent(engineName)}/synonyms`)
    results = JSON.parse(jsonRes).results
    console.log(results)
    for (const { id } of results) {
      console.log(`Deleting synonym ${id}`)
      await client.delete(`engines/${encodeURIComponent(engineName)}/synonyms/${id}`)
    }
  }
}

const main = async function () {
  for (const synonyms of records) {
    const { id } = await client.post(`engines/${encodeURIComponent(engineName)}/synonyms`, { synonyms })
  }
}

//cleanSynonyms().then(console.log('End'))
main().then(console.log('End'))
