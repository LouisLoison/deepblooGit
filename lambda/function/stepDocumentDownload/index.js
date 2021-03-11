const { tenderFileImport } = require('deepbloo').document
exports.handler =  async function(event, ) {
  console.log(event)
  const { tenderUuid, sourceUrl } = event
  return await tenderFileImport(tenderUuid, sourceUrl)
}
