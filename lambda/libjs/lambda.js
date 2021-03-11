const BddTool = require('./db/BddTool')

exports.dbLambda = (handler) => async (event, context) => {
  const client = await BddTool.getClient()
  try {
    await BddTool.QueryExecPrepared(client, 'START TRANSACTION ISOLATION LEVEL READ COMMITTED;')
    const result = handler(event, context, client)
    await BddTool.QueryExecPrepared(client, 'COMMIT;');
    client.release()
    return(result)
  }
  catch(err) {
    await BddTool.QueryExecPrepared(client, 'ROLLBACK;');
    client.release()
    console.log('Exception caught, rolling back transaction')
    throw (err)
  }
}
