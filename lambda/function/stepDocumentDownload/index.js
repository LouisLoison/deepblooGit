const { tenderFileImport } = require('deepbloo').document
exports.handler =  async function(event, ) {
  console.log(event)
  const { tenderUuid, sourceUrl, tenderId, filename, status } = event
  if (tenderUuid && filename && status) {
    return await tenderFileImport(tenderUuid, sourceUrl, tenderId)
  }
  return event
}
