// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { log, BddTool } = require('deepbloo');


exports.handler = async function(event, ) {
  const { analyzedData, convertedData, tenderData } = event
  const client = await BddTool.bddInit()
  await BddTool.QueryExecPrepared(client, 'BEGIN;');

  analyzedData.dataRaw = tenderData
  const tender = await BddTool.RecordAddUpdate (
    'tenderimport',
    analyzedData,
    'dataSource, dataSourceId',
    client,
  )


  await BddTool.QueryExecPrepared(client, 'COMMIT;');
  client.release()
  return {...tender}
}
