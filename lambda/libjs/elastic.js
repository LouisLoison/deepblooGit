
const { Client } = require('@elastic/elasticsearch')
const { getElasticSecret, env } = require('./config')
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
    elasticSearchClient = new Client({
      node,
      auth,
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true
    })
  }
  return elasticSearchClient
}

exports.indexToElasticsearch = async (objects, index) => {
  const client = await this.connectToElasticsearch()
  await objects.forEach(async body => {
    //console.log(body.id)
    await client.index({
      id: body.id,
      index: `${index}-${env}`,
      body,
    }).catch(err => console.log(err))
  })
}


exports.getElasticMapping = async (index) => {
  const client = await this.connectToElasticsearch()
  return await(client.indices.getMapping({
    index: `${index}-${env}`,
  }))
}

