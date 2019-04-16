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

exports.TenderList = (id, algoliaId, creationDateMin, creationDateMax, termDateMin, termDateMax) => {
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
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let tenders = []
      for (var record of recordset) {
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
      }
      if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += '  WHERE ' + where }
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TendersPurge()

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.TenderStatistic = (year, month) => {
  return new Promise(async (resolve, reject) => {
    try {
      const RegionList = require(process.cwd() + '/public/constants/regions.json')

      let termDateMin = null
      if (year && month) {
        let creationDateMin = new Date(year, month, 1)
        let creationDateMax = new Date(year, month, 1)
        creationDateMax.setMonth(creationDateMax.getMonth() + 1)
        creationDateMax.setDate(creationDateMin.getDate() - 1)
        termDateMin = new Date(year, month, 1)
      }
      let tenders = await this.TenderList(null, null, null, null, termDateMin)
      let statistic = {
        count: tenders.length,
        weekCount: 0,
        monthCount: 0,
        liveCount: 0,
        liveWeekNextCount: 0,
        countrys: [],
        regions: [],
        categories: [],
        families: [],
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

        if (tenderFormat.publication_timestamp && tenderFormat.publication_timestamp > weekTimestamp) {
          statistic.weekCount++
        }

        if (tenderFormat.publication_timestamp && tenderFormat.publication_timestamp > monthTimestamp) {
          statistic.monthCount++
        }

        if (tenderFormat.bidDeadline_timestamp && tenderFormat.bidDeadline_timestamp > weekNextTimestamp) {
          statistic.liveWeekNextCount++
        }

        if (tenderFormat.bidDeadline_timestamp && tenderFormat.bidDeadline_timestamp > nowTimestamp) {
          statistic.liveCount++
        } else {
          continue
        }

        // Categories count
        for(let categorie of tenderFormat.categories) {
          let categorieFind = statistic.categories.find(a => a.categorie === categorie)
          if(!categorieFind) {
            statistic.categories.push({
              categorie: categorie,
              count: 1,
            });
          } else {
            categorieFind.count++
          }
        }

        // Families count
        for(let familie of tenderFormat.families) {
          let familieFind = statistic.families.find(a => a.familie === familie)
          if(!familieFind) {
            statistic.families.push({
              familie: familie,
              count: 1,
            });
          } else {
            familieFind.count++
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
                  regionSubs: [],
                  categories: [],
                  families: [],
                }
                statistic.regions.push(regionFind);
              } else {
                regionFind.count++
              }
              for(let categorie of tenderFormat.categories) {
                let categorieFind = regionFind.categories.find(a => a.categorie === categorie)
                if(!categorieFind) {
                  regionFind.categories.push({
                    categorie: categorie,
                    count: 1,
                  });
                } else {
                  categorieFind.count++
                }
              }
              for(let familie of tenderFormat.families) {
                let familieFind = regionFind.families.find(a => a.familie === familie)
                if(!familieFind) {
                  regionFind.families.push({
                    familie: familie,
                    count: 1,
                  });
                } else {
                  familieFind.count++
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
                      regionSubs: [],
                      categories: [],
                      families: [],
                    }
                    statistic.regions.push(regionFind);
                  } else {
                    regionFind.count++
                  }
                  for(let categorie of tenderFormat.categories) {
                    let categorieFind = regionFind.categories.find(a => a.categorie === categorie)
                    if(!categorieFind) {
                      regionFind.categories.push({
                        categorie: categorie,
                        count: 1,
                      });
                    } else {
                      categorieFind.count++
                    }
                  }
                  for(let familie of tenderFormat.families) {
                    let familieFind = regionFind.families.find(a => a.familie === familie)
                    if(!familieFind) {
                      regionFind.families.push({
                        familie: familie,
                        count: 1,
                      });
                    } else {
                      familieFind.count++
                    }
                  }
                  let regionSubFind = regionFind.regionSubs.find(a => a.region === region2.label)
                  if(!regionSubFind) {
                    regionSubFind = {
                      region: region2.label,
                      count: 1,
                      categories: [],
                      families: [],
                    }
                    regionFind.regionSubs.push(regionSubFind);
                  } else {
                    regionSubFind.count++
                  }
                  for(let categorie of tenderFormat.categories) {
                    let categorieFind = regionSubFind.categories.find(a => a.categorie === categorie)
                    if(!categorieFind) {
                      regionSubFind.categories.push({
                        categorie: categorie,
                        count: 1,
                      });
                    } else {
                      categorieFind.count++
                    }
                  }
                  for(let familie of tenderFormat.families) {
                    let familieFind = regionSubFind.families.find(a => a.familie === familie)
                    if(!familieFind) {
                      regionSubFind.families.push({
                        familie: familie,
                        count: 1,
                      });
                    } else {
                      familieFind.count++
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
