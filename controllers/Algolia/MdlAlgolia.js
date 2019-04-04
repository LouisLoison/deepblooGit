exports.TendersImport = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // const DgMarket = require(process.cwd() + '/controllers/DgMarket/MdlDgMarket')
      // await DgMarket.BddImport()

      const config = require(process.cwd() + '/config')
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')
      const RegionList = require(process.cwd() + '/public/constants/regions.json')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, `
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
                    fileSource AS "fileSource", 
                    algoliaId AS "algoliaId", 
                    status AS "status", 
                    creationDate AS "creationDate", 
                    updateDate AS "updateDate" 
        FROM        dgmarket 
        WHERE       status = 0 
        LIMIT       300
      `)
      const tenders = []
      for (let record of recordset) {
        // Url source list
        let sourceUrls = []
        let sourceUrl = record.sourceUrl
        if (sourceUrl) {
          sourceUrl.split(',').forEach(url => {
            sourceUrls.push(url)
          })
        }

        // CPV list
        let cpvOkCount = 0
        let cpvs = []
        let industries = []
        let cpvsText = record.cpvs
        let cpvDescriptionsText = record.cpvDescriptions
        if (cpvsText && cpvDescriptionsText) {
          let cpvsTextTemp = cpvsText.split(',')
          let cpvDescriptionsTextTemp = cpvDescriptionsText.split(',')
          for (let i = 0; i < cpvsTextTemp.length; i++) {
            let code = parseInt(cpvsTextTemp[i], 10)
            let cpv = CpvList.find(a => a.code === code)
            if (cpv) {
              if (cpv.active) {
                cpvOkCount++
              }
              cpvs.push(cpvDescriptionsTextTemp[i].split('-').join(' ').trim())
              industries = industries.concat(cpv.industries)
            }
          }
        }
        if (cpvOkCount === 0) {
          continue
        }
        industries = industries.filter((item, pos) => industries.indexOf(item) == pos)

        // Categories
        let categories1 = []
        let categories2 = []
        let categoryLvl0 = []
        let categoryLvl1 = []
        let categoryLvl2 = []
        if (cpvsText && cpvDescriptionsText) {
          let cpvsTextTemp = cpvsText.split(',')
          for (let i = 0; i < cpvsTextTemp.length; i++) {
            let code = parseInt(cpvsTextTemp[i], 10)
            let cpv = CpvList.find(a => a.code === code)
            if (cpv && cpv.category1 && cpv.category2 && cpv.category1 !== '' && cpv.category2 !== '') {
              if (!categories1.includes(cpv.category1)) {
                categories1.push(cpv.category1)
              }
              if (!categories2.includes(cpv.category2)) {
                categories2.push(cpv.category2)
              }
              categoryLvl0.push(cpv.category2)
              categoryLvl1.push(`${cpv.category2} > ${cpv.category1}`)
              categoryLvl2.push(`${cpv.category2} > ${cpv.category1} > ${cpv.label}`)
            }
          }
        }

        // Region
        let regionLvl0 = []
        let regionLvl1 = []
        let regionLvl2 = []
        for (let region of RegionList) {
          if (region.countrys && region.countrys.includes(record.country)) {
            regionLvl0.push(region.label)
            regionLvl1.push(`${region.label} > ${record.country}`)
          }
          if (region.regions) {
            for (let region2 of region.regions) {
              if (region2.countrys && region2.countrys.includes(record.country)) {
                regionLvl0.push(region.label)
                regionLvl1.push(`${region.label} > ${region2.label}`)
                regionLvl2.push(`${region.label} > ${region2.label} > ${record.country}`)
              }
            }
          }
        }

        let dateText = record.publicationDate
        let publicationDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
        let publication_timestamp = new Date(publicationDate).getTime()

        dateText = record.bidDeadlineDate
        let bidDeadlineDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
        let bidDeadline_timestamp = new Date(bidDeadlineDate).getTime()

        tenders.push({
          objectID: record.algoliaId ? record.algoliaId : undefined,
          dgmarketId: record.dgmarketId,
          procurementId: record.procurementId,
          title: record.title,
          lang: record.lang,
          description: record.description,
          contact: {
            firstName: record.contactFirstName,
            lastName: record.contactLastName,
            address: record.contactAddress,
            city: record.contactCity,
            state: record.contactState,
            country: record.contactCountry,
            email: record.contactEmail,
            phone: record.contactPhone,
          },
          buyer: {
            name: record.buyerName,
            country: record.buyerCountry,
          },
          procurementMethod: record.procurementMethod,
          noticeType: record.noticeType,
          country: record.country,
          regionLvl0: regionLvl0,
          regionLvl1: regionLvl1,
          regionLvl2: regionLvl2,
          categories1: categories1,
          categories2: categories2,
          categoryLvl0: categoryLvl0,
          categoryLvl1: categoryLvl1,
          categoryLvl2: categoryLvl2,
          words: record.words,
          currency: record.currency,
          publicationDate: publicationDate,
          publication_timestamp: publication_timestamp,
          cpvs: cpvs,
          industries: industries,
          bidDeadlineDate: bidDeadlineDate,
          bidDeadline_timestamp: bidDeadline_timestamp,
          creation_timestamp: new Date().getTime(),
          // creation_timestamp: new Date('2019-04-02T08:24:00').getTime(),
          sourceUrls: sourceUrls,
          fileSource: record.fileSource
        })
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
        await this.TendersAdd(tranche, index)
      }
      resolve(tenders.length)
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
        await BddTool.QueryExecBdd2(BddId, BddEnvironnement, `
          UPDATE      dgmarket 
          SET         algoliaId = '${BddTool.ChaineFormater(tenders[i].objectID, BddEnvironnement, BddId)}', 
                      status = 20 
          WHERE       dgmarketId = ${BddTool.NumericFormater(tenders[i].dgmarketId, BddEnvironnement, BddId)} 
        `)
      }
      resolve(tenders)
    })
  })
}

exports.TendersAddOld = () => {
  return new Promise((resolve, reject) => {
    const algoliasearch = require('algoliasearch')
    let applicationId = '583JWW9ARP'
    let apiKey = '5cc468809130d45b76cf76598a09ff21'
    let client = algoliasearch(applicationId, apiKey, {
      timeout: 4000,
    })

    let index = client.initIndex('dev_tenders')
    let tenders = [
      {
        "firstname": "Essie",
        "lastname": "Vaill",
        "company": "Litronic Industries",
        "address": "14225 Hancock Dr",
        "city": "Anchorage",
        "county": "Anchorage",
        "state": "AK",
        "zip": "99515",
        "phone": "907-345-0962",
        "fax": "907-345-1215",
        "email": "essie@vaill.com",
        "web": "http://www.essievaill.com",
        "followers": 3574
      },
      {
        "firstname": "Cruz",
        "lastname": "Roudabush",
        "company": "Meridian Products",
        "address": "2202 S Central Ave",
        "city": "Phoenix",
        "county": "Maricopa",
        "state": "AZ",
        "zip": "85004",
        "phone": "602-252-4827",
        "fax": "602-252-4009",
        "email": "cruz@roudabush.com",
        "web": "http://www.cruzroudabush.com",
        "followers": 6548
      },
    ]
    index.addObjects(tenders, (err, content) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      console.error(content)
      for (let i = 0; i < tenders.length; i++) {
        tenders[i].objectID = content[i]
      }
      resolve()
    })
  })
}

exports.Test = () => {
  return new Promise((resolve, reject) => {
    const algoliasearch = require('algoliasearch')
    let applicationId = '583JWW9ARP'
    let apiKey = '5cc468809130d45b76cf76598a09ff21'
    let client = algoliasearch(applicationId, apiKey, {
      timeout: 4000,
    })

    let index = client.initIndex('contacts')
    index.search({
      query: ''
    }, function searchDone(err, content) {
      if (err) throw err;
        console.log(content.hits);
      }
    );
    resolve()
  })
}

exports.Test2 = () => {
  return new Promise((resolve, reject) => {
    const algoliasearch = require('algoliasearch')
    let applicationId = '583JWW9ARP'
    let apiKey = '5cc468809130d45b76cf76598a09ff21'
    let client = algoliasearch(applicationId, apiKey, { timeout: 4000 })

    let index = client.initIndex('contacts')
    let contactsJSON = [
      {
        "firstname": "Essie",
        "lastname": "Vaill",
        "company": "Litronic Industries",
        "address": "14225 Hancock Dr",
        "city": "Anchorage",
        "county": "Anchorage",
        "state": "AK",
        "zip": "99515",
        "phone": "907-345-0962",
        "fax": "907-345-1215",
        "email": "essie@vaill.com",
        "web": "http://www.essievaill.com",
        "followers": 3574
      },
      {
        "firstname": "Cruz",
        "lastname": "Roudabush",
        "company": "Meridian Products",
        "address": "2202 S Central Ave",
        "city": "Phoenix",
        "county": "Maricopa",
        "state": "AZ",
        "zip": "85004",
        "phone": "602-252-4827",
        "fax": "602-252-4009",
        "email": "cruz@roudabush.com",
        "web": "http://www.cruzroudabush.com",
        "followers": 6548
      },
    ]

    index.addObjects(contactsJSON, function(err, content) {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      console.error(content)
      resolve()
    })
  })
}
