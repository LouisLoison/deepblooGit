const { CpvList } = require('./cpv')
const { textParseList } = require('./textparse')
const RegionList = require('./public/constants/regions.json')
const CategoryList = require('./public/constants/categories.json')
const { stripHtml } = require("string-strip-html")
const { importTender } = require('./tenderimport')

exports.tenderFormat = async (tender, cpvList, textParses) => {
  cpvList = cpvList ? cpvList : await CpvList()
  textParses = textParses ? textParses : textParseList

  // Url source list
  // let sourceUrls = tender.sourceUrl

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
      let cpv = cpvList.find(a => Number(a.code) === Number(code))
      if (cpv) {
        if (cpv.active) {
          cpvOkCount++
        }
        cpvs.push(cpvDescriptionsTextTemp[i].split('-').join(' ').trim())
      }
    }
  }
  if (cpvOkCount === 0) {
    return (null) // To delete
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
      let cpv = cpvList.find(a => a.code === code)
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

  let publication_timestamp = new Date(tender.publicationDate).getTime()

  let bidDeadline_timestamp = new Date(tender.bidDeadlineDate).getTime()

  const bidDeadlineDate = tender.bidDeadlineDate === '--' ? null : tender.bidDeadlineDate

  let tenderNew = {
    // objectID: tender.algoliaId ? tender.algoliaId : undefined,
    // dgmarketId: tender.dgmarketId,
    tenderId: tender.id,
    procurementId: tender.procurementId,
    title: stripHtml(tender.title).result,
    lang: tender.lang,
    description: stripHtml(tender.description).result,
    /*
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
    */
    buyer_name: tender.buyerName,
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
    // words: tender.words,
    currency: tender.currency ? tender.currency.trim() : '',
    publicationDate: tender.publicationDate,
    publication_timestamp: publication_timestamp,
    // cpvsOrigine: tender.cpvsOrigine,
    cpvs: cpvs,
    bidDeadlineDate: bidDeadlineDate,
    bidDeadline_timestamp: bidDeadline_timestamp,
    creation_timestamp: new Date().getTime(),
    // creation_timestamp: new Date('2019-04-02T08:24:00').getTime(),
    // creation_timestamp: publication_timestamp,
    // sourceUrls: sourceUrls,
    userId: tender.userId ? tender.userId : 0,
    scopeOfWorks: [],
    segments: [],
    designs: [],
    contractTypes: [],
    brands: [],
    financials: [],
    // fileSource: tender.fileSource,
    groups: [],
    datasource: tender.datasource,
    accountId: 'none',
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
  return (JSON.parse(JSON.stringify(tenderNew)))
}

let cpvList
exports.analyzeTender = async (tenderSrc) => {
  let analyzedData, formatedData
  cpvList = cpvList || await CpvList(null, true)
  const { tender, importOrigine } = await importTender(tenderSrc, cpvList, textParseList)
  if (!tender) {
    analyzedData = {
      ...tenderSrc,
      exclusion: importOrigine.exclusion,
      exclusionWord: importOrigine.exclusionWord,
      status: importOrigine.status,
    }
    formatedData = { status: analyzedData.status }
  }
  else {
    analyzedData = tender
    formatedData = await this.tenderFormat(tender, cpvList, textParseList)
    if (!formatedData) {
      formatedData = { status: -1 }
    } else {
      analyzedData.status = 20
      formatedData.status = 20
    }
  }
  return { analyzedData, formatedData }
}

/*
exports.completeTender = async (tender) => {
  const { analyzedData, formatedData } = await this.analyzeTender(tender)
  return {
    ...analyzedData,
    ...formatedData,
    id: tender.tenderUuid,
  }
}
*/
