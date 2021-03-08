const { log, BddTool } = require('deepbloo');
const { dbLambda } = require('deepbloo').lambda;


const handler = async function(event, context, client) {
  const savedDocument = await BddTool.RecordAddUpdate (
    'document',
    event,
    'documentUuid',
    client,
  )
  return {...savedDocument}
}

exports.handler = dbLambda(handler)
