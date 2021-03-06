exports.TendersImport = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const CpvList = await require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvList()
      const textParses = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()

      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      
      const tenderStatus = '0'
      let query = `
        SELECT      tenderCriterion.tenderCriterionId AS "tenderCriterionId", 
                    tenderCriterion.tenderId AS "tenderId", 
                    tenderCriterion.textParseId AS "textParseId", 
                    tenderCriterion.value AS "value", 
                    tenderCriterion.word AS "word", 
                    tenderCriterion.findCount AS "findCount", 
                    tenderCriterion.scope AS "scope", 
                    tenderCriterion.status AS "status", 
                    tenderCriterion.creationDate AS "creationDate", 
                    tenderCriterion.updateDate AS "updateDate" 
        FROM        tenders 
        INNER JOIN  tenderCriterion ON tenderCriterion.tenderId = tenders.id 
        WHERE       tenders.status = ${tenderStatus} 
      `
      let recordset = await BddTool.QueryExecBdd2(query)
      const tenderCriterionAlls = []
      for (let record of recordset) {
        tenderCriterionAlls.push({
          tenderCriterionId: record.tenderCriterionId,
          tenderId: record.tenderId,
          documentUuid: record.documentUuid,
          textParseId: record.textParseId,
          value: record.value,
          word: record.word,
          findCount: record.findCount,
          scope: record.scope,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate,
        })
      }
      
      query = `
        SELECT      id AS "id", 
                    dataSourceId AS "dataSourceId", 
                    procurementId AS "procurementId", 
                    tenderUuid AS "tenderUuid", 
                    title AS "title", 
                    description AS "description", 
                    lang AS "lang", 
                    contactFirstName AS "contactFirstName", 
                    contactLastName AS "contactLastName", 
                    contactAddress AS "contactAddress", 
                    contactCity AS "contactCity", 
                    contactState AS "contactState", 
                    contactCountry AS "contactCountry", 
                    contactEmail AS "contactEmail", 
                    contactPhone AS "contactPhone", 
                    buyerName AS "buyerName", 
                    buyerCountry AS "buyerCountry", 
                    procurementMethod AS "procurementMethod", 
                    noticeType AS "noticeType", 
                    country AS "country", 
                    estimatedCost AS "estimatedCost", 
                    currency AS "currency", 
                    publicationDate AS "publicationDate", 
                    cpvsOrigine AS "cpvsOrigine", 
                    cpvs AS "cpvs", 
                    cpvDescriptions AS "cpvDescriptions", 
                    words AS "words", 
                    bidDeadlineDate AS "bidDeadlineDate", 
                    sourceUrl AS "sourceUrl", 
                    userId AS "userId",
                    fileSource AS "fileSource", 
                    algoliaId AS "algoliaId", 
                    origine AS "origine", 
                    status AS "status", 
                    creationDate AS "creationDate", 
                    updateDate AS "updateDate" 
        FROM        tenders 
        WHERE       status = ${tenderStatus} 
      `
      recordset = await BddTool.QueryExecBdd2(query)
      const tenders = []
      const tendersWithCriterions = []
      const tenderIdDeletes = []
      for (const record of recordset) {
        record.tenderCriterions = tenderCriterionAlls.filter(a => a.tenderId === record.id)
        let tender = await this.TenderFormat(record, CpvList, textParses)
        if (!tender) {
          if (record.id) {
            tenderIdDeletes.push(record.id)
          }
          continue
        }
        if (tender.algoliaId) {
          tender.objectID = tender.algoliaId
        }
        tenders.push(tender)
        const tenderWithCriterions = {
          ...tender,
          tenderCriterions: record.tenderCriterions,
        }
        tendersWithCriterions.push(tenderWithCriterions)
      }

      const tranches = []
      let borneMin = 0
      let occurence = 20
      do {
        tranches.push(tenders.slice(borneMin, (borneMin + occurence)))
        borneMin += occurence
      } while (borneMin < tenders.length && tranches.length < 100)

      const algoliasearch = require('algoliasearch')
      let applicationId = '583JWW9ARP'
      let apiKey = '5cc468809130d45b76cf76598a09ff21'
      let client = algoliasearch(applicationId, apiKey, { timeout: 4000 })
      let index = client.initIndex(`${config.prefixe}_tenders`)
      for (tranche of tranches) {
        if (tranche.length > 0) {
          try {
            let trancheNew = await require(process.cwd() + '/controllers/Elasticsearch/MdlElasticsearch').tendersFormat(tranche)
            await require(process.cwd() + '/controllers/Elasticsearch/MdlElasticsearch').indexObjectToAppsearch(trancheNew)
          } catch (err) {
            console.log('Elasticsearch indexObject error')
          }
          await this.TendersAdd(tranche, index)
        }
      }

      // Dispatch tenders to user group
      try {
        await require(process.cwd() + '/controllers/Tender/MdlTender').tenderUserGroupDispatch(tendersWithCriterions)
      } catch (err) {
        console.log(err)
      }

      for (const tenderId of tenderIdDeletes) {
        await BddTool.QueryExecBdd2(`
          DELETE FROM tenders 
          WHERE       id = ${BddTool.NumericFormater(tenderId)} 
        `)
      }
      
      resolve(tenders.length)
    } catch (err) { reject(err) }
  })
}

exports.TenderFormat = (tender, CpvList, textParses) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!CpvList) {
        console.log('[TenderFormat] no CPV list !')
        CpvList = await require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvList()
      }
      const RegionList = require(process.cwd() + '/public/constants/regions.json')
      const CategoryList = require(process.cwd() + '/public/constants/categories.json')

      // Url source list
      let sourceUrls = []
      let sourceUrl = tender.sourceUrl
      if (sourceUrl) {
        sourceUrl.split(',').forEach(url => {
          sourceUrls.push(url)
        })
      }

      // CPV list
      let cpvOkCount = 0
      let cpvs = []
      let cpvsText = tender.cpvs
      let cpvDescriptionsText = tender.cpvDescriptions
      if (cpvsText && cpvDescriptionsText) {
        let cpvsTextTemp = cpvsText.split(',')
        let cpvDescriptionsTextTemp = cpvDescriptionsText.split(',')
        for (let i = 0; i < cpvsTextTemp.length; i++) {
          let code = parseInt(cpvsTextTemp[i], 10)
          let cpv = CpvList.find(a => Number(a.code) === Number(code))
          if (cpv) {
            if (cpv.active) {
              cpvOkCount++
            }
            cpvs.push(cpvDescriptionsTextTemp[i].split('-').join(' ').trim())
          }
        }
      }
      if (cpvOkCount === 0) {
        resolve(null)
      }

      // Categories
      let categories = []
      let families = []
      let categoryLvl0 = []
      let categoryLvl1 = []
      if (cpvsText && cpvDescriptionsText) {
        let cpvsTextTemp = cpvsText.split(',')
        for (let i = 0; i < cpvsTextTemp.length; i++) {
          let code = parseInt(cpvsTextTemp[i], 10)
          let cpv = CpvList.find(a => a.code === code)
          if (cpv) {
            if (cpv.category && cpv.category !== '') {
              if (!categories.includes(cpv.category)) {
                categories.push(cpv.category)
              }
              if (!categoryLvl0.includes(cpv.category)) {
                categoryLvl0.push(cpv.category)
              }
              if (!categoryLvl1.includes(`${cpv.category} > ${cpv.label}`)) {
                categoryLvl1.push(`${cpv.category} > ${cpv.label}`)
              }
            }
            let category = CategoryList.find(a => a.category === cpv.category)
            if (category && !families.includes(category.family)) {
              families.push(category.family)
            }
          }
        }
      }

      // Region
      let regionLvl0 = []
      let regionLvl1 = []
      let regionLvl2 = []
      for (let region of RegionList) {
        if (region.countrys && region.countrys.includes(tender.country)) {
          regionLvl0.push(region.label)
          regionLvl1.push(`${region.label} > ${tender.country}`)
        }
        if (region.regions) {
          for (let region2 of region.regions) {
            if (region2.countrys && region2.countrys.includes(tender.country)) {
              regionLvl0.push(region.label)
              regionLvl1.push(`${region.label} > ${region2.label}`)
              regionLvl2.push(`${region.label} > ${region2.label} > ${tender.country}`)
            }
          }
        }
      }

      let dateText = tender.publicationDate
      let publicationDate = ''
      if (dateText.includes('-')) {
        publicationDate = dateText
      } else {
        publicationDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
      }
      let publication_timestamp = new Date(publicationDate).getTime()

      dateText = tender.bidDeadlineDate
      let bidDeadlineDate = ''
      if (dateText.includes('-')) {
        bidDeadlineDate = dateText
      } else {
        bidDeadlineDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
      }
      let bidDeadline_timestamp = new Date(bidDeadlineDate).getTime()

      let tenderNew = {
        objectID: tender.algoliaId ? tender.algoliaId : undefined,
        dataSourceId: tender.dataSourceId,
        tenderId: tender.id,
        procurementId: tender.procurementId,
        tenderUuid: tender.tenderUuid,
        title: tender.title,
        lang: tender.lang,
        description: tender.description,
        contact: {
          firstName: tender.contactFirstName,
          lastName: tender.contactLastName,
          address: tender.contactAddress,
          city: tender.contactCity,
          state: tender.contactState,
          country: tender.contactCountry,
          email: tender.contactEmail,
          phone: tender.contactPhone,
        },
        buyer: {
          name: tender.buyerName,
          country: tender.buyerCountry,
        },
        procurementMethod: tender.procurementMethod,
        noticeType: tender.noticeType,
        country: tender.country,
        regionLvl0: regionLvl0,
        regionLvl1: regionLvl1,
        regionLvl2: regionLvl2,
        categories: categories,
        families: families,
        categoryLvl0: categoryLvl0,
        categoryLvl1: categoryLvl1,
        words: tender.words,
        currency: tender.currency ? tender.currency.trim() : '',
        publicationDate: publicationDate,
        publication_timestamp: publication_timestamp,
        cpvsOrigine: tender.cpvsOrigine,
        cpvs: cpvs,
        bidDeadlineDate: bidDeadlineDate,
        bidDeadline_timestamp: bidDeadline_timestamp,
        creation_timestamp: new Date().getTime(),
        // creation_timestamp: new Date('2019-04-02T08:24:00').getTime(),
        // creation_timestamp: publication_timestamp,
        sourceUrls: sourceUrls,
        userId: tender.userId ? tender.userId : 0,
        scopeOfWorks: [],
        segments: [],
        designs: [],
        contractTypes: [],
        brands: [],
        financials: [],
        fileSource: tender.fileSource,
        groups: [],
        origine: tender.origine,
      }

      if (tender.tenderCriterions) {
        for (const tenderCriterion of tender.tenderCriterions) {
          const textParse = textParses.find(a => a.textParseId === tenderCriterion.textParseId)
          if (!textParse) {
            continue
          }
          if (textParse.theme === "Scope of Work" && !tenderNew.scopeOfWorks.includes(textParse.group)) {
            tenderNew.scopeOfWorks.push(textParse.group)
          } else if (textParse.theme === "Segment" && !tenderNew.segments.includes(textParse.group)) {
            tenderNew.segments.push(textParse.group)
          } else if (textParse.theme === "Design" && !tenderNew.designs.includes(textParse.group)) {
            tenderNew.designs.push(textParse.group)
          } else if (textParse.theme === "Contract type" && !tenderNew.contractTypes.includes(textParse.group)) {
            tenderNew.contractTypes.push(textParse.group)
          } else if (textParse.theme === "Brand" && !tenderNew.brands.includes(textParse.group)) {
            tenderNew.brands.push(textParse.group)
          } else if (textParse.theme === "Financial Organization" && !tenderNew.financials.includes(textParse.group)) {
            tenderNew.financials.push(textParse.group)
          }
        }
      }
      resolve(tenderNew)
    } catch (err) { reject(err) }
  })
}

exports.TendersAdd = (tenders, index) => {
  return new Promise(async (resolve, reject) => {
    index.addObjects(tenders, async (err, content) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      const config = require(process.cwd() + '/config')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      for (let i = 0; i < tenders.length; i++) {
        tenders[i].objectID = content.objectIDs[i]
        await BddTool.QueryExecBdd2(`
          UPDATE      tenders 
          SET         algoliaId = '${BddTool.ChaineFormater(tenders[i].objectID)}', 
                      status = 20 
          WHERE       id = ${BddTool.NumericFormater(tenders[i].tenderId)} 
        `)
      }
      resolve(tenders)
    })
  })
}

exports.TenderUpdate = (tender, index) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const algoliasearch = require('algoliasearch')

      if (!index) {
        const client = algoliasearch(config.algoliaApplicationId, config.algoliaApiKey, { timeout: 4000 })
        index = client.initIndex(`${config.prefixe}_tenders`)
      }
      await index.partialUpdateObjects([tender])
      resolve()
    } catch (err) { reject(err) }
  })
}

exports.tendersObsoleteRemove = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')

      let termDate = new Date()
      termDate.setDate(termDate.getDate() - 180)
      const noticeTypeExclusion = 'Contract Award'
      const status = 20
      const orderBy = 'termDate ASC'
      const limit = 250
      const tenders = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderList(null, null, null, null, null, termDate, null, null, limit, null, null, orderBy, true, status, noticeTypeExclusion)

      const tenderIds = tenders.map(a => a.id)
      const query = `
        UPDATE      tenders 
        SET         status = -1 
        WHERE       id IN (${BddTool.ArrayNumericFormater(tenderIds)}) 
      `
      await BddTool.QueryExecBdd2(query)
      await this.TendersPurge()

      resolve()
    } catch (err) { reject(err) }
  })
}

exports.TendersPurge = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      let query = `
        SELECT      algoliaId AS "algoliaId" 
        FROM        tenders 
        WHERE       status = -1 
        LIMIT       300
      `
      let recordset = await BddTool.QueryExecBdd2(query)
      const algoliaIds = []
      for (let record of recordset) {
        algoliaIds.push(record.algoliaId);
      }

      const tranches = []
      let borneMin = 0
      let occurence = 100
      do {
        tranches.push(algoliaIds.slice(borneMin, (borneMin + occurence)))
        borneMin += occurence
      } while (borneMin < algoliaIds.length && tranches.length < 100)

      const algoliasearch = require('algoliasearch')
      let applicationId = '583JWW9ARP'
      let apiKey = '5cc468809130d45b76cf76598a09ff21'
      let client = algoliasearch(applicationId, apiKey, { timeout: 4000 })
      let index = client.initIndex(`${config.prefixe}_tenders`)
      for (tranche of tranches) {
        if (tranche.length > 0) {
          await this.TendersRemove(algoliaIds, index)
        }
      }
      resolve()
    } catch (err) { reject(err) }
  })
}

exports.TendersRemove = (algoliaIds, index) => {
  return new Promise(async (resolve, reject) => {
    index.deleteObjects(algoliaIds, async (err, content) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      const config = require(process.cwd() + '/config')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      for (let i = 0; i < algoliaIds.length; i++) {
        await BddTool.QueryExecBdd2(`
          UPDATE      tenders 
          SET         status = -2 
          WHERE       algoliaId = ${BddTool.NumericFormater(algoliaIds[i])} 
        `)
      }
      resolve()
    })
  })
}

exports.PrivateDealsImport = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')

      const privateDeals = await require(process.cwd() + '/controllers/PrivateDeal/MdlPrivateDeal').PrivateDealList({
        status: 0
      })

      for (const privateDeal of privateDeals) {
        if (privateDeal.algoliaId) {
          privateDeal.objectID = privateDeal.algoliaId;
        }
        if (privateDeal.region && privateDeal.region !== '') {
          const regions = privateDeal.region.split('-');
          privateDeal.country = regions[regions.length - 1];
          if (regions.length === 3) {
            privateDeal.regionLvl0 = [regions[0]];
            privateDeal.regionLvl1 = [`${regions[0]} > ${regions[1]}`];
            privateDeal.regionLvl2 = [`${regions[0]} > ${regions[1]} > ${regions[2]}`];
          } else if (regions.length === 2) {
            privateDeal.regionLvl0 = [regions[0]];
            privateDeal.regionLvl1 = [`${regions[0]} > ${regions[1]}`];
          }
        }
        privateDeal.lookingFor= privateDeal.lookingFor ? privateDeal.lookingFor.split(',') : [];
      }

      const tranches = []
      let borneMin = 0
      let occurence = 20
      do {
        tranches.push(privateDeals.slice(borneMin, (borneMin + occurence)))
        borneMin += occurence
      } while (borneMin < privateDeals.length && tranches.length < 100)

      const algoliasearch = require('algoliasearch')
      let applicationId = '583JWW9ARP'
      let apiKey = '5cc468809130d45b76cf76598a09ff21'
      let client = algoliasearch(applicationId, apiKey, { timeout: 4000 })
      let index = client.initIndex(`${config.prefixe}_privateDeals`)
      for (tranche of tranches) {
        if (tranche.length > 0) {
          await this.PrivateDealsAdd(tranche, index)
        }
      }
      resolve(privateDeals.length)
    } catch (err) { reject(err) }
  })
}

exports.PrivateDealsAdd = (privateDeals, index) => {
  return new Promise(async (resolve, reject) => {
    index.addObjects(privateDeals, async (err, content) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      const config = require(process.cwd() + '/config')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      for (let i = 0; i < privateDeals.length; i++) {
        privateDeals[i].objectID = content.objectIDs[i]
        await BddTool.QueryExecBdd2(`
          UPDATE      privateDeal 
          SET         algoliaId = '${BddTool.ChaineFormater(privateDeals[i].objectID)}', 
                      status = 20 
          WHERE       privateDealId = ${BddTool.NumericFormater(privateDeals[i].privateDealId)} 
        `)
      }
      resolve(privateDeals)
    })
  })
}

exports.PrivateDealsPurge = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      let query = `
        SELECT      algoliaId AS "algoliaId" 
        FROM        privateDeal 
        WHERE       status = -1 
        LIMIT       300
      `
      let recordset = await BddTool.QueryExecBdd2(query)
      const algoliaIds = []
      for (let record of recordset) {
        algoliaIds.push(record.algoliaId);
      }

      const tranches = []
      let borneMin = 0
      let occurence = 100
      do {
        tranches.push(algoliaIds.slice(borneMin, (borneMin + occurence)))
        borneMin += occurence
      } while (borneMin < algoliaIds.length && tranches.length < 100)

      const algoliasearch = require('algoliasearch')
      let applicationId = '583JWW9ARP'
      let apiKey = '5cc468809130d45b76cf76598a09ff21'
      let client = algoliasearch(applicationId, apiKey, { timeout: 4000 })
      let index = client.initIndex(`${config.prefixe}_privateDeals`)
      for (tranche of tranches) {
        if (tranche.length > 0) {
          await this.PrivateDealsRemove(algoliaIds, index)
        }
      }
      resolve()
    } catch (err) { reject(err) }
  })
}

exports.PrivateDealsRemove = (algoliaIds, index) => {
  return new Promise(async (resolve, reject) => {
    index.deleteObjects(algoliaIds, async (err, content) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      const config = require(process.cwd() + '/config')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      for (let i = 0; i < algoliaIds.length; i++) {
        await BddTool.QueryExecBdd2(`
          UPDATE      privateDeal 
          SET         status = -2 
          WHERE       algoliaId = ${BddTool.NumericFormater(algoliaIds[i])} 
        `)
      }
      resolve()
    })
  })
}

exports.TendersSynchro = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const algoliasearch = require('algoliasearch')
      let applicationId = '583JWW9ARP'
      let apiKey = '5cc468809130d45b76cf76598a09ff21'
      let client = algoliasearch(applicationId, apiKey, { timeout: 4000 })
      let index = client.initIndex(`${config.prefixe}_tenders`)
      const CpvList = await require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvList()
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let tenderNbr = 0
      let tenderAddNbr = 0
      let tenderUpdNbr = 0
      
      const browser = index.browseAll()
      
      browser.on('result', async content => {
        //tenderNbr += content.hits.length
        for (const hit of content.hits) {
          tenderNbr++

          // check biddeadline
          let termDate = new Date()
          let dateText = hit.bidDeadlineDate
          if (dateText && dateText.trim() !== '') {
            termDate = new Date(hit.bidDeadlineDate)
            let dateLimit = new Date()
            dateLimit.setDate(dateLimit.getDate() - 15)
            if (isNaN(termDate)) {
              termDate = new Date()
            }
          }

          let cpvs = []
          let cpvDescriptions = hit.cpvs.join(',')
          for (const cpv of hit.cpvs) {
            const cpvFound = CpvList.find(a => a.label === cpv)
            if (cpvFound) {
              cpvs.push(cpvFound.code)
            }
          }
          cpvs = cpvs.join(',')
          
          // Search tender in BDD
          let query = `
            SELECT      id AS "id", 
                        dataSourceId AS "dataSourceId"
            FROM        tenders 
            WHERE       id = ${BddTool.NumericFormater(hit.tenderId)} 
          `
          let recordset = await BddTool.QueryExecBdd2(query)
          if (!recordset || !recordset.length) {
            query = `
              INSERT INTO tenders (
                id,
                dataSourceId,
                procurementId,
                tenderUuid,
                title,
                description,
                lang,
                contactFirstName,
                contactLastName,
                contactAddress,
                contactCity,
                contactState,
                contactCountry,
                contactEmail,
                contactPhone,
                buyerName,
                buyerCountry,
                procurementMethod,
                noticeType,
                country,
                estimatedCost,
                currency,
                publicationDate,
                cpvsOrigine,
                cpvs,
                cpvDescriptions,
                words,
                bidDeadlineDate,
                sourceUrl,
                termDate,
                fileSource,
                userId,
                algoliaId,
                status,
                creationDate,
                updateDate
              ) VALUES (
                ${BddTool.NumericFormater(hit.tenderId)},
                ${BddTool.NumericFormater(hit.dataSourceId)},
                '${BddTool.ChaineFormater(hit.procurementId)}',
                '${BddTool.ChaineFormater(hit.tenderUuid)}',
                '${BddTool.ChaineFormater(hit.title)}',
                '${BddTool.ChaineFormater(hit.description)}',
                '${BddTool.ChaineFormater(hit.lang)}',
                '${BddTool.ChaineFormater(hit.contact.firstName)}',
                '${BddTool.ChaineFormater(hit.contact.lastName)}',
                '${BddTool.ChaineFormater(hit.contact.address)}',
                '${BddTool.ChaineFormater(hit.contact.city)}',
                '${BddTool.ChaineFormater(hit.contact.state)}',
                '${BddTool.ChaineFormater(hit.contact.country)}',
                '${BddTool.ChaineFormater(hit.contact.email)}',
                '${BddTool.ChaineFormater(hit.contact.phone)}',
                '${BddTool.ChaineFormater(hit.buyer.name)}',
                '${BddTool.ChaineFormater(hit.buyer.country)}',
                '${BddTool.ChaineFormater(hit.procurementMethod)}',
                '${BddTool.ChaineFormater(hit.noticeType)}',
                '${BddTool.ChaineFormater(hit.country)}',
                '${BddTool.ChaineFormater(hit.estimatedCost)}',
                '${BddTool.ChaineFormater(hit.currency)}',
                '${BddTool.ChaineFormater(hit.publicationDate ? hit.publicationDate.replace('-', '').replace('-', '') : '')}',
                '${BddTool.ChaineFormater(hit.cpvsOrigine)}',
                '${BddTool.ChaineFormater(cpvs)}',
                '${BddTool.ChaineFormater(cpvDescriptions)}',
                '${BddTool.ChaineFormater(hit.words)}',
                '${BddTool.ChaineFormater(hit.bidDeadlineDate ? hit.bidDeadlineDate.replace('-', '').replace('-', '') : '')}',
                '${BddTool.ChaineFormater(hit.sourceUrl)}',
                ${BddTool.DateFormater(termDate)},
                '${BddTool.ChaineFormater(hit.fileSource)}',
                0,
                '${BddTool.ChaineFormater(hit.objectID)}',
                0,
                ${BddTool.DateNow(BddEnvironnement, BddId)},
                ${BddTool.DateNow(BddEnvironnement, BddId)}
              )
            `
            await BddTool.QueryExecBdd2(query)
            tenderAddNbr++
          } else {
            query = `
              UPDATE      tenders 
              SET         procurementId = '${BddTool.ChaineFormater(hit.procurementId)}', 
                          tenderUuid = '${BddTool.ChaineFormater(hit.tenderUuid)}', 
                          title = '${BddTool.ChaineFormater(hit.title)}', 
                          description = '${BddTool.ChaineFormater(hit.description)}', 
                          lang = '${BddTool.ChaineFormater(hit.lang)}', 
                          contactFirstName = '${BddTool.ChaineFormater(hit.contact.firstName)}', 
                          contactLastName = '${BddTool.ChaineFormater(hit.contact.lastName)}', 
                          contactAddress = '${BddTool.ChaineFormater(hit.contact.address)}', 
                          contactCity = '${BddTool.ChaineFormater(hit.contact.city)}', 
                          contactState = '${BddTool.ChaineFormater(hit.contact.state)}', 
                          contactCountry = '${BddTool.ChaineFormater(hit.contact.country)}', 
                          contactEmail = '${BddTool.ChaineFormater(hit.contact.email)}', 
                          contactPhone = '${BddTool.ChaineFormater(hit.contact.phone)}', 
                          buyerName = '${BddTool.ChaineFormater(hit.buyer.name)}', 
                          buyerCountry = '${BddTool.ChaineFormater(hit.buyer.country)}', 
                          procurementMethod = '${BddTool.ChaineFormater(hit.procurementMethod)}', 
                          noticeType = '${BddTool.ChaineFormater(hit.noticeType)}', 
                          country = '${BddTool.ChaineFormater(hit.country)}', 
                          estimatedCost = '${BddTool.ChaineFormater(hit.estimatedCost)}', 
                          currency = '${BddTool.ChaineFormater(hit.currency)}', 
                          publicationDate = '${BddTool.ChaineFormater(hit.publicationDate ? hit.publicationDate.replace('-', '').replace('-', '') : '')}', 
                          cpvsOrigine = '${BddTool.ChaineFormater(hit.cpvsOrigine)}', 
                          cpvs = '${BddTool.ChaineFormater(cpvs)}', 
                          cpvDescriptions = '${BddTool.ChaineFormater(cpvDescriptions)}', 
                          words = '${BddTool.ChaineFormater(hit.words)}', 
                          bidDeadlineDate = '${BddTool.ChaineFormater(hit.bidDeadlineDate ? hit.bidDeadlineDate.replace('-', '').replace('-', '') : '')}', 
                          sourceUrl = '${BddTool.ChaineFormater(hit.sourceUrl)}', 
                          termDate = ${BddTool.DateFormater(termDate)}, 
                          fileSource = '${BddTool.ChaineFormater(hit.fileSource)}', 
                          algoliaId = '${BddTool.ChaineFormater(hit.objectID)}', 
                          status = 0, 
                          updateDate = ${BddTool.DateNow(BddEnvironnement, BddId)} 
              WHERE       id = ${BddTool.NumericFormater(hit.tenderId)} 
            `
            await BddTool.QueryExecBdd2(query)
            tenderUpdNbr++
          }
        }
      })
      
      browser.on('end', () => {
        resolve({
          tenderNbr,
          tenderAddNbr,
          tenderUpdNbr
        })
      })
      
      browser.on('error', err => {
        throw err
      })
    } catch (err) { reject(err) }
  })
}
