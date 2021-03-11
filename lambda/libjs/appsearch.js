const AppSearchClient = require('@elastic/app-search-node')
const { getAppsearchSecret } = require('./config')

let client = false

exports.connectToPrivateAppSearch = async () => {
  const config = await getAppsearchSecret()
  const privateKey = config.appsearchPrivateKey
  const baseUrlFn = () => config.appsearchEndpoint + 'api/as/v1/'
  client = client || new AppSearchClient(undefined, privateKey, baseUrlFn)
  return client
}

// Indexes an objects array into appsearch's "deepbloo" engine.
// This will update any document having the same "id" fields,
// adding any new field to the document


exports.indexObjectToAppsearch = async (objects, engineName = "tenders") => {
  // Init object id
  for (const object of objects) {
    if (!object.id && object.tenderUuid) {
      object.id = object.tenderUuid
      delete object.tenderUuid
    }
  }
  // App search seemingly prefers snake case
  const snakedObjects = objects.map((object) => Object.keys(object).reduce((acc, key) => {
    const snakedKey = key.replace(/[\w]([A-Z])/g, (m) => m[0] + "_" + m[1]).toLowerCase()
    acc[snakedKey] = object[key]
    return acc
  }, {}));
  // console.log(snakedObjects)
  const client = await this.connectToPrivateAppSearch()
  const response = client.indexDocuments(engineName, snakedObjects)
  return(response)
}
