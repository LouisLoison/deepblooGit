exports.BddImport = () => {
  return new Promise(async (resolve, reject) => {
    let tendersCurrent = null
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      
      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Ftp/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
        return
      }
      const fileLocation = path.join(fileFolder, files[0])

      // Get tenders
      let fileParseData = null
      try {
        fileParseData = await this.FileParse(fileLocation)
      } catch (err) {
        const fileLocationReject = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Reject/', files[0])
        fs.renameSync(fileLocation, fileLocationReject)
        reject(err)
        return
      }

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')      

      // Bulk insert into Dgmarket import table
      let query = `DELETE FROM importDgmarket WHERE fileSource = '${BddTool.ChaineFormater(files[0])}' `
      await BddTool.QueryExecBdd2(query)
      await BddTool.bulkInsert(
        BddId,
        BddEnvironnement,
        'importDgmarket',
        fileParseData.importDgmarkets
      )
      
      // Search tender by dataSourceId
      query = `
        UPDATE      importDgmarket 
        INNER JOIN  tenders ON 
                    importDgmarket.dataSourceId = tenders.dataSourceId 
                    AND importDgmarket.dataSourceId != ''
        SET         importDgmarket.tenderId = tenders.id, 
                    importDgmarket.mergeMethod = "DGMARKET_ID", 
                    importDgmarket.status = 5
        WHERE 		  importDgmarket.status = 1
        AND         importDgmarket.tenderId IS NULL
      `
      await BddTool.QueryExecBdd2(query)

      // Move file to archive folder
      const fileSource = path.parse(fileLocation).base
      const fileLocationArchive = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Archive/', fileSource)
      fs.renameSync(fileLocation, fileLocationArchive)

      resolve({
        tenderCount: fileParseData.tenderCount,
        tenderOkCount: fileParseData.tenderOkCount,
        tenderFoundCount: fileParseData.tenderFoundCount,
      })
    } catch (err) {
      tendersCurrent = tendersCurrent
      reject(err)
    }
  })
}

exports.FtpGet = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')

      // Get file list on FTP
      const files = await this.FtpList()
      const xmlFiles = files.filter(a => a.name.toLowerCase().startsWith('feed-') && a.name.toLowerCase().endsWith('.xml'))

      // Get file list on workspace folder
      const ftpFileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Ftp/')
      const ftpFiles = fs.readdirSync(ftpFileFolder)
      const archiveFileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Archive/')
      const archiveFiles = fs.readdirSync(archiveFileFolder)
      const workspaceFiles = ftpFiles.concat(archiveFiles)

      let importFiles = []
      for (const file of xmlFiles) {
        if (workspaceFiles.includes(file.name)) {
          continue
        }
        importFiles.push(file)
        await this.FtpGetFile(file.name)
      }
      resolve(importFiles)
    } catch (err) { reject(err) }
  })
}

exports.FtpGetFile = (fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const PromiseFtp = require('promise-ftp')
      const fs = require('fs')
      const path = require('path')
      const ftp = new PromiseFtp()

      const ftpFileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Ftp/')
      ftp.connect(config.ftp)
        .then((serverMessage) => {
          return ftp.get(`/feed/${fileName}`)
        })
        .then((stream) => {
          return new Promise((resolve, reject) => {
            const fileLocation = path.join(ftpFileFolder, fileName)
            stream.once('close', resolve)
            stream.once('error', reject)
            stream.pipe(fs.createWriteStream(fileLocation))
          })
        })
        .then(function () {
          return ftp.end()
        })
        .then(function () {
          resolve()
        })
    } catch (err) { reject(err) }
  })
}

exports.FtpList = () => {
  return new Promise((resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const PromiseFtp = require('promise-ftp')
      const ftp = new PromiseFtp()

      let files = []
      ftp.connect(config.ftp)
        .then((serverMessage) => {
          return ftp.list('/feed/')
        }).then((list) => {
          list.forEach(file => {
            files.push(file)
          })
          return ftp.end()
        }).then(() => {
          resolve(files)
        })
    } catch (err) { reject(err) }
  })
}

exports.FileParse = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
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
      const importDgmarkets = []
      let tenders = []
      for (const notice of parseData.notices.notice) {
        tenderCount++

        // Format title
        let title = tool.getXmlJsonData(notice.noticeTitle)

        // Format description
        let lang = ''
        let description = ''
        if (notice.noticeText) {
          let descriptions = []
          notice.noticeText.forEach(noticeText => {
            let description = descriptions.find(a => a.lang === noticeText.$.lang)
            if (description) {
              description.text += noticeText._ + '<br><br>'
              description.text = description.text
            } else {
              descriptions.push({
                lang: noticeText.$.lang,
                text: noticeText._ + '<br><br>'
              })
            }
          })
          if (descriptions && descriptions.length > 0) {
            lang = descriptions[0].lang
            description = descriptions[0].text
          }
        }
        
        // importDgmarket
        const importDgmarket = {
          dataSourceId: parseInt(tool.getXmlJsonData(notice.id), 10),
          procurementId: tool.getXmlJsonData(notice.procurementId).substring(0, 90),
          title: title.substring(0, 450),
          lang: lang,
          description: description.substring(0, 5000),
          contactFirstName: tool.getXmlJsonData(notice.contactAddress[0].firstName).substring(0, 90),
          contactLastName: tool.getXmlJsonData(notice.contactAddress[0].lastName).substring(0, 90),
          contactAddress: tool.getXmlJsonData(notice.contactAddress[0].address).substring(0, 490),
          contactCity: tool.getXmlJsonData(notice.contactAddress[0].city).substring(0, 90),
          contactState: tool.getXmlJsonData(notice.contactAddress[0].state).substring(0, 90),
          contactCountry: tool.getXmlJsonData(notice.contactAddress[0].country).substring(0, 90),
          contactEmail: tool.getXmlJsonData(notice.contactAddress[0].email).substring(0, 190),
          contactPhone: tool.getXmlJsonData(notice.contactAddress[0].phone).substring(0, 90),
          buyerName: tool.getXmlJsonData(notice.buyerName),
          buyerCountry: tool.getXmlJsonData(notice.buyerCountry),
          procurementMethod: tool.getXmlJsonData(notice.procurementMethod),
          noticeType: tool.getXmlJsonData(notice.noticeType),
          country: tool.getXmlJsonData(notice.country),
          estimatedCost: tool.getXmlJsonData(notice.estimatedCost),
          currency: tool.getXmlJsonData(notice.currency),
          publicationDate: tool.getXmlJsonData(notice.publicationDate),
          cpvs: tool.getXmlJsonData(notice.cpvs),
          bidDeadlineDate: tool.getXmlJsonData(notice.bidDeadlineDate),
          sourceUrl: tool.getXmlJsonData(notice.sourceUrl).substring(0, 1900),
          fileSource: fileSource,
          exclusion: '',
          exclusionWord: '',
          status: 1,
          creationDate: new Date(),
          updateDate: new Date()
        }
        importDgmarkets.push(importDgmarket)

        // check biddeadline
        let termDate = null
        let dateText = importDgmarket.bidDeadlineDate
        if (dateText && dateText.trim() !== '') {
          let bidDeadlineDateText = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
          termDate = new Date(bidDeadlineDateText)
        }
        if (!termDate || isNaN(termDate)) {
          dateText = importDgmarket.publicationDate
          if (dateText && dateText.trim() !== '') {
            let bidDeadlineDateText = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
            termDate = new Date(bidDeadlineDateText)
          }
        }
        if (!termDate || isNaN(termDate)) {
          termDate = new Date()
        }

        // Check limit date
        let dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - 15)
        if (termDate < dateLimit) {
          importDgmarket.exclusion = 'LIMIT DATE'
          importDgmarket.status = -10
          continue
        }
      }

      resolve({
        tenderCount,
        tenderOkCount,
        tenderFoundCount,
        importDgmarkets,
        tenders,
      })
    } catch (err) { reject(err) }
  })
}

exports.mergeTender = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList(null, true)
      const textParses = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()
      const dataImportDgmarkets = await this.importDgmarkets({ statuss: [1, 5] }, null, null, 1, 10000)
      let tenderKoCount = 0
      for (const importDgmarket of dataImportDgmarkets.entries) {
        const tender = await this.convertToTender(importDgmarket, CpvList, textParses)
        if (tender) {
          let dataImportTender = await require(process.cwd() + '/controllers/TenderImport/MdlTenderImport').importTender(tender, CpvList, textParses)
          if (dataImportTender.tender) {
            importDgmarket.status = 20
            await this.importDgmarketAddUpdate(importDgmarket)
          } else if (dataImportTender.importOrigine) {
            importDgmarket.exclusion = dataImportTender.importOrigine.exclusion
            importDgmarket.exclusionWord = dataImportTender.importOrigine.exclusionWord
            importDgmarket.status = dataImportTender.importOrigine.status
            await this.importDgmarketAddUpdate(importDgmarket)
            tenderKoCount++
          }
        }
      }

      resolve({
        tenderCount: dataImportDgmarkets.entries.length,
        tenderKoCount,
      })
    } catch (err) { reject(err) }
  })
}

exports.convertToTender = (importDgmarket) => {
  return new Promise(async (resolve, reject) => {
    try {
      let tender = {
        id: importDgmarket.tenderId,
        dataSourceId: importDgmarket.dataSourceId,
        procurementId: importDgmarket.procurementId,
        title: importDgmarket.title,
        lang: importDgmarket.lang,
        description: importDgmarket.description,
        contactFirstName: importDgmarket.contactFirstName,
        contactLastName: importDgmarket.contactLastName,
        contactAddress: importDgmarket.contactAddress,
        contactCity: importDgmarket.contactCity,
        contactState: importDgmarket.contactState,
        contactCountry: importDgmarket.contactCountry,
        contactEmail: importDgmarket.contactEmail,
        contactPhone: importDgmarket.contactPhone,
        buyerName: importDgmarket.buyerName,
        buyerCountry: importDgmarket.buyerCountry,
        procurementMethod: importDgmarket.procurementMethod,
        noticeType: importDgmarket.noticeType,
        country: importDgmarket.country,
        estimatedCost: importDgmarket.estimatedCost,
        currency: importDgmarket.currency,
        publicationDate: importDgmarket.publicationDate,
        cpvsOrigine: importDgmarket.cpvsOrigine,
        cpvs: importDgmarket.cpvs,
        cpvDescriptions: importDgmarket.cpvDescriptions,
        words: importDgmarket.words,
        bidDeadlineDate: importDgmarket.bidDeadlineDate,
        sourceUrl: importDgmarket.sourceUrl,
        termDate: importDgmarket.termDate,
        fileSource: importDgmarket.fileSource,
        origine: 'DgMarket',
        creationDate: new Date(),
        updateDate: new Date(),
      }
      resolve(tender)
    } catch (err) { reject(err) }
  })
}

exports.DescriptionParseForCpv = (description, cpvsText, cpvLabelsText, id, CpvList) => {
  let cpvs = []
  let words = []
  let cpvFoundCount = 0
  if (!cpvsText) {
    cpvsText = ''
  }
  for (let constCpv of CpvList) {
    if (!constCpv.code) {
      continue
    }
    
    // If constCpv already in the tender then past
    let cpvsTextTemp = cpvsText.split(',')
    let cpvFound = false
    for (let i = 0; i < cpvsTextTemp.length; i++) {
      let code = parseInt(cpvsTextTemp[i], 10)
      if (constCpv.code === code) {
        cpvFound = true
        break
      }
    }
    if (cpvFound) {
      continue
    }

    /*
    if (id === "29072466" && constCpv.code === 10000005) {
      let toto = 123;
    }
    */

    if (constCpv.cpvWords) {
      let cpvWords = JSON.parse(JSON.stringify(constCpv.cpvWords.map(a => a.word)))
      if (!cpvWords.includes(constCpv.label)) {
        cpvWords.push(constCpv.label)
      }
      for (let word of cpvWords) {
        let regEx = new RegExp("\\b" + word + "\\b", 'gi')
        if (description.match(regEx)) {
          if (!cpvs.includes(constCpv.code)) {
            cpvs.push(constCpv.code)
            cpvFoundCount++
            if (cpvsText !== '') {
              cpvsText += ','
            }
            cpvsText += constCpv.code
            if (cpvLabelsText !== '') {
              cpvLabelsText += ','
            }
            cpvLabelsText += constCpv.label
          }
          if (!words.includes(word)) {
            words.push(word)
          }
        }
      }
    }
  }
  return {
    words: words,
    cpvFoundCount: cpvFoundCount,
    cpvsText: cpvsText,
    cpvDescriptionsText: cpvLabelsText,
  }
}

exports.CpvList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const util = require('util')
      const tool = require(process.cwd() + '/controllers/CtrlTool')
      const readFile = util.promisify(fs.readFile)
      const RegionList = require(process.cwd() + '/public/constants/regions.json')
      const CategoryList = require(process.cwd() + '/public/constants/categories.json')
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()

      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Archive/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
        return
      }

      let tenders = []
      let cpvList = []
      for (let file of files) {
        if (tenders.length > 300) {
          break
        }
        const fileLocation = path.join(fileFolder, file)
        let fileData = await readFile(fileLocation, 'utf8')

        const xml2js = require('xml2js')
        var parser = new xml2js.Parser()
        const parseString = util.promisify(parser.parseString)
        let parseData = await parseString(fileData)

        parseData.notices.notice.forEach(notice => {

          if (tenders.length > 300) {
            return false
          }

          // check biddeadline
          let dateLimit = new Date()
          // dateLimit.setDate(dateLimit.getDate() - 15)
          let dateText = tool.getXmlJsonData(notice.bidDeadlineDate)
          if (!dateText || dateText.trim() === '') {
            return false
          }
          let bidDeadlineDateText = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
          let termDate = new Date(bidDeadlineDateText)
          if (isNaN(termDate)) {
            return false
          }
          if (termDate < dateLimit) {
            return false
          }

          // description
          let lang = ''
          let description = ''
          if (notice.noticeText) {
            let descriptions = []
            notice.noticeText.forEach(noticeText => {
              let description = descriptions.find(a => a.lang === noticeText.$.lang)
              if (description) {
                description.text += noticeText._ + '<br><br>'
                description.text = description.text.substring(0, 1000)
              } else {
                descriptions.push({
                  lang: noticeText.$.lang,
                  text: noticeText._ + '<br><br>'
                })
              }
            })
            if (descriptions && descriptions.length > 0) {
              lang = descriptions[0].lang
              description = descriptions[0].text.substring(0, 5000)
            }
          }

          // CPV list
          let cpvOkCount = 0
          let cpvsText = tool.getXmlJsonData(notice.cpvs)
          let cpvDescriptionsText = tool.getXmlJsonData(notice.cpvDescriptions)
          if (cpvsText) {
            let cpvsTextTemp = cpvsText.split(',')
            for (let i = 0; i < cpvsTextTemp.length; i++) {
              let code = parseInt(cpvsTextTemp[i], 10)
              let cpv = CpvList.find(a => a.code === code)
              let cpvfind = cpvList.find(a => a.cpv === code)
              if (!cpvfind) {
                cpvfind = {
                  cpv: code,
                  active: 'U',
                  count: 0
                }
                cpvList.push(cpvfind)
              }
              cpvfind.count++
              if (cpv) {
                if (cpv.active) {
                  cpvfind.active = 'Y'
                  cpvOkCount++
                } else {
                  cpvfind.active = 'N'
                }
              }
            }
          }
          // Search by key words
          let cpvFound = this.DescriptionParseForCpv(description, cpvsText, cpvDescriptionsText, CpvList)
          let words = cpvFound.words
          cpvsText = cpvFound.cpvsText
          cpvDescriptionsText = cpvFound.cpvDescriptionsText

          // Categories
          let categories = []
          let families = []
          if (cpvsText && cpvDescriptionsText) {
            let cpvsTextTemp = cpvsText.split(',')
            for (let i = 0; i < cpvsTextTemp.length; i++) {
              let code = parseInt(cpvsTextTemp[i], 10)
              let cpv = CpvList.find(a => a.code === code)
              if (cpv) {
                if (cpv.category && cpv.category !== '') {
                  if (!categories.includes(cpv.category)) {
                    categories.push(cpv.category)
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
          let country = tool.getXmlJsonData(notice.country)
          let regionLvl0 = []
          let regionLvl1 = []
          let regionLvl2 = []
          for (let region of RegionList) {
            if (region.countrys && region.countrys.includes(country)) {
              regionLvl0.push(region.label)
              regionLvl1.push(`${region.label} > ${country}`)
            }
            if (region.regions) {
              for (let region2 of region.regions) {
                if (region2.countrys && region2.countrys.includes(country)) {
                  regionLvl0.push(region.label)
                  regionLvl1.push(`${region.label} > ${region2.label}`)
                  regionLvl2.push(`${region.label} > ${region2.label} > ${country}`)
                }
              }
            }
          }

          tenders.push({
            dataSourceId: parseInt(tool.getXmlJsonData(notice.id), 10),
            title: tool.getXmlJsonData(notice.noticeTitle).substring(0, 100),
            description: description,
            buyerName: tool.getXmlJsonData(notice.buyerName),
            country: tool.getXmlJsonData(notice.country),
            regions: regionLvl1,
            cpvs: cpvsText,
            cpvDescriptions: tool.getXmlJsonData(notice.cpvDescriptions).substring(0, 300),
            categories: categories,
            families: families,
            publicationDate: tool.getXmlJsonData(notice.publicationDate),
            bidDeadlineDate: tool.getXmlJsonData(notice.bidDeadlineDate),
            words: words,
            valide: cpvOkCount !== 0 || cpvFound.cpvFoundCount > 0,
          })
        })
      }

      let tenderText = `catch;dataSourceId;categories;families;title;description;cpv code;cpv;words;buyerName;country;region;bidDeadline;publication\n`
      for (let tender of tenders) {
        let description = tender.description.substring(0, 1000)
        description = description.split(';').join(',')
        description = description.split('\r\n').join(' ').trim()
        description = description.split('\r').join(' ').trim()
        description = description.split('\n').join(' ').trim()
        // description = ''
        description = description.trim()
        let title = tender.title.substring(0, 1000)
        title = title.split(';').join(',')
        title = title.split('\n').join(' ').trim()
        title = title.trim()
        tenderText += `${tender.valide ? 'Y' : 'N'};${tender.dataSourceId};${tender.categories.join(',')};${tender.families.join(',')};${title};${description};${tender.cpvs};${tender.cpvDescriptions};${tender.words};${tender.buyerName};${tender.country};${tender.regions.join(',')};${tender.bidDeadlineDate};${tender.publicationDate}\n`
      }
      const tenderListLocation = path.join(config.WorkSpaceFolder, 'TenderList.csv')
      fs.writeFileSync(tenderListLocation, tenderText)

      resolve(cpvList)
    } catch (err) { reject(err) }
  })
}

exports.CpvListOld = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const util = require('util')
      const tool = require(process.cwd() + '/controllers/CtrlTool')
      const readFile = util.promisify(fs.readFile)
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()

      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Archive/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
        return
      }

      let cpvList = []
      for (let file of files) {
        const fileLocation = path.join(fileFolder, file)
        let fileData = await readFile(fileLocation, 'utf8')

        const xml2js = require('xml2js')
        var parser = new xml2js.Parser()
        const parseString = util.promisify(parser.parseString)
        let parseData = await parseString(fileData)

        parseData.notices.notice.forEach(notice => {
          // CPV list
          let cpvOkCount = 0
          let cpvsText = tool.getXmlJsonData(notice.cpvs)
          if (cpvsText) {
            let cpvsTextTemp = cpvsText.split(',')
            for (let i = 0; i < cpvsTextTemp.length; i++) {
              let code = parseInt(cpvsTextTemp[i], 10)
              let cpv = CpvList.find(a => a.code === code)
              let cpvfind = cpvList.find(a => a.cpv === code)
              if (!cpvfind) {
                cpvfind = {
                  cpv: code,
                  active: 'U',
                  count: 0
                }
                cpvList.push(cpvfind)
              }
              cpvfind.count++
              if (cpv) {
                if (cpv.active) {
                  cpvfind.active = 'Y'
                  cpvOkCount++
                } else {
                  cpvfind.active = 'N'
                }
              }
            }
          }
          if (cpvOkCount === 0) {
            return false
          }
        })
      }

      let cpvText = ''
      for (let cpv of cpvList) {
        cpvText += `${cpv.cpv};${cpv.active};${cpv.count}\n`
      }
      cpvText = cpvText
      const cpvListLocation = path.join(config.WorkSpaceFolder, 'CpvList.csv')
      fs.writeFileSync(cpvListLocation, cpvText)

      resolve(cpvList)
    } catch (err) { reject(err) }
  })
}

exports.ExportUrlFromFile = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
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
                    cpvs AS "cpvs", 
                    cpvDescriptions AS "cpvDescriptions", 
                    words AS "words", 
                    bidDeadlineDate AS "bidDeadlineDate", 
                    sourceUrl AS "sourceUrl", 
                    userId AS "userId",
                    fileSource AS "fileSource", 
                    algoliaId AS "algoliaId", 
                    status AS "status", 
                    creationDate AS "creationDate", 
                    updateDate AS "updateDate" 
        FROM        tenders 
        WHERE       status = 0 
      `
      let recordset = await BddTool.QueryExecBdd2(query)
      const tenders = []
      for (let record of recordset) {
        let tender = await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TenderFormat(record, CpvList)
        if (!tender) {
          continue
        }
        tenders.push(tender)
      }
      
      let domaines = []
      let tenderUrl = []
      for (let tender of tenders) {
        for (let url of tender.sourceUrls) {
          if (url.includes('bidsinfo.com')) {
            let toto = 1
          }
          if (!url.toLowerCase().startsWith('https://') && !url.toLowerCase().startsWith('http://')) {
            continue
          }
          let domaine = url.substring(url.indexOf('//') + 2)
          domaine = domaine.split('/')[0].trim()
          if (!domaine || domaine === '') {
            continue
          }
          if (domaines.includes(domaine)) {
            continue
          }
          domaines.push(domaine)
          let tenderNew = tender
          tenderNew.url = url
          tenderNew.urlDomaine = domaine
          tenderNew.urlType = ''
          tenderUrl.push(tenderNew)
          // https://www2.comprasnet.gov.br/siasgnet-irp/resumoIRP.do?method=iniciar&acessoPublico=1&irp.codigoIrp=277619
        }
      }

      let tenderText = `dataSourceId;title;buyerName;domaine;url;type;bidDeadline;publication\n`
      for (let tender of tenderUrl) {
        let title = tender.title.substring(0, 1000)
        title = title.split(';').join(',')
        title = title.split('\r\n').join(' ').trim()
        title = title.split('\n\r').join(' ').trim()
        title = title.split('\n').join(' ').trim()
        title = title.split('\r').join(' ').trim()
        title = title.trim()
        tenderText += `${tender.dataSourceId};${title};${tender.buyer.name};${tender.urlDomaine};${tender.url};${tender.urlType};${tender.bidDeadlineDate};${tender.publicationDate}\n`
      }
      const tenderListLocation = path.join(config.WorkSpaceFolder, 'TenderUrlList.csv')
      fs.writeFileSync(tenderListLocation, tenderText)

      resolve(domaines)
    } catch (err) { reject(err) }
  })
}

exports.importDgmarketAddUpdate = (importDgmarket) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let importDgmarketNew = await BddTool.RecordAddUpdate('importDgmarket', importDgmarket)
      resolve(importDgmarketNew)
    } catch (err) {
      reject(err)
    }
  })
}

exports.importDgmarkets = (filter, orderBy, limit, page, pageLimit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      SQL_CALC_FOUND_ROWS 
                    importDgmarketId AS "importDgmarketId",
                    dataSourceId AS "dataSourceId",
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
                    bidDeadlineDate AS "bidDeadlineDate",
                    sourceUrl AS "sourceUrl",
                    tenderId AS "tenderId",
                    mergeMethod AS "mergeMethod",
                    fileSource AS "fileSource",
                    exclusion AS "exclusion",
                    exclusionWord AS "exclusionWord",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate" 
        FROM        importDgmarket `
      let where = ''
      if (filter) {
        if (filter.fileSources && filter.fileSources.length) {
          if (where !== '') { where += 'AND ' }
          where += `importDgmarket.fileSource IN (${BddTool.ArrayStringFormat(filter.fileSources)}) \n`
        }
        if (filter.mergeMethods && filter.mergeMethods.length) {
          if (where !== '') { where += 'AND ' }
          where += `importDgmarket.mergeMethod IN (${BddTool.ArrayStringFormat(filter.mergeMethods)}) \n`
        }
        if (filter.tenderId !== null && filter.tenderId !== undefined) {
          if (where !== '') { where += 'AND ' }
          if (filter.tenderId === 0) {
            where += `(importDgmarket.tenderId = 0 OR importDgmarket.tenderId IS NULL) \n`
          } else {
            where += `importDgmarket.tenderId = ${BddTool.NumericFormater(filter.tenderId)} \n`
          }
        }
        if (filter.status !== null && filter.status !== undefined) {
          if (where !== '') { where += 'AND ' }
          where += `importDgmarket.status = ${BddTool.NumericFormater(filter.status)} \n`
        }
        if (filter.statuss && filter.statuss.length) {
          if (where !== '') { where += 'AND ' }
          where += `importDgmarket.status IN (${BddTool.ArrayNumericFormater(filter.statuss)}) \n`
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
      let importDgmarkets = []
      for (const record of recordset.results) {
        importDgmarkets.push({
          importDgmarketId: record.importDgmarketId,
          dataSourceId: record.dataSourceId,
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
          bidDeadlineDate: record.bidDeadlineDate,
          sourceUrl: record.sourceUrl,
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
        entries: importDgmarkets,
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
