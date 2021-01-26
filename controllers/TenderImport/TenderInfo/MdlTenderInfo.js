exports.ImportTenderInfo = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      var path = require('path')

      // Get files from S3
      const folderIncomming = 'incoming/tenderinfo/'
      const contents = await require(process.cwd() + '/controllers/Tool/MdlTool').awsFileList(config.awsBucketFtp, folderIncomming)
      for (const content of contents) {
        let filename = content.Key.split('/').pop()
        if (!filename.toUpperCase().endsWith('.XML')) {
          continue
        }
        const fileLocation = path.join(config.WorkSpaceFolder, 'TenderImport/TenderInfo/Ftp/', filename)
        await require(process.cwd() + '/controllers/Tool/MdlTool').awsFileGet(config.awsBucketFtp, content.Key, fileLocation)
        await require(process.cwd() + '/controllers/Tool/MdlTool').awsFileMove(config.awsBucketFtp, content.Key, content.Key.replace(filename, `archive/${filename}`))
      }

      // Import file content into BDD
      await this.BddImport()

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.BddImport = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')      
      
      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/TenderInfo/Ftp/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
        return
      }
      const fileLocation = path.join(fileFolder, files[0])

      // Parse info from file
      let fileParseData = null
      try {
        fileParseData = await this.FileParse(fileLocation)
      } catch (err) {
        const fileLocationReject = path.join(config.WorkSpaceFolder, 'TenderImport/TenderInfo/Reject/', fileSource)
        fs.renameSync(fileLocation, fileLocationReject)
        reject(err)
        return
      }

      // Bulk insert into import table
      let query = `DELETE FROM importTenderInfo WHERE fileSource = '${BddTool.ChaineFormater(files[0])}' `
      await BddTool.QueryExecBdd2(query)
      await BddTool.bulkInsert(
        BddId,
        BddEnvironnement,
        'importTenderInfo',
        fileParseData.importTenderInfos
      )

      // Search tender by procurementId
      query = `
        UPDATE      importTenderInfo 
        INNER JOIN  tenders ON 
                    importTenderInfo.tender_notice_no = tenders.procurementId 
                    AND importTenderInfo.tender_notice_no != ''
        SET         importTenderInfo.tenderId = tenders.id, 
                    importTenderInfo.mergeMethod = "PROCUREMENT_ID", 
                    importTenderInfo.status = 5
        WHERE 		  importTenderInfo.status = 1
        AND         importTenderInfo.tenderId IS NULL
      `
      await BddTool.QueryExecBdd2(query)

      // Search tender by title, buyer name and bidDeadline date
      query = `
        UPDATE      importTenderInfo 
        INNER JOIN  tenders ON 
                    importTenderInfo.maj_org = tenders.buyerName 
                    AND importTenderInfo.short_desc = tenders.title 
                    AND importTenderInfo.short_desc != '' 
                    AND REPLACE(importTenderInfo.doc_last, '-', '') = tenders.bidDeadlineDate 
        SET         importTenderInfo.tenderId = tenders.id, 
                    importTenderInfo.mergeMethod = "TITLE_BUYER_BIDDEADLINE", 
                    importTenderInfo.status = 5
        WHERE 		  importTenderInfo.status = 1
        AND         importTenderInfo.tenderId IS NULL
      `
      await BddTool.QueryExecBdd2(query)

      // Move file to archive folder
      const fileSource = path.parse(fileLocation).base
      const fileLocationArchive = path.join(config.WorkSpaceFolder, 'TenderImport/TenderInfo/Archive/', fileSource)
      fs.renameSync(fileLocation, fileLocationArchive)

      resolve({
        tenderCount: fileParseData.tenderCount,
      })
    } catch (err) {
      reject(err)
    }
  })
}

exports.FileParse = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fs = require('fs')
      const path = require('path')
      const util = require('util')
      const tool = require(process.cwd() + '/controllers/CtrlTool')
      const readFile = util.promisify(fs.readFile)

      const fileSource = path.parse(fileLocation).base
      let fileData = await readFile(fileLocation, 'utf8')

      const xml2js = require('xml2js')
      var parser = new xml2js.Parser()
      const parseString = util.promisify(parser.parseString)
      let parseData = await parseString(fileData)

      let tenderCount = 0
      let tenderOkCount = 0
      let tenderFoundCount = 0
      const importTenderInfos = []
      for (const row of parseData.import.row) {
        tenderCount++

        let related_documents = ''
        if (
          row.related_documents
          && row.related_documents.length
          && row.related_documents[0].document_url
          && row.related_documents[0].document_url.length
        ) {
          related_documents = row.related_documents[0].document_url.join(',')
        }

        const importTenderInfo = {
          posting_id: tool.getXmlJsonData(row.posting_id),
          date_c: tool.getXmlJsonData(row.date_c),
          email_id: tool.getXmlJsonData(row.email_id),
          region: tool.getXmlJsonData(row.region),
          region_code: tool.getXmlJsonData(row.region_code),
          add1: tool.getXmlJsonData(row.add1),
          add2: tool.getXmlJsonData(row.add2),
          city: tool.getXmlJsonData(row.city),
          state: tool.getXmlJsonData(row.state),
          pincode: tool.getXmlJsonData(row.pincode),
          country: tool.getXmlJsonData(row.country),
          country_code: tool.getXmlJsonData(row.country_code),
          url: tool.getXmlJsonData(row.url),
          tel: tool.getXmlJsonData(row.tel),
          fax: tool.getXmlJsonData(row.fax),
          contact_person: tool.getXmlJsonData(row.contact_person),
          maj_org: tool.getXmlJsonData(row.maj_org),
          tender_notice_no: tool.getXmlJsonData(row.tender_notice_no),
          notice_type: tool.getXmlJsonData(row.notice_type),
          notice_type_code: tool.getXmlJsonData(row.notice_type_code),
          bidding_type: tool.getXmlJsonData(row.bidding_type),
          global: tool.getXmlJsonData(row.global),
          mfa: tool.getXmlJsonData(row.mfa),
          tenders_details: tool.getXmlJsonData(row.tenders_details),
          short_desc: tool.getXmlJsonData(row.short_desc),
          currency: tool.getXmlJsonData(row.currency),
          est_cost: tool.getXmlJsonData(row.est_cost),
          doc_last: tool.getXmlJsonData(row.doc_last),
          financier: tool.getXmlJsonData(row.financier),
          related_documents: related_documents,
          sector: tool.getXmlJsonData(row.sector),
          sector_code: tool.getXmlJsonData(row.sector_code),
          corregendum_details: tool.getXmlJsonData(row.corregendum_details),
          project_name: tool.getXmlJsonData(row.project_name),
          cpv: tool.getXmlJsonData(row.cpv),
          authorize: tool.getXmlJsonData(row.authorize),
          fileSource: fileSource,
          exclusion: '',
          exclusionWord: '',
          status: 1,
          creationDate: new Date(),
          updateDate: new Date()
        }
        importTenderInfos.push(importTenderInfo)
      }

      resolve({
        tenderCount,
        tenderOkCount,
        tenderFoundCount,
        importTenderInfos,
      })
    } catch (err) { reject(err) }
  })
}

exports.mergeTender = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList(null, true)
      const textParses = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()
      const dataImportTenderInfos = await this.importTenderInfos({ tenderId: 0, statuss: [1, 5] }, null, null, 1, 1000)
      let tenderKoCount = 0
      for (const importTenderInfo of dataImportTenderInfos.entries) {
        const tender = await this.convertToTender(importTenderInfo, CpvList, textParses)
        if (tender) {
          let dataImportTender = await require(process.cwd() + '/controllers/TenderImport/MdlTenderImport').importTender(tender, CpvList, textParses)
          if (dataImportTender.tender) {
            importTenderInfo.status = 20
            await this.importTenderInfoAddUpdate(importTenderInfo)
          } else if (dataImportTender.importOrigine) {
            importTenderInfo.exclusion = dataImportTender.importOrigine.exclusion
            importTenderInfo.exclusionWord = dataImportTender.importOrigine.exclusionWord
            importTenderInfo.status = dataImportTender.importOrigine.status
            await this.importTenderInfoAddUpdate(importTenderInfo)
            tenderKoCount++
          }
        }
      }

      resolve({
        tenderCount: dataImportTenderInfos.entries.length,
        tenderKoCount,
      })
    } catch (err) { reject(err) }
  })
}

exports.convertToTender = (importTenderInfo, CpvList, textParses) => {
  return new Promise(async (resolve, reject) => {
    try {
      var moment = require('moment')
      let title = importTenderInfo.short_desc
      let description = importTenderInfo.tenders_details
      let termDate = moment(importTenderInfo.doc_last, "YYYY-MM-DD").toDate()

      /*
      // Test exclusion
      let isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(title, 'TITLE')
      if (!isOk.status) {
        importTenderInfo.exclusion = 'TITLE'
        importTenderInfo.exclusionWord = isOk.origine
        importTenderInfo.status = -10
        await this.importTenderInfoAddUpdate(importTenderInfo)
        resolve(null)
        return
      }
      isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(description, 'DESCRIPTION')
      if (!isOk.status) {
        importTenderInfo.exclusion = 'DESCRIPTION'
        importTenderInfo.exclusionWord = isOk.origine
        importTenderInfo.status = -10
        await this.importTenderInfoAddUpdate(importTenderInfo)
        resolve(null)
        return
      }
      */

      let tender = {
        dataSourceId: 0,
        procurementId: importTenderInfo.procurementId,
        title,
        lang: '',
        description,
        contactFirstName: '',
        contactLastName: '',
        contactAddress: importTenderInfo.add1,
        contactCity: importTenderInfo.city,
        contactState: importTenderInfo.state,
        contactCountry: importTenderInfo.country,
        contactEmail: importTenderInfo.city,
        contactPhone: importTenderInfo.email_id,
        buyerName: importTenderInfo.maj_org,
        buyerCountry: '',
        procurementMethod: importTenderInfo.bidding_type,
        noticeType: importTenderInfo.notice_type,
        country: importTenderInfo.country,
        estimatedCost: importTenderInfo.est_cost,
        currency: importTenderInfo.currency,
        publicationDate: importTenderInfo.date_c.replace(/-/g, ''),
        cpvsOrigine: null,
        cpvs: importTenderInfo.cpv,
        cpvDescriptions: null,
        words: '',
        bidDeadlineDate: importTenderInfo.doc_last.replace(/-/g, ''),
        sourceUrl: importTenderInfo.related_documents,
        termDate: termDate,
        fileSource: importTenderInfo.fileSource,
        origine: 'TenderInfo',
        creationDate: new Date(),
        updateDate: new Date(),
      }

      /*
      // Search CPVs and criterions
      const dataSearchCpvCriterions = await require(process.cwd() + '/controllers/TenderImport/MdlTenderImport').searchCpvCriterions(tender, CpvList, textParses)
      if (dataSearchCpvCriterions.importExclusion) {
        importTenderInfo.exclusion = dataSearchCpvCriterions.importExclusion.exclusion
        importTenderInfo.exclusionWord = dataSearchCpvCriterions.importExclusion.exclusionWord
        importTenderInfo.status = -10
        await this.importTenderInfoAddUpdate(importTenderInfo)
        resolve(null)
      }
      tender = dataSearchCpvCriterions.tender
      */

      resolve(tender)
    } catch (err) { reject(err) }
  })
}

exports.importTenderInfoAddUpdate = (importTenderInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let importTenderInfoNew = await BddTool.RecordAddUpdate('importTenderInfo', importTenderInfo)
      resolve(importTenderInfoNew)
    } catch (err) {
      reject(err)
    }
  })
}

exports.importTenderInfos = (filter, orderBy, limit, page, pageLimit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      SQL_CALC_FOUND_ROWS 
                    importTenderInfoId AS "importTenderInfoId",
                    posting_id AS "posting_id",
                    date_c AS "date_c",
                    email_id AS "email_id",
                    region AS "region",
                    region_code AS "region_code",
                    add1 AS "add1",
                    add2 AS "add2",
                    city AS "city",
                    state AS "state",
                    pincode AS "pincode",
                    country AS "country",
                    country_code AS "country_code",
                    url AS "url",
                    tel AS "tel",
                    fax AS "fax",
                    contact_person AS "contact_person",
                    maj_org AS "maj_org",
                    tender_notice_no AS "tender_notice_no",
                    notice_type AS "notice_type",
                    notice_type_code AS "notice_type_code",
                    bidding_type AS "bidding_type",
                    global AS "global",
                    mfa AS "mfa",
                    tenders_details AS "tenders_details",
                    short_desc AS "short_desc",
                    currency AS "currency",
                    est_cost AS "est_cost",
                    doc_last AS "doc_last",
                    financier AS "financier",
                    related_documents AS "related_documents",
                    sector AS "sector",
                    sector_code AS "sector_code",
                    corregendum_details AS "corregendum_details",
                    project_name AS "project_name",
                    cpv AS "cpv",
                    authorize AS "authorize",
                    tenderId AS "tenderId",
                    mergeMethod AS "mergeMethod",
                    fileSource AS "fileSource",
                    exclusion AS "exclusion",
                    exclusionWord AS "exclusionWord",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate" 
        FROM        importTenderInfo `
      let where = ''
      if (filter) {
        if (filter.fileSources && filter.fileSources.length) {
          if (where !== '') { where += 'AND ' }
          where += `importTenderInfo.fileSource IN (${BddTool.ArrayStringFormat(filter.fileSources)}) \n`
        }
        if (filter.mergeMethods && filter.mergeMethods.length) {
          if (where !== '') { where += 'AND ' }
          where += `importTenderInfo.mergeMethod IN (${BddTool.ArrayStringFormat(filter.mergeMethods)}) \n`
        }
        if (filter.tenderId !== null && filter.tenderId !== undefined) {
          if (where !== '') { where += 'AND ' }
          if (filter.tenderId === 0) {
            where += `(importTenderInfo.tenderId = 0 OR importTenderInfo.tenderId IS NULL) \n`
          } else {
            where += `importTenderInfo.tenderId = ${BddTool.NumericFormater(filter.tenderId)} \n`
          }
        }
        if (filter.status !== null && filter.status !== undefined) {
          if (where !== '') { where += 'AND ' }
          where += `importTenderInfo.status = ${BddTool.NumericFormater(filter.status)} \n`
        }
        if (filter.statuss && filter.statuss.length) {
          if (where !== '') { where += 'AND ' }
          where += `importTenderInfo.status IN (${BddTool.ArrayNumericFormater(filter.statuss)}) \n`
        }
      }
      if (where !== '') { query += '\nWHERE ' + where }
      if (orderBy) {
        query += `\nORDER BY ${orderBy} `
      }
      if (!page) {
        page = 1
      }
      if (!pageLimit) {
        pageLimit = 1000
      }
      query += ` LIMIT ${(page - 1) * pageLimit}, ${pageLimit} `

      let recordset = await BddTool.QueryExecBdd2(query, true)
      let importTenderInfos = []
      for (const record of recordset.results) {
        importTenderInfos.push({
          importTenderInfoId: record.importTenderInfoId,
          posting_id: record.posting_id,
          date_c: record.date_c,
          email_id: record.email_id,
          region: record.region,
          region_code: record.region_code,
          add1: record.add1,
          add2: record.add2,
          city: record.city,
          state: record.state,
          pincode: record.pincode,
          country: record.country,
          country_code: record.country_code,
          url: record.url,
          tel: record.tel,
          fax: record.fax,
          contact_person: record.contact_person,
          maj_org: record.maj_org,
          tender_notice_no: record.tender_notice_no,
          notice_type: record.notice_type,
          notice_type_code: record.notice_type_code,
          bidding_type: record.bidding_type,
          global: record.global,
          mfa: record.mfa,
          tenders_details: record.tenders_details,
          short_desc: record.short_desc,
          currency: record.currency,
          est_cost: record.est_cost,
          doc_last: record.doc_last,
          financier: record.financier,
          related_documents: record.related_documents,
          sector: record.sector,
          sector_code: record.sector_code,
          corregendum_details: record.corregendum_details,
          project_name: record.project_name,
          cpv: record.cpv,
          authorize: record.authorize,
          tenderId: record.tenderId,
          mergeMethod: record.mergeMethod,
          fileSource: record.fileSource,
          exclusion: record.exclusion,
          exclusionWord: record.exclusionWord,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        })
      }

      resolve({
        entries: importTenderInfos,
        limit,
        page,
        pageLimit,
        totalCount: recordset.total,
      })
    } catch (err) {
      reject(err)
    }
  })
}

exports.importTenderInfoFacets = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      fileSource AS "fileSource", 
                    COUNT(*) AS "count"
        FROM        importTenderInfo 
        GROUP BY    fileSource 
      `
      let recordset = await BddTool.QueryExecBdd2(query, true)
      let fileSources = []
      for (const record of recordset.results) {
        fileSources.push({
          fileSource: record.fileSource,
          count: record.count,
        })
      }

      query = `
        SELECT      mergeMethod AS "mergeMethod", 
                    COUNT(*) AS "count"
        FROM        importTenderInfo 
        WHERE       mergeMethod IS NOT NULL 
        GROUP BY    mergeMethod 
      `
      recordset = await BddTool.QueryExecBdd2(query, true)
      let mergeMethods = []
      for (const record of recordset.results) {
        mergeMethods.push({
          mergeMethod: record.mergeMethod,
          count: record.count,
        })
      }

      query = `
        SELECT      status AS "status", 
                    COUNT(*) AS "count"
        FROM        importTenderInfo 
        WHERE       status IS NOT NULL 
        GROUP BY    status 
      `
      recordset = await BddTool.QueryExecBdd2(query, true)
      let statuss = []
      for (const record of recordset.results) {
        statuss.push({
          status: record.status,
          count: record.count,
        })
      }

      resolve({
        fileSources: fileSources,
        mergeMethods: mergeMethods,
        statuss: statuss,
      })
    } catch (err) {
      reject(err)
    }
  })
}
