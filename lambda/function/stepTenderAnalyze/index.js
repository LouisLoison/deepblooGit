// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList
const { importTender } = require('deepbloo').tenderimport
const { tenderFormat } = require('deepbloo').tenderformat
const { CpvList } = require('deepbloo').cpv
const { textParseList } = require('deepbloo').textparse
const { log } = require('deepbloo');
// const { log } = require('deepbloo');



let cpvList
const analyzeTender = async (tender) => {
  cpvList = cpvList || await CpvList(null, true)
  return await importTender(tender, cpvList, textParseList)
}

exports.handler =  async function(event, ) {
  const result = { ...event }
  const { tender, importOrigine } = await analyzeTender(event.convertedData)
  if (!tender) {
    result.analyzedData = {
      ...event.convertedData,
      exclusion:  importOrigine.exclusion,
      exclusionWord: importOrigine.exclusionWord,
      status: importOrigine.status,
    }
    result.formatedData = { status: result.analyzedData.status }
  } else {
    result.analyzedData = tender
    const formatedData = await tenderFormat(tender, cpvList, textParseList)
    if(formatedData) {
      result.analyzedData.status = 20
      formatedData.status = 20
      result.formatedData = formatedData
    }
    else {
      result.formatedData = { status: -1 }
    }
  }
  return result
}