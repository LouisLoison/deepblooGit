// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList
const { importTender } = require('deepbloo').tenderimport
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
  const { tender, importOrigine } = await analyzeTender(event)
  if (tender) {
    tender.status = 20
    return tender;
  }
  return {
    ...event,
    exclusion:  importOrigine.exclusion,
    exclusionWord: importOrigine.exclusionWord,
    status: importOrigine.status,
  }
}
