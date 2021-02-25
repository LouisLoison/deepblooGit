const { log, BddTool } = require('deepbloo');


exports.handler = async function(event, ) {
  const client = await BddTool.getClient()
  await BddTool.QueryExecPrepared(client, 'START TRANSACTION ISOLATION LEVEL READ COMMITTED;');

  const savedDocument = await BddTool.RecordAddUpdate (
    'document',
    event,
    'documentUuid',
    client,
  )

  await BddTool.QueryExecPrepared(client, 'COMMIT;');
  client.release()
  return {...savedDocument}
}
