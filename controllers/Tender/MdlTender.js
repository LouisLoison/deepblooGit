exports.TenderAdd = (tender) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      if (tender.cpvs) {
        let cpvDescriptions = tender.cpvs
        tender.cpvs = ''
        tender.cpvDescriptions = ''
        for (let description of cpvDescriptions) {
          let cpv = CpvList.find(a => a.label === description.split('-').join(' ').trim())
          if (cpv) {
            if (tender.cpvDescriptions !== '') {
              tender.cpvs += ','
              tender.cpvDescriptions += ','
            }
            tender.cpvs += cpv.code
            tender.cpvDescriptions += cpv.label
          }
        }
      }

      let termDate = new Date(tender.bidDeadlineDate)
      if (isNaN(termDate)) {
        throw new Error('BID deadline invalide !')
      }

      tender.publicationDate = tender.publicationDate.split('-').join('').trim()
      tender.bidDeadlineDate = tender.bidDeadlineDate.split('-').join('').trim()

      // Search cpv by key words
      let cpvFound = require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').DescriptionParseForCpv(tender.description, tender.cpvs, tender.cpvDescriptions)
      tender.cpvs = cpvFound.cpvsText
      tender.cpvDescriptions = cpvFound.cpvDescriptionsText

      tender.dgmarketId = 0
      tender.status = 0
      tender.creationDate = new Date()
      tender.updateDate = tender.creationDate
      let data = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'dgmarket', tender)
      //await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TenderAdd(tender)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TendersImport()
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}
