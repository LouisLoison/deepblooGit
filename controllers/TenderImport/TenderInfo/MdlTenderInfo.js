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
          related_documents = row.related_documents[0].document_url.join('|')
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
