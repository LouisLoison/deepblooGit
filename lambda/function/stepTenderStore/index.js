// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { dbLambda } = require('deepbloo').lambda;
const { BddTool } = require('deepbloo');



const handler = async function(event, context, client) {
  const { analyzedData, convertedData, tenderData } = event

  analyzedData.dataRaw = convertedData.dataRaw
  const tender = await BddTool.RecordAddUpdate (
    'tenderimport',
    analyzedData,
    'dataSource, dataSourceId',
    client,
  )

  return {...tender}
}

exports.handler = dbLambda(handler)
