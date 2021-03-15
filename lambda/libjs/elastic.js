
const { Client } = require('@elastic/elasticsearch')
const { getElasticSecret, env } = require('./config')
const countriesByName = require('./public/constants/countries.json').reduce((acc, val) => ({
  ...acc,
  [val.name.toLowerCase()]: val.code,
}), {})

let elasticSearchClient = false

exports.connectToElasticsearch = async () => {
  if(!elasticSearchClient) {
    const config = await getElasticSecret()

    console.log(config)
    const node = config.elasticEndpoint
    const auth = {
      username: config.elasticUser,
      password: config.elasticPassword,
    }

    // Elasticsearch connexion
    console.log('Connecting to ', node)
    elasticSearchClient = new Client({
      node,
      auth,
      maxRetries: 5,
      requestTimeout: 3000,
      //      sniffOnStart: true
    })
  }
  return elasticSearchClient
}

exports.filterDocument = (doc) => {
  const filteredDoc = [
    "bidDeadlineDate",
    "brand",
    "buyer_name",
    "contactEmail",
    "contactPhone",
    "contactState",
    "contractType1",
    "country",
    "cpvs",
    "cpvsOrigine",
    "currency",
    "description",
    "estimatedCost",
    "noticeType",
    "publicationDate",
    "regionLvl0",
    "regionLvl1",
    "title",
    "words",
    "id",
    "dataSource",
    "dataSourceId",
  ].reduce((acc, key) => {
    acc[key] = doc[key]
    return acc
  }, {})
  filteredDoc.countryCode = countriesByName[doc.country.toLowerCase()] || ''
  if (filteredDoc.countryCode === '') {
    console.log(`Unknown country ${doc.country}`)
  }
  return filteredDoc
}


exports.indexToElasticsearch = async (objects, index) => {
  const client = elasticSearchClient || await this.connectToElasticsearch()
  const result = await Promise.all(objects.map(async body => {
    //console.log(body.id)
    // delete body.tenderCriterions
    return  client.index({
      id: body.id,
      index: `${index}-${env}`,
      body,
    }).catch(err => console.log(err))
  }))
  return result
}


exports.getElasticMapping = async (index) => {
  const client = await this.connectToElasticsearch()
  return await(client.indices.getMapping({
    index: `${index}-${env}`,
  }))
}
