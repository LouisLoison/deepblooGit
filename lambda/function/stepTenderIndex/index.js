const { indexObjectToAppsearch } = require('deepbloo').appsearch

exports.handler =  async function(event, ) {
  const formatedTender = event.formatedData
  if(event.mergedData.data) {
    formatedTender.id = event.mergedData.data.tenderUuid
    //formatedTender.power = event.mergedData.data.power
    //formatedTender.voltage = event.mergedData.data.voltage

    return await indexObjectToAppsearch([formatedTender], 'tenders-dev')
  }
  return {}
}
