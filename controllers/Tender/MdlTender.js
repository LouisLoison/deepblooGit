exports.TenderAdd = (tender) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (tender.algoliaId && tender.algoliaId > 0 && !tender.id) {
        let query = `
          SELECT      id AS "id" 
          FROM        dgmarket 
          WHERE       algoliaId = ${BddTool.NumericFormater(tender.algoliaId, BddEnvironnement, BddId)} 
        `
        let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
        for (var record of recordset) {
          tender.id = record.id
        }
      }

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

      let bidDeadlineDateText = `${tender.bidDeadlineDate.substring(0, 4)}-${tender.bidDeadlineDate.substring(4, 6)}-${tender.bidDeadlineDate.substring(6, 8)}`
      let termDate = new Date(bidDeadlineDateText)
      if (isNaN(termDate)) {
        throw new Error('BID deadline invalide !')
      }

      // Search cpv by key words
      let cpvFound = require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').DescriptionParseForCpv(tender.description, tender.cpvs, tender.cpvDescriptions)
      tender.cpvs = cpvFound.cpvsText
      tender.cpvDescriptions = cpvFound.cpvDescriptionsText

      tender.dgmarketId = 0
      tender.userId = config.user.userId
      tender.status = 0
      tender.creationDate = new Date()
      tender.updateDate = tender.creationDate
      let data = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'dgmarket', tender)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TendersImport()
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderGet = (id, algoliaId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      id AS "id",
                    dgmarketId AS "dgmarketId",
                    procurementId AS "procurementId",
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
                    cpvs AS "cpvs",
                    cpvDescriptions AS "cpvDescriptions",
                    words AS "words",
                    bidDeadlineDate AS "bidDeadlineDate",
                    sourceUrl AS "sourceUrl",
                    termDate AS "termDate",
                    fileSource AS "fileSource",
                    userId AS "userId",
                    algoliaId AS "algoliaId",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        dgmarket 
      `
      let where = ``
      if (id && id !== '' && id > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `id = ${BddTool.NumericFormater(id, BddEnvironnement, BddId)} \n`
      }
      if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let tender = {}
      for (var record of recordset) {
        tender = {
          id: record.id,
          dgmarketId: record.dgmarketId,
          procurementId: record.procurementId,
          title: record.title,
          description: record.description,
          lang: record.lang,
          contactFirstName: record.contactFirstName,
          contactLastName: record.contactLastName,
          contactAddress: record.contactAddress,
          contactCity: record.contactCity,
          contactState: record.contactState,
          contactCountry: record.contactCountry,
          contactEmail: record.contactEmail,
          contactPhone: record.contactPhone,
          buyerName: record.buyerName,
          buyerCountry: record.buyerCountry,
          procurementMethod: record.procurementMethod,
          noticeType: record.noticeType,
          country: record.country,
          estimatedCost: record.estimatedCost,
          currency: record.currency,
          publicationDate: record.publicationDate,
          cpvs: record.cpvs,
          cpvDescriptions: record.cpvDescriptions,
          words: record.words,
          bidDeadlineDate: record.bidDeadlineDate,
          sourceUrl: record.sourceUrl,
          termDate: record.termDate,
          fileSource: record.fileSource,
          userId: record.userId,
          algoliaId: record.algoliaId,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        }
      }

      resolve(tender)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderList = (id, algoliaId, creationDateMin, creationDateMax, termDateMin, termDateMax, cpvLabels, regions, limit, noticeType, country, orderBy) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const RegionList = require(process.cwd() + '/public/constants/regions.json')
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let cpvCodes = null
      let cpvLabelFormats = []
      if (cpvLabels && cpvLabels.length) {
        cpvCodes = []
        for (let cpvLabel of cpvLabels) {
          cpvLabelFormats.push(cpvLabel.split('-').join(' ').trim())
          const CpvFound = CpvList.find(a => a.label.split('-').join(' ').trim() === cpvLabel.split('-').join(' ').trim())
          if (CpvFound) {
            cpvCodes.push(CpvFound.code)
          }
        }
        cpvLabels = cpvLabelFormats
      }

      let query = `
        SELECT      id AS "id",
                    dgmarketId AS "dgmarketId",
                    procurementId AS "procurementId",
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
                    cpvs AS "cpvs",
                    cpvDescriptions AS "cpvDescriptions",
                    words AS "words",
                    bidDeadlineDate AS "bidDeadlineDate",
                    sourceUrl AS "sourceUrl",
                    termDate AS "termDate",
                    fileSource AS "fileSource",
                    userId AS "userId",
                    algoliaId AS "algoliaId",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        dgmarket 
      `
      let where = ``
      if (id && id !== '' && id > 0) {
        if (where !== '') { where += 'AND ' }
        where += `id = ${BddTool.NumericFormater(id, BddEnvironnement, BddId)} \n`
      }
      if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (creationDateMin && creationDateMin !== '') {
        if (where !== '') { where += 'AND '}
        where += `creationDate >= ${BddTool.DateFormater(creationDateMin, BddEnvironnement, BddId)} `
      }
      if (creationDateMax && creationDateMax !== '') {
        if (where !== '') { where += 'AND '}
        where += `creationDate <= ${BddTool.DateFormater(creationDateMax, BddEnvironnement, BddId)} `
      }
      if (termDateMin && termDateMin !== '') {
        if (where !== '') { where += 'AND '}
        where += `termDate >= ${BddTool.DateFormater(termDateMin, BddEnvironnement, BddId)} `
      }
      if (termDateMax && termDateMax !== '') {
        if (where !== '') { where += 'AND '}
        where += `termDate <= ${BddTool.DateFormater(termDateMax, BddEnvironnement, BddId)} `
      }
      if (cpvCodes && cpvCodes.length) {
        if (where !== '') { where += 'AND '}
        let orCondition = ''
        for (let cpvCode of cpvCodes) {
          if (orCondition !== '') { orCondition += 'OR '}
          orCondition += `cpvs LIKE '%${BddTool.ChaineFormater(cpvCode, BddEnvironnement, BddId)}%' `
        }
        where += `(${orCondition}) `
      }
      if (regions && regions.trim() !== '') {
        const countrys = require(`${process.cwd()}/controllers/CtrlTool`).countrysFromRegions(regions)
        if (countrys) {
          if (where !== '') { where += 'AND ' }
          where += `country IN (${BddTool.ArrayStringFormat(countrys, BddEnvironnement, BddId)}) \n`
        }
      }
      if (country && country !== '') {
        if (where !== '') { where += 'AND ' }
        where += `country = '${BddTool.ChaineFormater(country, BddEnvironnement, BddId)}' \n`
      }
      if (noticeType && noticeType !== '') {
        if (where !== '') { where += 'AND ' }
        where += `noticeType = '${BddTool.ChaineFormater(noticeType, BddEnvironnement, BddId)}' \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      // query += ` ORDER BY bidDeadlineDate DESC `
      if (orderBy) {
        query += ` ORDER BY ${orderBy} `
      }
      if (limit && limit !== '') {
        query += ` LIMIT ${limit} `
      }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let tenders = []
      for (var record of recordset) {
        // Get country region
        let region1Tender = null
        let region2Tender = null
        if (record.country && record.country !== '') {
          for (let region1 of RegionList) {
            if (region1.countrys) {
              if (region1.countrys.find(a => a.toLowerCase() === record.country.toLowerCase())) {
                region1Tender = region1
                break
              }
            }
            if (region1.regions) {
              for (let region2 of region1.regions) {
                if (region2.countrys) {
                  if (region2.countrys.find(a => a.toLowerCase() === record.country.toLowerCase())) {
                    region1Tender = region1
                    region2Tender = region2
                    break
                  }
                }
              }
              if (region1Tender) {
                break
              }
            }
          }
        }
        if (regions && regions.trim() !== '') {
          let isRegionOk = false
          if (region1Tender) {
            for (let region of regions.split(',')) {
              let regionLabel = region.trim()
              let regionLabel1 = regionLabel.split('-')[0].trim()
              if (regionLabel1.toLowerCase() === 'worldwide') {
                isRegionOk = true
              } else {
                let regionLabel2 = ''
                if (regionLabel.includes('-')) {
                  regionLabel2 = regionLabel.trim().split('-')[1].trim()
                }
                if (regionLabel1.toLowerCase() === region1Tender.label.toLowerCase()) {
                  if (region2Tender && regionLabel2.toLowerCase() !== 'all') {
                    if (region2Tender && regionLabel2.toLowerCase() === region2Tender.label.toLowerCase()) {
                      isRegionOk = true
                    }
                  } else {
                    isRegionOk = true
                  }
                }
              }
            }
          }
          if (!isRegionOk) {
            continue
          }
        }

        // Check CPV filter
        let cpvOk = true
        if (cpvLabels && cpvLabels.length) {
          cpvOk = false
          for (let cpv of record.cpvDescriptions.split(',')) {
            if (cpvLabels.includes(cpv.split('-').join(' ').trim())) {
              cpvOk = true
              break
            }
          }
        }
        if (!cpvOk) {
          continue
        }

        tenders.push({
          id: record.id,
          dgmarketId: record.dgmarketId,
          procurementId: record.procurementId,
          title: record.title,
          description: record.description,
          lang: record.lang,
          contactFirstName: record.contactFirstName,
          contactLastName: record.contactLastName,
          contactAddress: record.contactAddress,
          contactCity: record.contactCity,
          contactState: record.contactState,
          contactCountry: record.contactCountry,
          contactEmail: record.contactEmail,
          contactPhone: record.contactPhone,
          buyerName: record.buyerName,
          buyerCountry: record.buyerCountry,
          procurementMethod: record.procurementMethod,
          noticeType: record.noticeType,
          country: record.country,
          estimatedCost: record.estimatedCost,
          currency: record.currency,
          publicationDate: record.publicationDate,
          cpvs: record.cpvs,
          cpvDescriptions: record.cpvDescriptions,
          words: record.words,
          bidDeadlineDate: record.bidDeadlineDate,
          sourceUrl: record.sourceUrl,
          termDate: record.termDate,
          fileSource: record.fileSource,
          userId: record.userId,
          algoliaId: record.algoliaId,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        })
      }

      resolve(tenders)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderRemove = (id, algoliaId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      
      if (!id && !algoliaId) {
        throw new Error("No available id !")
      }

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        UPDATE      dgmarket 
        SET         status = -1 
      `
      let where = ``
      if (id && id !== '' && id > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `id = ${BddTool.NumericFormater(id, BddEnvironnement, BddId)} \n`
      } else if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') {
        query += '  WHERE ' + where
        await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
        await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TendersPurge()
      }

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderStatistic = (year, month, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const RegionList = require(process.cwd() + '/public/constants/regions.json')

      let userData = null
      let userCpvs = []
      let cpvLabels = null
      if (user === 'me') {
        userData = await require(process.cwd() + '/controllers/User/MdlUser').User(config.user.userId)
        userCpvs = await require(process.cwd() + '/controllers/User/MdlUser').UserCpvs(config.user.userId)
        cpvLabels = userCpvs.map(a => a.cpvName)
      }

      let termDateMin = null
      if (year && month) {
        let creationDateMin = new Date(year, month, 1)
        let creationDateMax = new Date(year, month, 1)
        creationDateMax.setMonth(creationDateMax.getMonth() + 1)
        creationDateMax.setDate(creationDateMin.getDate() - 1)
        termDateMin = new Date(year, month, 1)
      }
      let tenders = await this.TenderList(null, null, null, null, termDateMin, null, cpvLabels, userData? userData.regions : null)
      let statistic = {
        count: tenders.length,
        weekCount: 0,
        monthCount: 0,
        liveCount: 0,
        liveWeekNextCount: 0,
        countrys: [],
        regions: [],
        cpvLabels: [],
        categories: [],
        families: [],
        buyerNames: [],
        user: userData,
        userCpvs: userCpvs,
      }

      let weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - 7);
      let weekTimestamp = weekDate.getTime()

      let monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - 1);
      let monthTimestamp = monthDate.getTime()

      let nowTimestamp = new Date().getTime()

      let weekNextDate = new Date();
      weekNextDate.setDate(weekNextDate.getDate() + 7);
      let weekNextTimestamp = weekNextDate.getTime()

      for (let tender of tenders) {
        let tenderFormat = await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TenderFormat(tender)
        let isWeek = false

        if (tenderFormat.bidDeadline_timestamp && tenderFormat.bidDeadline_timestamp > nowTimestamp) {
          statistic.liveCount++
        } else {
          continue
        }

        if (tenderFormat.publication_timestamp && tenderFormat.publication_timestamp > weekTimestamp) {
          statistic.weekCount++
          isWeek = true
        }

        if (tenderFormat.publication_timestamp && tenderFormat.publication_timestamp > monthTimestamp) {
          statistic.monthCount++
        }

        if (tenderFormat.bidDeadline_timestamp && tenderFormat.bidDeadline_timestamp > weekNextTimestamp) {
          statistic.liveWeekNextCount++
        }

        // buyer name count
        if (tenderFormat.buyer && tenderFormat.buyer.name) {
          let buyerNameFind = statistic.buyerNames.find(a => a.label === tenderFormat.buyer.name)
          if(!buyerNameFind) {
            statistic.buyerNames.push({
              label: tenderFormat.buyer.name,
              count: 1,
              weekCount: isWeek ? 1 : 0,
            })
          } else {
            buyerNameFind.count++
            if (isWeek) {
              buyerNameFind.weekCount++
            }
          }
        }

        // CPVs count
        for(let cpvLabel of tenderFormat.cpvs) {
          if (cpvLabels && cpvLabels.length && !cpvLabels.find(a => a.trim().toLowerCase() === cpvLabel.trim().toLowerCase())) {
            continue
          }
          let cpvFind = statistic.cpvLabels.find(a => a.label === cpvLabel)
          if(!cpvFind) {
            statistic.cpvLabels.push({
              label: cpvLabel,
              count: 1,
              weekCount: isWeek ? 1 : 0,
            })
          } else {
            cpvFind.count++
            if (isWeek) {
              cpvFind.weekCount++
            }
          }
        }

        // Categories count
        for(let categorie of tenderFormat.categories) {
          let categorieFind = statistic.categories.find(a => a.categorie === categorie)
          if(!categorieFind) {
            statistic.categories.push({
              categorie: categorie,
              count: 1,
              weekCount: isWeek ? 1 : 0,
            })
          } else {
            categorieFind.count++
            if (isWeek) {
              categorieFind.weekCount++
            }
          }
        }

        // Families count
        for(let familie of tenderFormat.families) {
          let familieFind = statistic.families.find(a => a.familie === familie)
          if(!familieFind) {
            statistic.families.push({
              familie: familie,
              count: 1,
              weekCount: isWeek ? 1 : 0,
            });
          } else {
            familieFind.count++
            if (isWeek) {
              familieFind.weekCount++
            }
          }
        }

        // Country count
        if (tender.country && tender.country !== '') {
          // Search for region and sub-region
          for (let region of RegionList) {
            if (region.countrys && region.countrys.includes(tender.country)) {
              let regionFind = statistic.regions.find(a => a.region === region.label)
              if(!regionFind) {
                regionFind = {
                  region: region.label,
                  count: 1,
                  weekCount: isWeek ? 1 : 0,
                  regionSubs: [],
                  cpvLabels: [],
                  categories: [],
                  families: [],
                }
                statistic.regions.push(regionFind)
              } else {
                regionFind.count++
                if (isWeek) {
                  regionFind.weekCount++
                }
              }
              for(let cpvLabel of tenderFormat.cpvs) {
                if (cpvLabels && cpvLabels.length && !cpvLabels.find(a => a.trim().toLowerCase() === cpvLabel.trim().toLowerCase())) {
                  continue
                }
                let cpvFind = regionFind.cpvLabels.find(a => a.label === cpvLabel)
                if(!cpvFind) {
                  regionFind.cpvLabels.push({
                    label: cpvLabel,
                    count: 1,
                    weekCount: isWeek ? 1 : 0,
                  })
                } else {
                  cpvFind.count++
                  if (isWeek) {
                    cpvFind.weekCount++
                  }
                }
              }
              for(let categorie of tenderFormat.categories) {
                let categorieFind = regionFind.categories.find(a => a.categorie === categorie)
                if(!categorieFind) {
                  regionFind.categories.push({
                    categorie: categorie,
                    count: 1,
                    weekCount: isWeek ? 1 : 0,
                  })
                } else {
                  categorieFind.count++
                  if (isWeek) {
                    categorieFind.weekCount++
                  }
                }
              }
              for(let familie of tenderFormat.families) {
                let familieFind = regionFind.families.find(a => a.familie === familie)
                if(!familieFind) {
                  regionFind.families.push({
                    familie: familie,
                    count: 1,
                    weekCount: isWeek ? 1 : 0,
                  })
                } else {
                  familieFind.count++
                  if (isWeek) {
                    familieFind.weekCount++
                  }
                }
              }
            }

            if (region.regions) {
              for (let region2 of region.regions) {
                if (region2.countrys && region2.countrys.includes(tender.country)) {
                  let regionFind = statistic.regions.find(a => a.region === region.label)
                  if(!regionFind) {
                    regionFind = {
                      region: region.label,
                      count: 1,
                      weekCount: isWeek ? 1 : 0,
                      regionSubs: [],
                      cpvLabels: [],
                      categories: [],
                      families: [],
                    }
                    statistic.regions.push(regionFind)
                  } else {
                    regionFind.count++
                    if (isWeek) {
                      regionFind.weekCount++
                    }
                  }
                  for(let cpvLabel of tenderFormat.cpvs) {
                    if (cpvLabels && cpvLabels.length && !cpvLabels.find(a => a.trim().toLowerCase() === cpvLabel.trim().toLowerCase())) {
                      continue
                    }
                    let cpvFind = regionFind.cpvLabels.find(a => a.label === cpvLabel)
                    if(!cpvFind) {
                      regionFind.cpvLabels.push({
                        label: cpvLabel,
                        count: 1,
                        weekCount: isWeek ? 1 : 0,
                      })
                    } else {
                      cpvFind.count++
                      if (isWeek) {
                        cpvFind.weekCount++
                      }
                    }
                  }
                  for(let categorie of tenderFormat.categories) {
                    let categorieFind = regionFind.categories.find(a => a.categorie === categorie)
                    if(!categorieFind) {
                      regionFind.categories.push({
                        categorie: categorie,
                        count: 1,
                        weekCount: isWeek ? 1 : 0,
                      })
                    } else {
                      categorieFind.count++
                      if (isWeek) {
                        categorieFind.weekCount++
                      }
                    }
                  }
                  for(let familie of tenderFormat.families) {
                    let familieFind = regionFind.families.find(a => a.familie === familie)
                    if(!familieFind) {
                      regionFind.families.push({
                        familie: familie,
                        count: 1,
                        weekCount: isWeek ? 1 : 0,
                      });
                    } else {
                      familieFind.count++
                      if (isWeek) {
                        familieFind.weekCount++
                      }
                    }
                  }
                  let regionSubFind = regionFind.regionSubs.find(a => a.region === region2.label)
                  if(!regionSubFind) {
                    regionSubFind = {
                      region: region2.label,
                      count: 1,
                      cpvLabels: [],
                      categories: [],
                      families: [],
                    }
                    regionFind.regionSubs.push(regionSubFind);
                  } else {
                    regionSubFind.count++
                    if (isWeek) {
                      regionSubFind.weekCount++
                    }
                  }
                  for(let cpvLabel of tenderFormat.cpvs) {
                    if (cpvLabels && cpvLabels.length && !cpvLabels.find(a => a.trim().toLowerCase() === cpvLabel.trim().toLowerCase())) {
                      continue
                    }
                    let cpvFind = regionSubFind.cpvLabels.find(a => a.label === cpvLabel)
                    if(!cpvFind) {
                      regionSubFind.cpvLabels.push({
                        label: cpvLabel,
                        count: 1,
                        weekCount: isWeek ? 1 : 0,
                      });
                    } else {
                      cpvFind.count++
                      if (isWeek) {
                        cpvFind.weekCount++
                      }
                    }
                  }
                  for(let categorie of tenderFormat.categories) {
                    let categorieFind = regionSubFind.categories.find(a => a.categorie === categorie)
                    if(!categorieFind) {
                      regionSubFind.categories.push({
                        categorie: categorie,
                        count: 1,
                        weekCount: isWeek ? 1 : 0,
                      });
                    } else {
                      categorieFind.count++
                      if (isWeek) {
                        categorieFind.weekCount++
                      }
                    }
                  }
                  for(let familie of tenderFormat.families) {
                    let familieFind = regionSubFind.families.find(a => a.familie === familie)
                    if(!familieFind) {
                      regionSubFind.families.push({
                        familie: familie,
                        count: 1,
                        weekCount: isWeek ? 1 : 0,
                      });
                    } else {
                      familieFind.count++
                      if (isWeek) {
                        familieFind.weekCount++
                      }
                    }
                  }
                }
              }
            }
          }

          // Country count
          let country = statistic.countrys.find(a => a.country === tender.country)
          if(!country) {
            statistic.countrys.push({
              country: tender.country,
              count: 1,
            });
          } else {
            country.count++
          }
        }
      }

      // Sort data
      statistic.buyerNames = statistic.buyerNames.sort((a, b) => {
        if (a.count > b.count) { return -1 }
        if (a.count < b.count) { return 1 }
        return 0
      });
      statistic.cpvLabels = statistic.cpvLabels.sort((a, b) => {
        if (a.count > b.count) { return -1 }
        if (a.count < b.count) { return 1 }
        return 0
      });
      statistic.categories = statistic.categories.sort((a, b) => {
        if (a.count > b.count) { return -1 }
        if (a.count < b.count) { return 1 }
        return 0
      });
      statistic.families = statistic.families.sort((a, b) => {
        if (a.count > b.count) { return -1 }
        if (a.count < b.count) { return 1 }
        return 0
      });
      statistic.countrys = statistic.countrys.sort((a, b) => {
        if (a.count > b.count) { return -1 }
        if (a.count < b.count) { return 1 }
        return 0
      });
      statistic.regions = statistic.regions.sort((a, b) => {
        if (a.count > b.count) { return -1 }
        if (a.count < b.count) { return 1 }
        return 0
      });
      for (let region of statistic.regions) {
        if (!region.regionSubs) { continue }
        region.regionSubs = region.regionSubs.sort((a, b) => {
          if (a.count > b.count) { return -1 }
          if (a.count < b.count) { return 1 }
          return 0
        });
      }
      resolve(statistic)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderGroupAddUpdate = (tenderGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!tenderGroup.tenderGroupId) {
        tenderGroup.creationDate = new Date()
      }
      tenderGroup.updateDate = new Date()
      let data = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'tenderGroup', tenderGroup)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderGroupDelete = (tenderGroupId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        DELETE FROM   tenderGroup 
        WHERE         tenderGroupId = ${BddTool.NumericFormater(tenderGroupId, BddEnvironnement, BddId)}
      `
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderGroupList = (tenderGroupId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      tenderGroupId AS "tenderGroupId",
                    userId AS "userId",
                    label AS "label",
                    color AS "color",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        tenderGroup 
      `
      let where = ``
      if (tenderGroupId && tenderGroupId !== '' && tenderGroupId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `tenderGroupId = ${BddTool.NumericFormater(tenderGroupId, BddEnvironnement, BddId)} \n`
      }
      if (userId && userId !== '' && userId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `userId = ${BddTool.NumericFormater(userId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let tenderGroups = []
      for (var record of recordset) {
        tenderGroups.push({
          tenderGroupId: record.tenderGroupId,
          userId: record.userId,
          label: record.label,
          color: record.color,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        })
      }

      resolve(tenderGroups)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderGroupMove = (userId, tenderGroupId, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        DELETE FROM   tenderGroupLink 
        WHERE         tenderId = ${BddTool.NumericFormater(tenderId, BddEnvironnement, BddId)}
      `
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)

      let tenderGroup = null;
      if (tenderGroupId) {
        const tenderGroupLink = {
          userId: userId,
          tenderGroupId: tenderGroupId,
          tenderId: tenderId,
          creationDate: new Date(),
          updateDate: new Date(),
        }
        tenderGroup = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'tenderGroupLink', tenderGroupLink)
      }

      resolve(tenderGroup)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderArchiveMove = (userId, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        DELETE FROM   tenderGroupLink 
        WHERE         userId = ${BddTool.NumericFormater(userId, BddEnvironnement, BddId)}
        AND           tenderId = ${BddTool.NumericFormater(tenderId, BddEnvironnement, BddId)}
      `
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)


      let tenderDetail = {
        userId: userId,
        tenderId: tenderId,
        creationDate: new Date(),
      };
      const tenderDetails = await this.TenderDetailList(userId, tenderId);
      if (tenderDetails.length) {
        tenderDetail = tenderDetails[0];
      }

      tenderDetail.status = -2;
      tenderDetail.updateDate = new Date();
      let tenderGroup = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'tenderDetail', tenderDetail)

      resolve(tenderGroup)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderDeleteMove = (userId, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        DELETE FROM   tenderGroupLink 
        WHERE         userId = ${BddTool.NumericFormater(userId, BddEnvironnement, BddId)}
        AND           tenderId = ${BddTool.NumericFormater(tenderId, BddEnvironnement, BddId)}
      `
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)


      let tenderDetail = {
        userId: userId,
        tenderId: tenderId,
        creationDate: new Date(),
      };
      const tenderDetails = await this.TenderDetailList(userId, tenderId);
      if (tenderDetails.length) {
        tenderDetail = tenderDetails[0];
      }

      tenderDetail.status = -1;
      tenderDetail.updateDate = new Date();
      let tenderGroup = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'tenderDetail', tenderDetail)

      resolve(tenderGroup)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderGroupLinkList = (userId, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      tenderGroupLinkId AS "tenderGroupLinkId", 
                    userId AS "userId",
                    tenderGroupId AS "tenderGroupId",
                    tenderId AS "tenderId",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        tenderGroupLink 
      `
      let where = ``
      if (userId && userId !== '' && userId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `userId = ${BddTool.NumericFormater(userId, BddEnvironnement, BddId)} \n`
      }
      if (tenderId && tenderId !== '' && tenderId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `tenderId = ${BddTool.NumericFormater(tenderId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let tenderGroupLinks = []
      for (var record of recordset) {
        tenderGroupLinks.push({
          tenderGroupLinkId: record.tenderGroupLinkId,
          userId: record.userId,
          tenderGroupId: record.tenderGroupId,
          tenderId: record.tenderId,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        })
      }

      resolve(tenderGroupLinks)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderDetailList = (userId, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      tenderDetailId AS "tenderDetailId", 
                    userId AS "userId",
                    tenderId AS "tenderId",
                    comment AS "comment",
                    salesManagerId AS "salesManagerId",
                    bidManagerId AS "bidManagerId",
                    amoutOffer AS "amoutOffer",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        tenderDetail 
      `
      let where = ``
      if (userId && userId !== '' && userId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `userId = ${BddTool.NumericFormater(userId, BddEnvironnement, BddId)} \n`
      }
      if (tenderId && tenderId !== '' && tenderId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `tenderId = ${BddTool.NumericFormater(tenderId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let tenderDetails = []
      for (var record of recordset) {
        tenderDetails.push({
          tenderDetailId: record.tenderDetailId,
          userId: record.userId,
          tenderId: record.tenderId,
          comment: record.comment,
          salesManagerId: record.salesManagerId,
          bidManagerId: record.bidManagerId,
          amoutOffer: record.amoutOffer,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        })
      }

      resolve(tenderDetails)
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderDetailAddUpdate = (tenderDetail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!tenderDetail.tenderDetailId) {
        tenderDetail.creationDate = new Date()
      }
      tenderDetail.updateDate = new Date()
      let data = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'tenderDetail', tenderDetail)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

exports.UserNotify = (userIds, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const htmlToText = require('html-to-text');
      const tender = await this.TenderGet(tenderId);

      // Send email
      for (const userId of userIds) {
        const user = await require(process.cwd() + '/controllers/User/MdlUser').User(userId);
        if (!user || !user.email || user.email.trim() === '') {
          continue;
        }
        const title = htmlToText.fromString(tender.title);
        const description = htmlToText.fromString(tender.description);

        let to = user.email
        let subject = 'Deepbloo - this tender should interest you'
        let text = `
          Dear ${user.username},

          Title : ${title.substring(0, 50)}...

          Description
          ${description.substring(0, 200)}...

          <a href="https://platform.deepbloo.com/">Open this tender #${tender.id}</a>

          The Deepbloo team
        `
        let html = text.replace(/(?:\r\n|\r|\n)/g, '<br>')
        await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, to)
      }
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
