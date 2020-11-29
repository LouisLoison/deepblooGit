// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { log, BddTool } = require('deepbloo');


exports.handler = async function(event, ) {
  const { analyzedData, convertedData, tenderData } = event
  analyzedData.dataRaw = tenderData
  await BddTool.bddInit()
  const tender = await BddTool.RecordAddUpdate (
    'tenderimport',
    analyzedData,
    'dataSource, dataSourceId'
  )
  return {...tender}
}

