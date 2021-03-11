exports.statistics = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let statistics = {
        dgMarket: [],
        tenderInfo: [],
      }

      let query = `
        SELECT 		importDgmarket.fileSource, 
                  COUNT(*) AS "total", 
                  COUNT(CASE WHEN importDgmarket.mergeMethod = "PROCUREMENT_ID" THEN 1 END) AS "sameId", 
                  COUNT(CASE WHEN importDgmarket.mergeMethod = "TITLE_BUYER_BIDDEADLINE" THEN 1 END) AS "titleBuyerBiddeadline", 
                  COUNT(CASE WHEN importDgmarket.status = -10 THEN 1 END) AS "excluded", 
                  MIN(creationDate) AS "creationDate" 
        FROM 			importDgmarket 
        GROUP BY 	importDgmarket.fileSource 
        ORDER BY  importDgmarket.fileSource DESC 
        LIMIT 100
      `
      let where = ''
      if (filter) {
        if (filter.statuss && filter.statuss.length) {
          if (where !== '') { where += 'AND ' }
          where += `importDgmarket.status IN (${BddTool.ArrayNumericFormater(filter.statuss, BddEnvironnement, BddId)}) \n`
        }
      }
      if (where !== '') { query += '\nWHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query, true)
      for (const record of recordset.results) {
        statistics.dgMarket.push({
          fileSource: record.fileSource,
          total: record.total,
          sameId: record.sameId,
          titleBuyerBiddeadline: record.titleBuyerBiddeadline,
          excluded: record.excluded,
          creationDate: record.creationDate,
        })
      }
      
      query = `
        SELECT 		importTenderInfo.fileSource, 
                  COUNT(*) AS "total", 
                  COUNT(CASE WHEN importTenderInfo.mergeMethod = "PROCUREMENT_ID" THEN 1 END) AS "sameId", 
                  COUNT(CASE WHEN importTenderInfo.mergeMethod = "TITLE_BUYER_BIDDEADLINE" THEN 1 END) AS "titleBuyerBiddeadline", 
                  COUNT(CASE WHEN importTenderInfo.status = -10 THEN 1 END) AS "excluded", 
                  MIN(creationDate) AS "creationDate" 
        FROM 			importTenderInfo 
        GROUP BY 	importTenderInfo.fileSource 
        ORDER BY  importTenderInfo.fileSource DESC 
        LIMIT 100
      `
      where = ''
      if (filter) {
        if (filter.statuss && filter.statuss.length) {
          if (where !== '') { where += 'AND ' }
          where += `importTenderInfo.status IN (${BddTool.ArrayNumericFormater(filter.statuss, BddEnvironnement, BddId)}) \n`
        }
      }
      if (where !== '') { query += '\nWHERE ' + where }
      recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query, true)
      for (const record of recordset.results) {
        statistics.tenderInfo.push({
          fileSource: record.fileSource,
          total: record.total,
          sameId: record.sameId,
          titleBuyerBiddeadline: record.titleBuyerBiddeadline,
          excluded: record.excluded,
          creationDate: record.creationDate,
        })
      }

      resolve(statistics)
    } catch (err) {
      reject(err)
    }
  })
}

exports.importTender = (tender, CpvList, textParses) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { v4: uuidv4 } = require('uuid')
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const importOrigine = {}

      // HTML format
      const descriptionLowerCase = tender.description.toLowerCase()
      if (descriptionLowerCase.includes("<br") || descriptionLowerCase.includes("<table") || descriptionLowerCase.includes("<div")) {
        tender.description = tender.description.replace(/\r/gm, '<br>')
      }

      // Test exclusion
      let isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(tender.title, 'TITLE')
      if (!isOk.status) {
        importOrigine.exclusion = 'TITLE'
        importOrigine.exclusionWord = isOk.origine
        importOrigine.status = -10
        resolve({importOrigine})
        return
      }
      isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(tender.description, 'DESCRIPTION')
      if (!isOk.status) {
        importOrigine.exclusion = 'DESCRIPTION'
        importOrigine.exclusionWord = isOk.origine
        importOrigine.status = -10
        resolve({importOrigine})
        return
      }

      // Search CPVs and criterions
      const dataSearchCpvCriterions = await this.searchCpvCriterions(tender, CpvList, textParses)
      if (dataSearchCpvCriterions.importExclusion) {
        importOrigine.exclusion = dataSearchCpvCriterions.importExclusion.exclusion
        importOrigine.exclusionWord = dataSearchCpvCriterions.importExclusion.exclusionWord
        importOrigine.status = -10
        resolve({importOrigine})
        return
      }
      tender = dataSearchCpvCriterions.tender
      tender.status = 0
      tender.updateDate = new Date()

      // Remove tenderCriterion
      if (tender.id) {
        query = `DELETE FROM tenderCriterionCpv WHERE tenderId = ${BddTool.NumericFormater(tender.id, BddEnvironnement, BddId)}`
        await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
        query = `DELETE FROM tenderCriterion WHERE tenderId = ${BddTool.NumericFormater(tender.id, BddEnvironnement, BddId)}`
        await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      } else {
        tender.tenderUuid = uuidv4()
      }

      const tenderNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'dgmarket', tender, 'id')

      // Bulk insert into tenderCriterion table
      if (tender.tenderCriterionCpvs && tender.tenderCriterionCpvs.length) {
        for (const tenderCriterionCpv of tender.tenderCriterionCpvs) {
          tenderCriterionCpv.tenderId = tenderNew.id
          tenderCriterionCpv.cpv = undefined
          tenderCriterionCpv.creationDate = new Date()
          tenderCriterionCpv.updateDate = new Date()
        }
        await BddTool.bulkInsert(
          BddId,
          BddEnvironnement,
          'tenderCriterionCpv',
          tender.tenderCriterionCpvs
        )  
      }
      if (tender.tenderCriterions && tender.tenderCriterions.length) {
        for (const tenderCriterion of tender.tenderCriterions) {
          tenderCriterion.tenderId = tenderNew.id
          tenderCriterion.creationDate = new Date()
          tenderCriterion.updateDate = new Date()
        }
        await BddTool.bulkInsert(
          BddId,
          BddEnvironnement,
          'tenderCriterion',
          tender.tenderCriterions
        )  
      }

      resolve({tender})
    } catch (err) {
      reject(err)
    }
  })
}

exports.searchCpvCriterions = (tender, CpvList, textParses) => {
  return new Promise(async (resolve, reject) => {
    try {
      let importExclusion = {}

      // Search CPV by key words
      tender.cpvsOrigine = tender.cpvs
      const tenderCriterionCpvsTitle = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.title, CpvList, true, 'TITLE')
      if (tenderCriterionCpvsTitle.length) {
        isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusionIfNoCpv(tender.title, 'TITLE')
        if (!isOk.status) {
          importExclusion.exclusion = 'TITLE'
          importExclusion.exclusionWord = isOk.origine
          resolve({ importExclusion })
          return
        }
      }
      const tenderCriterionCpvsDescription = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.description, CpvList, true, 'DESCRIPTION')
      const tenderCriterionCpvs = []
      for (const cpvText of tender.cpvsOrigine.split(',')) {
        let cpvCode = parseInt(cpvText, 10)
        const cpv = CpvList.find(
          a => a.code === cpvCode
        )
        if (!cpv) {
          continue
        }
        const tenderCriterionCpv = tenderCriterionCpvs.find(
          a => a.cpvId === cpv.cpvId && a.scope === 'PROVIDER_DGMARKET'
        )
        if (!tenderCriterionCpv) {
          tenderCriterionCpvs.push({
            documentId: 0,
            cpvId: cpv.cpvId,
            value: cpv.label,
            word: '',
            findCount: 1,
            scope: 'PROVIDER_DGMARKET',
            status: 1,
            cpv,
          })
        } else {
          tenderCriterionCpv.findCount = tenderCriterionCpv.findCount + 1
        }
      }
      for (const tenderCriterionCpvTitle of tenderCriterionCpvsTitle) {
        const tenderCriterionCpv = tenderCriterionCpvs.find(
          a => a.cpvId === tenderCriterionCpvTitle.cpvId && a.scope === 'TITLE'
        )
        if (!tenderCriterionCpv) {
          tenderCriterionCpvs.push({
            documentId: 0,
            cpvId: tenderCriterionCpvTitle.cpvId,
            value: tenderCriterionCpvTitle.value,
            word: tenderCriterionCpvTitle.word,
            findCount: 1,
            scope: 'TITLE',
            status: 1,
            cpv: tenderCriterionCpvTitle.cpv,
          })
        } else {
          tenderCriterionCpv.findCount = tenderCriterionCpv.findCount + 1
        }
      }
      for (const tenderCriterionCpvDescription of tenderCriterionCpvsDescription) {
        const tenderCriterionCpv = tenderCriterionCpvs.find(
          a => a.cpvId === tenderCriterionCpvDescription.cpvId && a.scope === 'DESCRIPTION'
        )
        if (!tenderCriterionCpv) {
          tenderCriterionCpvs.push({
            documentId: 0,
            cpvId: tenderCriterionCpvDescription.cpvId,
            value: tenderCriterionCpvDescription.value,
            word: tenderCriterionCpvDescription.word,
            findCount: 1,
            scope: 'DESCRIPTION',
            status: 1,
            cpv: tenderCriterionCpvDescription.cpv,
          })
        } else {
          tenderCriterionCpv.findCount = tenderCriterionCpv.findCount + 1
        }
      }
      let words = [...new Set(tenderCriterionCpvs.filter(a => a.word.trim() !== '').map(a => a.word))]
      let cpvCodes = [...new Set(tenderCriterionCpvs.map(a => a.cpv.code))]
      let cpvDescriptions = [...new Set(tenderCriterionCpvs.map(a => a.cpv.label))]
      if (!cpvCodes || !cpvCodes.length) {
        importExclusion.exclusion = 'NO_CPV'
        importExclusion.exclusionWord = ''
        resolve({ importExclusion })
        return
      }

      // Search tenderCriterions
      const tenderCriterionsTitle = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(tender.title, textParses, 'TITLE')
      const tenderCriterionsDescription = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(tender.description, textParses, 'DESCRIPTION')
      const tenderCriterions = []
      for (const tenderCriterionTitle of tenderCriterionsTitle) {
        const tenderCriterion = tenderCriterions.find(
          a => a.textParseId === tenderCriterionTitle.textParseId && a.scope === 'TITLE'
        )
        if (!tenderCriterion) {
          tenderCriterions.push({
            documentId: 0,
            textParseId: tenderCriterionTitle.textParseId,
            value: tenderCriterionTitle.value,
            word: tenderCriterionTitle.word,
            findCount: 1,
            scope: 'TITLE',
            status: 1,
          })
        } else {
          tenderCriterion.findCount = tenderCriterion.findCount + 1
        }
      }
      for (const tenderCriterionDescription of tenderCriterionsDescription) {
        const tenderCriterion = tenderCriterions.find(
          a => a.textParseId === tenderCriterionDescription.textParseId && a.scope === 'DESCRIPTION'
        )
        if (!tenderCriterion) {
          tenderCriterions.push({
            documentId: 0,
            textParseId: tenderCriterionDescription.textParseId,
            value: tenderCriterionDescription.value,
            word: tenderCriterionDescription.word,
            findCount: 1,
            scope: 'DESCRIPTION',
            status: 1,
          })
        } else {
          tenderCriterion.findCount = tenderCriterion.findCount + 1
        }
      }

      tender.words = words
      tender.cpvs = cpvCodes.slice(0, 25).join()
      tender.cpvDescriptions = cpvDescriptions.slice(0, 25).join()
      tender.tenderCriterionCpvs = tenderCriterionCpvs
      tender.tenderCriterions = tenderCriterions

      resolve({ tender })
    } catch (err) {
      reject(err)
    }
  })
}
