const config = require(process.cwd() + '/config/')

let elasticSearchClient = false

const tendersEngine = `tenders-${process.env.NODE_ENV || 'dev'}`

exports.connectToElasticsearch = async () => {
  if(!elasticSearchClient) {
    const { Client } = require('@elastic/elasticsearch')

    const node = config.elasticEndpoint
    const auth = {
      username: config.elasticUser,
      password: config.elasticPassword,
    }

    // Elasticsearch connexion
    elasticSearchClient = new Client({
      node,
      auth,
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true
    })
  }
  return elasticSearchClient
}

exports.indexToElasticsearch = async (objects, index) => {
  const client = await this.connectToElasticsearch()
  await objects.forEach(async body => {
    //console.log(body.id)
    await client.index({
      id: body.id,
      index: `${index}-${config.env}`,
      body,
    }).catch(err => console.log(err))
  })
}

exports.connectToPublicAppSearch = (engineName = tendersEngine) => {
  return new Promise(async (resolve, reject) => {
    try {
      const ElasticAppSearch = require("@elastic/app-search-javascript");
      const client = ElasticAppSearch.createClient({
        hostIdentifier: "host-c5s2mj",
        searchKey: config.appsearchSearchKey,
        endpointBase: config.appsearchEndpoint,
        engineName,
      })
      resolve(client)
    } catch (err) { reject(err) }
  })
}

exports.connectToPrivateAppSearch = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const AppSearchClient = require('@elastic/app-search-node')
      const privateKey = config.appsearchPrivateKey
      const baseUrlFn = () => config.appsearchEndpoint + 'api/as/v1/'
      const client = new AppSearchClient(undefined, privateKey, baseUrlFn)

      resolve(client)
    } catch (err) { reject(err) }
  })
}

// Indexes an objects array into appsearch's "deepbloo" engine.
// This will update any document having the same "id" fields,
// adding any new field to the document
exports.indexObjectToAppsearch = (objects, engineName = tendersEngine) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Init object id
      for (const object of objects) {
        if (!object.id && object.tenderId) {
          object.id = object.tenderId
        }
      }
      // App search seemingly prefers snake case
      const snakedObjects = objects.map((object) => Object.keys(object).reduce((acc, key) => {
        const snakedKey = key.replace(/[\w]([A-Z])/g, (m) => m[0] + "_" + m[1]).toLowerCase()
        acc[snakedKey] = object[key]
        return acc
      }, {}))
      const client = await this.connectToPrivateAppSearch()
      const response = await client.indexDocuments(engineName, snakedObjects)
      resolve(response)
    } catch (err) { reject(err) }
  })
}

// This way of updating (PATCH operation) will NOT add any new field
exports.updateObject = (objects, engineName = tendersEngine) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Init object id
      for (const object of objects) {
        if (!object.id && object.tenderId) {
          object.id = object.tenderId
        }
      }
      // App search seemingly prefers snake case
      const snakedObjects = objects.map((object) => Object.keys(object).reduce((acc, key) => {
        const snakedKey = key.replace(/[\w]([A-Z])/g, (m) => m[0] + "_" + m[1]).toLowerCase()
        acc[snakedKey] = object[key]
        return acc
      }, {}))
      const client = await this.connectToPrivateAppSearch()
      const response = client.updateDocuments(engineName, snakedObjects)
      resolve(response)
    } catch (err) { reject(err) }
  })
}

exports.deleteObject = (objectIds, engineName = tendersEngine) => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await this.connectToPrivateAppSearch()
      const response = await client.destroyDocuments(engineName, objectIds)
      resolve(response)
    } catch (err) { reject(err) }
  })
}

exports.tendersFormat = (tenders) => {
  return new Promise(async (resolve, reject) => {
    try {
      const htmlToText = require('html-to-text')

      const tenderNews = []
      for (const tender of tenders) {
        const tenderNew = JSON.parse(JSON.stringify(tender))

        tenderNew.title = htmlToText.fromString(tenderNew.title)
        tenderNew.title = tenderNew.title.replace(/&amp;amp;/g, '')
        tenderNew.title = tenderNew.title.replace(/&amp;/g, '')
        tenderNew.title = tenderNew.title.replace(/amp;/g, '')
  
        tenderNew.description = htmlToText.fromString(tenderNew.description)

        if (tenderNew.bidDeadlineDate == '--') {
          tenderNew.bidDeadlineDate = null
        }

        tenderNew.buyer_name = ''
        if (tenderNew.buyer && tenderNew.buyer.name) {
          tenderNew.buyer_name = tenderNew.buyer.name
        }
        delete tenderNew.contact
        delete tenderNew.buyer
        delete tenderNew.contact
        delete tenderNew.words
        delete tenderNew.cpvsOrigine
        delete tenderNew.sourceUrls
        delete tenderNew.fileSource
        delete tenderNew.origine
        delete tenderNew.dataSourceId
        tenderNews.push(tenderNew)
      }
      resolve(tenderNews)
    } catch (err) { reject(err) }
  })
}

// Import tender into elastic search
exports.tendersImport = (tendersNumberMax = 100) => {
  return new Promise(async (resolve, reject) => {
    try {
      const CpvList = await require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvList()
      const textParses = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()

      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      
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
        WHERE       tenders.status = 0 
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
        WHERE       tenders.status = 20
        ORDER BY    creationDate DESC 
        LIMIT ${tendersNumberMax}
      `
      recordset = await BddTool.QueryExecBdd2(query)
      const tenders = []
      const tenderIdDeletes = []
      for (const record of recordset) {
        record.tenderCriterions = tenderCriterionAlls.filter(a => a.tenderId === record.id)
        let tender = await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TenderFormat(record, CpvList, textParses)
	      if (!tender) { // eg. tender matches no CPV
          if (record.id) {
            tenderIdDeletes.push(record.id)
            // tenders.push(record)
          }
          continue
        }
        tender.id = record.id
        tenders.push(tender)
      }
      const tranches = []
      let borneMin = 0
      let occurence = 20
      do {
        tranches.push(tenders.slice(borneMin, (borneMin + occurence)))
        borneMin += occurence
      } while (borneMin < tenders.length)
      for (const tranche of tranches) {
         await this.indexObjectToAppsearch(tranche)
        // await this.indexObjectToAppsearch(tranche, 'deepbloo-en')
        await this.indexToElasticsearch(tranche, 'tenders')
      }
      
      resolve(tenders.length)
    } catch (err) { reject(err) }
  })
}

exports.formatSearchQuery = (searchRequest) => {
  const query = searchRequest.searchInputValue
  const searchFields = { title: {} }
  const resultFields = {
    id: { raw: {} },
    title: { raw: {} },
    country: { raw: {} },
    publication_timestamp: { raw: {} },
    bid_deadline_timestamp: { raw: {} },
    cpvs: { raw: {} },
    description: { raw: {} },
  }
  const options = {
    filters: { all: [] },
    search_fields: searchFields,
    result_fields: resultFields,
    facets: searchRequest.facets,
  }
  if (searchRequest.filter) {
    for (const field in searchRequest.filter) {
      if (searchRequest.filter[field].length) {
        let anys = []
        for (const value of searchRequest.filter[field]) {
          let option = {}
          option[field] = value
          anys.push(option)
        }
        options.filters.all.push({ any: anys })
      }
    }
  }
  return {
    query,
    options,
  }
}

// Import tender into elastic search
exports.search = (searchRequest) => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await this.connectToPrivateAppSearch()
      const { query, options } = this.formatSearchQuery(searchRequest)
      const result = await client.search(config.elasticEngineName, query, options)
      resolve(result)
    } catch (err) { reject(err) }
  })
}

// Import tender into elastic search
exports.multiSearch = (searchRequests) => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await this.connectToPrivateAppSearch()
      const searches = []
      for (const searchRequest of searchRequests) {
        searches.push(this.formatSearchQuery(searchRequest))
      }
      const results = await client.multiSearch(config.elasticEngineName, searches)
      resolve(results)
    } catch (err) { reject(err) }
  })
}

// Import tender into elastic search
exports.searchFacet = (query, facet) => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await this.connectToPrivateAppSearch()
      const searchFields = {}
      searchFields[facet] = {}
      const resultFields = {}
      resultFields[facet] = { raw: {} }
      const options = {
        filters: { all: [] },
        search_fields: searchFields,
        result_fields: resultFields,
        page: {size: 500, current: 1}
      }
      const result = await client.search(config.elasticEngineName, query, options)
      let facetResults = result.results.map(a => Array.isArray(a[facet].raw) ? a[facet].raw[0] : a[facet].raw)
      facetResults = [...new Set(facetResults)]
      resolve(facetResults)

      /*
      const client = await this.connectToPrivateAppSearch()
      const options = {
        size: 3,
        types: {
          documents: {
            fields: [facet]
          }
        }
      }
      const result = await client.querySuggestion(config.elasticEngineName, query, options)
      const facetResults = result.results.documents.map(a => a.suggestion)
      resolve(facetResults)
      */
  } catch (err) { reject(err) }
  })
}
