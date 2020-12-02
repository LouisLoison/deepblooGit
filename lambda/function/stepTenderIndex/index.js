const { indexObjectToAppsearch } = require('deepbloo').appsearch



exports.handler =  async function(event, ) {
  const formatedTender = event.formatedData
  if(event.mergedData.data) {
    formatedTender.id = event.mergedData.data.tenderuuid
    return await indexObjectToAppsearch([formatedTender], 'deepbloo-dev')
  }
  return {}
}
