exports.BddImport = () => {
  return new Promise(async (resolve, reject) => {
    let tendersCurrent = null
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      
      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'Ftp/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
        return
      }
      const fileLocation = path.join(fileFolder, files[0])

      // Get tenders
      const fileParseData = await this.FileParse(fileLocation)
      const tenders = fileParseData.tenders

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      for (let tender of tenders) {
        tendersCurrent = tender
        let dgmarket = tender
        dgmarket.status = 0
        dgmarket.updateDate = new Date()

        // Search for internal id
        let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, `
          SELECT     id AS "id"
          FROM       dgmarket 
          WHERE      dgmarketId = ${BddTool.NumericFormater(tender.dgmarketId, BddEnvironnement, BddId)} 
        `)
        for (let record of recordset) {
          dgmarket.id = record.id
          dgmarket.creationDate = new Date()
        }

        await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'dgmarket', dgmarket)
      }

      // Move file to archive folder
      const fileSource = path.parse(fileLocation).base
      const fileLocationArchive = path.join(config.WorkSpaceFolder, 'Archive/', fileSource)
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
      const ftpFileFolder = path.join(config.WorkSpaceFolder, 'Ftp/')
      const ftpFiles = fs.readdirSync(ftpFileFolder)
      const archiveFileFolder = path.join(config.WorkSpaceFolder, 'Archive/')
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

      const ftpFileFolder = path.join(config.WorkSpaceFolder, 'Ftp/')
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

      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      let tenderCount = 0
      let tenderOkCount = 0
      let tenderFoundCount = 0
      let tenders = []
      parseData.notices.notice.forEach(notice => {
        tenderCount++

        // check biddeadline
        let dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - 15)
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

        // HTML format
        const descriptionLowerCase = description.toLowerCase()
        if (!descriptionLowerCase.includes("<br") || !descriptionLowerCase.includes("<table") || !descriptionLowerCase.includes("<div")) {
          description = description.replace(/\r/gm, '<br>')
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
            if (cpv) {
              if (cpv.active) {
                cpvOkCount++
              }
            }
          }
        }
        // Search by key words
        let cpvFound = this.DescriptionParseForCpv(description, cpvsText, cpvDescriptionsText)
        let words = cpvFound.words
        cpvsText = cpvFound.cpvsText
        cpvDescriptionsText = cpvFound.cpvDescriptionsText
        if (cpvOkCount > 0) {
          tenderOkCount++
        } else if (cpvFound.cpvFoundCount > 0) {
          tenderFoundCount++
        }
        if (cpvOkCount === 0 && cpvFound.cpvFoundCount === 0) {
          return false
        }

        tenders.push({
          dgmarketId: parseInt(tool.getXmlJsonData(notice.id), 10),
          procurementId: tool.getXmlJsonData(notice.procurementId).substring(0, 90),
          title: tool.getXmlJsonData(notice.noticeTitle).substring(0, 450),
          lang: lang,
          description: description,
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
          cpvs: cpvsText,
          cpvDescriptions: cpvDescriptionsText,
          words: words,
          bidDeadlineDate: tool.getXmlJsonData(notice.bidDeadlineDate),
          sourceUrl: tool.getXmlJsonData(notice.sourceUrl).substring(0, 1900),
          termDate: termDate,
          fileSource: fileSource
        })
      })

      resolve({
        tenderCount,
        tenderOkCount,
        tenderFoundCount,
        tenders,
      })
    } catch (err) { reject(err) }
  })
}

exports.DescriptionParseForCpv = (description, cpvsText, cpvDescriptionsText) => {
  const CategoriesList = require(process.cwd() + '/public/constants/categories.json')

  let cpvs = []
  let words = []
  let cpvFoundCount = 0
  if (!cpvsText) {
    cpvsText = ''
  }
  for (let category of CategoriesList) {
    if (!category.cpv) {
      continue
    }

    // If category already in the tender then past
    let cpvsTextTemp = cpvsText.split(',')
    let cpvFound = false
    for (let i = 0; i < cpvsTextTemp.length; i++) {
      let code = parseInt(cpvsTextTemp[i], 10)
      if (category.cpv === code) {
        cpvFound = true
        break
      }
    }
    if (cpvFound) {
      continue
    }

    if (category.words) {
      for (let word of category.words) {
        let regEx = new RegExp("\\b" + word + "\\b", 'gi');
        if (description.match(regEx)) {
          if (!cpvs.includes(category.cpv)) {
            cpvs.push(category.cpv)
            cpvFoundCount++
            if (cpvsText !== '') {
              cpvsText += ','
            }
            cpvsText += category.cpv
            if (cpvDescriptionsText !== '') {
              cpvDescriptionsText += ','
            }
            cpvDescriptionsText += category.cpvText
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
    cpvDescriptionsText: cpvDescriptionsText,
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

      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'Archive/')
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

        const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

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
          let cpvFound = this.DescriptionParseForCpv(description, cpvsText, cpvDescriptionsText)
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
            dgmarketId: parseInt(tool.getXmlJsonData(notice.id), 10),
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

      let tenderText = `catch;dgmarketId;categories;families;title;description;cpv code;cpv;words;buyerName;country;region;bidDeadline;publication\n`
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
        tenderText += `${tender.valide ? 'Y' : 'N'};${tender.dgmarketId};${tender.categories.join(',')};${tender.families.join(',')};${title};${description};${tender.cpvs};${tender.cpvDescriptions};${tender.words};${tender.buyerName};${tender.country};${tender.regions.join(',')};${tender.bidDeadlineDate};${tender.publicationDate}\n`
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

      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'Archive/')
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

        const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

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
                    userId AS "userId",
                    fileSource AS "fileSource", 
                    algoliaId AS "algoliaId", 
                    status AS "status", 
                    creationDate AS "creationDate", 
                    updateDate AS "updateDate" 
        FROM        dgmarket 
        WHERE       status = 0 
      `
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      const tenders = []
      for (let record of recordset) {
        let tender = await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TenderFormat(record)
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

      let tenderText = `dgmarketId;title;buyerName;domaine;url;type;bidDeadline;publication\n`
      for (let tender of tenderUrl) {
        let title = tender.title.substring(0, 1000)
        title = title.split(';').join(',')
        title = title.split('\r\n').join(' ').trim()
        title = title.split('\n\r').join(' ').trim()
        title = title.split('\n').join(' ').trim()
        title = title.split('\r').join(' ').trim()
        title = title.trim()
        tenderText += `${tender.dgmarketId};${title};${tender.buyer.name};${tender.urlDomaine};${tender.url};${tender.urlType};${tender.bidDeadlineDate};${tender.publicationDate}\n`
      }
      const tenderListLocation = path.join(config.WorkSpaceFolder, 'TenderUrlList.csv')
      fs.writeFileSync(tenderListLocation, tenderText)

      resolve(domaines)
    } catch (err) { reject(err) }
  })
}