exports.connectToElasticsearch = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { Client } = require('@elastic/elasticsearch')
      const client = new Client({
        node: 'https://a85bb760f6f74e4bbb19f9928e3ba878.eu-west-1.aws.found.io:9243/',
        auth: {
          username: 'admin@deepbloo.com',
          password: 'sMt_nC]z_7R9C'
        },
        maxRetries: 5,
        requestTimeout: 60000,
        sniffOnStart: true
      })
     /* 
      client.create({
        id: string,
        index: string,
        type: string,
        wait_for_active_shards: string,
        refresh: 'true' | 'false' | 'wait_for',
        routing: string,
        timeout: string,
        version: number,
        version_type: 'internal' | 'external' | 'external_gte',
        pipeline: string,
        body: object
      })
     */
      resolve(client)
    } catch (err) { reject(err) }
  })
}

const engineName = "deepbloo"

exports.connectToPublicAppSearch = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const ElasticAppSearch = require("@elastic/app-search-javascript");
      const client = ElasticAppSearch.createClient({
        searchKey: "search-pg8ft3mtkfkup3occekertmt",
        endpointBase: "https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/",
        engineName,
      });
      resolve(client)
    } catch (err) { reject(err) }
  })
}

exports.connectToPrivateAppSearch = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const AppSearchClient = require('@elastic/app-search-node')
      const privateKey = 'private-ychdiximphcy4avd3kdtrc51'
      const baseUrlFn = () => 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/api/as/v1/'
      const client = new AppSearchClient(undefined, privateKey, baseUrlFn)

      resolve(client)
    } catch (err) { reject(err) }
  })
}

// Indexes an objects array into appsearch's "deepbloo" engine.

exports.indexObject = (objects) => {
  return new Promise(async (resolve, reject) => {
    try {
      // App search seemingly prefers snake case
      const snakedObjects = objects.map((object) => Object.keys(object).reduce((acc, key) => {
        const snakedKey = key.replace(/[\w]([A-Z])/g, (m) => m[0] + "_" + m[1]).toLowerCase()
        acc[snakedKey] = object[key]
        return acc
      }, {}));
      const client = await this.connectToPrivateAppSearch()
      console.log(snakedObjects)
      const response = client.indexDocuments(engineName, snakedObjects)
      resolve(response)
    } catch (err) { reject(err) }
  })
}
