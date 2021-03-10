const { tenderFileImport } = require('deepbloo').document
exports.handler =  async function(event, ) {
  console.log(event)
  const { tenderUuid, sourceUrl, tenderId } = event

  const doc = await tenderFileImport(tenderUuid, sourceUrl, tenderId)
  delete doc.sourceUrl
  doc.parentUuid = doc.documentUuid
  delete doc.documentUuid
  return doc
}
