exports.TendersImport = () => {
  return new Promise(async (resolve, reject) => {
    // const DgMarket = require(process.cwd() + '/controllers/DgMarket/MdlDgMarket')
    // const tenders = await DgMarket.FileParse()
    const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

    const BddId = 'deepbloo'
    const BddEnvironnement = 'PRD'
    const BddTool = require(process.cwd() + '/global/BddTool')
    let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, `
      SELECT      id AS "id", 
                  hivebriteId AS "hivebriteId", 
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
                  bidDeadlineDate AS "bidDeadlineDate", 
                  sourceUrl AS "sourceUrl", 
                  fileSource AS "fileSource", 
                  algoliaId AS "algoliaId", 
                  status AS "status", 
                  creationDate AS "creationDate", 
                  updateDate AS "updateDate" 
      FROM        dgmarket 
      WHERE       status = 0 
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

      let dateText = record.publicationDate
      let publicationDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
      let publication_timestamp = new Date(publicationDate).getTime()

      dateText = record.bidDeadlineDate
      let bidDeadlineDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
      let bidDeadline_timestamp = new Date(bidDeadlineDate).getTime()

      tenders.push({
        hivebriteId: record.id,
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
        currency: record.currency,
        publicationDate: publicationDate,
        publication_timestamp: publication_timestamp,
        cpvs: cpvs,
        industries: industries,
        bidDeadlineDate: bidDeadlineDate,
        bidDeadline_timestamp: bidDeadline_timestamp,
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
    let index = client.initIndex('dev_tenders')
    for (tranche of tranches) {
      await this.TendersAdd(tranche, index)
    }
    resolve()
  })
}

exports.TendersAdd = (tenders, index) => {
  return new Promise((resolve, reject) => {
      index.addObjects(tenders, (err, content) => {
        if (err) {
          console.error(err)
          reject(err)
          return
        }
        // console.error(content)
        for (let i = 0; i < tenders.length; i++) {
          tenders[i].objectID = content.objectIDs[i]
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
      let client = algoliasearch(applicationId, apiKey, {
          timeout: 4000,
      })

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
