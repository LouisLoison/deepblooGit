const { log, BddTool } = require('deepbloo');
const { dbLambda } = require('deepbloo').lambda;


const handler = async function(event, context, client) {
  const savedDocument = await BddTool.RecordAddUpdate (
    'document',
    event,
    'tenderuuid, sourceurl',
    client,
  )
  if (savedDocument.contentType === 'application/zip') {
    savedDocument.parentUuid = savedDocument.documentUuid
  }
  delete savedDocument.documentUuid
  return {...savedDocument}
}

exports.handler = dbLambda(handler)
