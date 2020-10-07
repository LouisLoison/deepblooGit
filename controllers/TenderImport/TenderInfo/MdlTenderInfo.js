exports.ImportTenderInfo = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get files
      // Import into BDD
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
      let query = `DELETE FROM importTenderInfo WHERE fileSource = '${BddTool.ChaineFormater(files[0], BddEnvironnement, BddId)}' `
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      await BddTool.bulkInsert(
        BddId,
        BddEnvironnement,
        'importTenderInfo',
        fileParseData.importTenderInfos
      )

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

        /*
        if (tool.getXmlJsonData(row.posting_id) === "454383835") {
          let toto = 123
        }
        */

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
      const cpvs = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()
      const dataImportTenderInfos = await this.importTenderInfos({ status: 0 }, null, null, 1, 10000)
      const tenders = []
      for (const importTenderInfo of dataImportTenderInfos.entries) {
        const tender = await this.convertToTender(importTenderInfo, cpvs)
        tenders.push(tender)
      }
      resolve(tenders)
    } catch (err) { reject(err) }
  })
}

exports.convertToTender = (importTenderInfo, cpvs) => {
  return new Promise(async (resolve, reject) => {
    try {
      var moment = require('moment')
      let termDate = moment(importTenderInfo.doc_last, "YYYY-MM-DD").toDate()
      
      // cpvs
      const cpvsOrigine = []
      const cpvCodes = []
      const cpvDescriptions = []
      for (const cpvCode of importTenderInfo.cpv.split(',')) {
        const tenderCpv = cpvs.find(a => a.Code === Number(cpvCode))
        if (tenderCpv) {
          cpvsOrigine.push(tenderCpv.text)
          cpvCodes.push(tenderCpv.text)
          cpvDescriptions.push(tenderCpv.text)
        }
      }

      const tender = {
        dgmarketId: 0,
        procurementId: importTenderInfo.procurementId,
        title: importTenderInfo.short_desc,
        lang: '',
        description: importTenderInfo.tender_details,
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
        cpvsOrigine: cpvsOrigine.slice(0, 25).join(),
        cpvs: cpvCodes.slice(0, 25).join(),
        cpvDescriptions: cpvDescriptions.slice(0, 25).join(),
        words: '',
        bidDeadlineDate: importTenderInfo.doc_last.replace(/-/g, ''),
        sourceUrl: importTenderInfo.related_documents,
        termDate: termDate,
        fileSource: importTenderInfo.fileSource,
        creationDate: new Date(),
        updateDate: new Date(),
      }
      resolve(tender)
    } catch (err) { reject(err) }
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
                    fileSource AS "fileSource",
                    exclusion AS "exclusion",
                    exclusionWord AS "exclusionWord",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate" 
        FROM        importTenderInfo `
      let where = ``
      if (filter) {
        if (filter.status) {
          if (where !== '') { where += 'AND ' }
          where += `tenderGroupLink.status = ${BddTool.NumericFormater(filter.status, BddEnvironnement, BddId)} \n`
        }
      }
      if (where !== '') { query += '\nWHERE ' + where }
      if (orderBy) {
        query += `\nORDER BY ${orderBy} `
      }
      query += ` LIMIT ${(page - 1) * pageLimit}, ${pageLimit} `

      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query, true)
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
