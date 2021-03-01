const { indexObjectToAppsearch } = require('deepbloo').appsearch

exports.handler =  async function(event, ) {
  const formatedTender = event.formatedData
  if(event.mergedData.data) {
    formatedTender.id = event.mergedData.data.tenderUuid

    return await indexObjectToAppsearch([formatedTender], 'tenders-dev')
  }
  return {}
}
