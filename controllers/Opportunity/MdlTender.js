exports.OpportunityAdd = (opportunity) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (opportunity.algoliaId && opportunity.algoliaId > 0 && !opportunity.id) {
        let query = `
          SELECT      id AS "id" 
          FROM        opportunity 
          WHERE       algoliaId = ${BddTool.NumericFormater(opportunity.algoliaId, BddEnvironnement, BddId)} 
        `
        let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
        for (var record of recordset) {
          opportunity.id = record.id
        }
      }

      if (opportunity.cpvs) {
        let cpvDescriptions = opportunity.cpvs
        opportunity.cpvs = ''
        opportunity.cpvDescriptions = ''
        for (let description of cpvDescriptions) {
          let cpv = CpvList.find(a => a.label === description.split('-').join(' ').trim())
          if (cpv) {
            if (opportunity.cpvDescriptions !== '') {
              opportunity.cpvs += ','
              opportunity.cpvDescriptions += ','
            }
            opportunity.cpvs += cpv.code
            opportunity.cpvDescriptions += cpv.label
          }
        }
      }

      let bidDeadlineDateText = `${opportunity.bidDeadlineDate.substring(0, 4)}-${opportunity.bidDeadlineDate.substring(4, 6)}-${opportunity.bidDeadlineDate.substring(6, 8)}`
      let termDate = new Date(bidDeadlineDateText)
      if (isNaN(termDate)) {
        throw new Error('BID deadline invalide !')
      }

      // Search cpv by key words
      let cpvFound = require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').DescriptionParseForCpv(opportunity.description, opportunity.cpvs, opportunity.cpvDescriptions)
      opportunity.cpvs = cpvFound.cpvsText
      opportunity.cpvDescriptions = cpvFound.cpvDescriptionsText

      opportunity.opportunityId = 0
      opportunity.userId = config.user.userId
      opportunity.status = 0
      opportunity.creationDate = new Date()
      opportunity.updateDate = opportunity.creationDate
      let data = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'opportunity', opportunity)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').OpportunitysImport()
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

exports.OpportunityGet = (id, algoliaId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      id AS "id",
                    opportunityId AS "opportunityId",
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
        FROM        opportunity 
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
      let opportunity = {}
      for (var record of recordset) {
        opportunity = {
          id: record.id,
          opportunityId: record.opportunityId,
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

      resolve(opportunity)
    } catch (err) {
      reject(err)
    }
  })
}

exports.OpportunityList = (id, algoliaId, creationDateMin, creationDateMax, termDateMin, termDateMax, cpvLabels, regions) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const RegionList = require(process.cwd() + '/public/constants/regions.json')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      id AS "id",
                    opportunityId AS "opportunityId",
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
        FROM        opportunity 
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
      if (cpvLabels && cpvLabels.length) {
        if (where !== '') { where += 'AND '}
        let orCondition = ''
        for (let cpvLabel of cpvLabels) {
          if (orCondition !== '') { orCondition += 'OR '}
          orCondition += `REPLACE(cpvDescriptions, '-', ' ') LIKE '%${BddTool.ChaineFormater(cpvLabel, BddEnvironnement, BddId)}%' `
        }
        where += `(${orCondition}) `
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let opportunitys = []
      for (var record of recordset) {
        // Get country region
        let region1Opportunity = null
        let region2Opportunity = null
        if (record.country && record.country !== '') {
          for (let region1 of RegionList) {
            if (region1.countrys) {
              if (region1.countrys.find(a => a.toLowerCase() === record.country.toLowerCase())) {
                region1Opportunity = region1
                break
              }
            }
            if (region1.regions) {
              for (let region2 of region1.regions) {
                if (region2.countrys) {
                  if (region2.countrys.find(a => a.toLowerCase() === record.country.toLowerCase())) {
                    region1Opportunity = region1
                    region2Opportunity = region2
                    break
                  }
                }
              }
              if (region1Opportunity) {
                break
              }
            }
          }
        }
        if (regions && regions.trim() !== '') {
          let isRegionOk = false
          if (region1Opportunity) {
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
                if (regionLabel1.toLowerCase() === region1Opportunity.label.toLowerCase()) {
                  if (region2Opportunity && regionLabel2.toLowerCase() !== 'all') {
                    if (region2Opportunity && regionLabel2.toLowerCase() === region2Opportunity.label.toLowerCase()) {
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
        opportunitys.push({
          id: record.id,
          opportunityId: record.opportunityId,
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

      resolve(opportunitys)
    } catch (err) {
      reject(err)
    }
  })
}

exports.OpportunityRemove = (id, algoliaId) => {
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
        UPDATE      opportunity 
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
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').OpportunitysPurge()

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.OpportunityStatistic = (year, month, user) => {
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
      let opportunitys = await this.OpportunityList(null, null, null, null, termDateMin, null, cpvLabels, userData? userData.regions : null)
      let statistic = {
        count: opportunitys.length,
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

      for (let opportunity of opportunitys) {
        let opportunityFormat = await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').OpportunityFormat(opportunity)
        let isWeek = false

        if (opportunityFormat.bidDeadline_timestamp && opportunityFormat.bidDeadline_timestamp > nowTimestamp) {
          statistic.liveCount++
        } else {
          continue
        }

        if (opportunityFormat.publication_timestamp && opportunityFormat.publication_timestamp > weekTimestamp) {
          statistic.weekCount++
          isWeek = true
        }

        if (opportunityFormat.publication_timestamp && opportunityFormat.publication_timestamp > monthTimestamp) {
          statistic.monthCount++
        }

        if (opportunityFormat.bidDeadline_timestamp && opportunityFormat.bidDeadline_timestamp > weekNextTimestamp) {
          statistic.liveWeekNextCount++
        }

        // buyer name count
        if (opportunityFormat.buyer && opportunityFormat.buyer.name) {
          let buyerNameFind = statistic.buyerNames.find(a => a.label === opportunityFormat.buyer.name)
          if(!buyerNameFind) {
            statistic.buyerNames.push({
              label: opportunityFormat.buyer.name,
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
        for(let cpvLabel of opportunityFormat.cpvs) {
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
        for(let categorie of opportunityFormat.categories) {
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
        for(let familie of opportunityFormat.families) {
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
        if (opportunity.country && opportunity.country !== '') {
          // Search for region and sub-region
          for (let region of RegionList) {
            if (region.countrys && region.countrys.includes(opportunity.country)) {
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
              for(let cpvLabel of opportunityFormat.cpvs) {
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
              for(let categorie of opportunityFormat.categories) {
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
              for(let familie of opportunityFormat.families) {
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
                if (region2.countrys && region2.countrys.includes(opportunity.country)) {
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
                  for(let cpvLabel of opportunityFormat.cpvs) {
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
                  for(let categorie of opportunityFormat.categories) {
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
                  for(let familie of opportunityFormat.families) {
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
                  for(let cpvLabel of opportunityFormat.cpvs) {
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
                  for(let categorie of opportunityFormat.categories) {
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
                  for(let familie of opportunityFormat.families) {
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
          let country = statistic.countrys.find(a => a.country === opportunity.country)
          if(!country) {
            statistic.countrys.push({
              country: opportunity.country,
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
