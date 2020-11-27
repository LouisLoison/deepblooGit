// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { log, BddTool } = require('deepbloo');

BddTool.bddInit('deepbloo','devAws')

exports.handler = async function(event, ) {
  const { analyzedData, convertedData, tenderData } = event
  analyzedData.dataRaw = tenderData

  const tender = await BddTool.RecordAddUpdate (
    'tenderimport',
    analyzedData,
    'dataSource, dataSourceId'
  )
  return {...tender}
}

