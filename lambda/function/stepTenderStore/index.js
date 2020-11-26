// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { log, BddTool } = require('deepbloo');


exports.handler = async function(event, ) {
  const { analyzedData, convertedData, tenderData } = event
  analyzedData.dataRaw = tenderData

  BddTool.bddInit('deepbloo','devAws')
  const tender = await BddTool.RecordAddUpdate (
    'tenderimport',
    analyzedData,
    'source_id_import_unicity_key'
  )
  return {...event, stored: {...tender}}
}

