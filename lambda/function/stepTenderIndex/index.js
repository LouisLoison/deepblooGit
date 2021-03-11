const { indexObjectToAppsearch } = require('deepbloo').appsearch
const stripHtml = require("string-strip-html")


exports.handler =  async function(event, ) {
  const formatedTender = event.formatedData
  if(event.mergedData.data) {
    formatedTender.id = event.mergedData.data.tenderUuid
    formatedTender.title = stripHtml(formatedTender.title).result
    formatedTender.description = stripHtml(formatedTender.description).result

    return await indexObjectToAppsearch([formatedTender], 'deepbloo-dev')
  }
  return {}
}
