exports.document = (documentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let document = null
      if (documentId) {
        let filter = {
          documentId
        }
        let documents = await this.documentList(filter);
        if (documents && documents.length > 0) {
          document = documents[0]
        }
      }
      resolve(document)
    } catch (err) { reject(err) }
  })
}

exports.documentAddUpdate = (document) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let documentNew = await BddTool.RecordAddUpdate('document', document)
      resolve(documentNew)
    } catch (err) { reject(err) }
  })
}

exports.documentDelete = (documentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!documentId) {
        throw new Error("No available id !")
      }

      const document = await this.document(documentId)

      // Remove document from AWS
      try {
        await this.fileDeleteAws(document.tenderId, document.filename)
      } catch (err) {}

      try {
        await require(process.cwd() + '/controllers/TextParse/MdlTextParse').tenderCriterionDelete(null, documentId)
      } catch (err) {}

      // Remove document from Deepbloo BDD
      let query = `DELETE FROM document WHERE documentId = ${BddTool.NumericFormater(documentId, BddEnvironnement, BddId)}`
      await BddTool.QueryExecBdd2(query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.documentList = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get document list
      var documents = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    document.documentId AS "documentId", 
                  document.tenderId AS "tenderId", 
                  document.cpvs AS "cpvs", 
                  document.filename AS "filename", 
                  document.size AS "size", 
                  document.pageCount AS "pageCount", 
                  document.sourceUrl AS "sourceUrl", 
                  document.s3Url AS "s3Url", 
                  document.boxFolderId AS "boxFolderId", 
                  document.boxFileId AS "boxFileId", 
                  document.parseResult AS "parseResult", 
                  document.status AS "status", 
                  document.creationDate AS "creationDate", 
                  document.updateDate AS "updateDate" 
        FROM      document 
      `
      if (filter) {
        let where = ``
        if (filter.documentId) {
          if (where !== '') { where += 'AND ' }
          where += `document.documentId = ${BddTool.NumericFormater(filter.documentId, BddEnvironnement, BddId)} \n`
        }
        if (filter.tenderId) {
          if (where !== '') { where += 'AND ' }
          where += `document.tenderId = ${BddTool.NumericFormater(filter.tenderId, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      // query += '  ORDER BY document.creationDate DESC '
      let recordset = await BddTool.QueryExecBdd2(query)
      for (var record of recordset) {
        documents.push({
          documentId: record.documentId,
          tenderId: record.tenderId,
          cpvs: record.cpvs,
          filename: record.filename,
          size: record.size,
          pageCount: record.pageCount,
          sourceUrl: record.sourceUrl,
          s3Url: record.s3Url,
          boxFolderId: record.boxFolderId,
          boxFileId: record.boxFileId,
          parseResult: record.parseResult,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate,
        })
      }
      resolve(documents)
    } catch (err) {
      reject(err)
    }
  })
}

exports.documentMessageList = (filter, userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get documentMessage list
      var documentMessages = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    documentMessage.documentMessageId AS "documentMessageId", 
                  documentMessage.documentId AS "documentId", 
                  documentMessage.organizationId AS "organizationId", 
                  documentMessage.userId AS "userId", 
                  documentMessage.type AS "type", 
                  documentMessage.groupId AS "groupId", 
                  documentMessage.posX AS "posX", 
                  documentMessage.posY AS "posY", 
                  documentMessage.message AS "message", 
                  documentMessage.status AS "status", 
                  documentMessage.creationDate AS "creationDate", 
                  documentMessage.updateDate AS "updateDate" `
      if (userData) {
        query += `,
                    "user".username AS "userName",
                    "user".email AS "userEmail",
                    "user".hivebriteId AS "userHivebriteId",
                    "user".photo AS "userPhoto" `
      }
      query += `
                    FROM      documentMessage 
      `
      if (userData) {
        query += `LEFT JOIN  "user" ON "user".userId = documentMessage.userId \n`
      }
      if (filter) {
        let where = ``
        if (filter.documentMessageId) {
          if (where !== '') { where += 'AND ' }
          where += `documentMessage.documentMessageId = ${BddTool.NumericFormater(filter.documentMessageId, BddEnvironnement, BddId)} \n`
        }
        if (filter.documentId) {
          if (where !== '') { where += 'AND ' }
          where += `documentMessage.documentId = ${BddTool.NumericFormater(filter.documentId, BddEnvironnement, BddId)} \n`
        }
        if (filter.organizationId) {
          if (where !== '') { where += 'AND ' }
          where += `documentMessage.organizationId = ${BddTool.NumericFormater(filter.organizationId, BddEnvironnement, BddId)} \n`
        }
        if (filter.userId) {
          if (where !== '') { where += 'AND ' }
          where += `documentMessage.userId = ${BddTool.NumericFormater(filter.userId, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY documentMessage.creationDate DESC '
      let recordset = await BddTool.QueryExecBdd2(query)
      for (var record of recordset) {
        documentMessages.push({
          documentMessageId: record.documentMessageId,
          documentId: record.documentId,
          organizationId: record.organizationId,
          userId: record.userId,
          type: record.type,
          groupId: record.groupId,
          posX: record.posX,
          posY: record.posY,
          username: record.userName,
          userEmail: record.userEmail,
          userHivebriteId: record.userHivebriteId,
          userPhoto: record.userPhoto,
          message: record.message,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate,
        })
      }
      resolve(documentMessages)
    } catch (err) {
      reject(err)
    }
  })
}

exports.documentMessageAddUpdate = (documentMessage) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let documentMessageNew = await BddTool.RecordAddUpdate('documentMessage', documentMessage)
      resolve(documentMessageNew)
    } catch (err) { reject(err) }
  })
}

exports.documentMessageDelete = (documentMessageId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!documentMessageId) {
        throw new Error("No available id !")
      }

      // Remove documentMessage from Deepbloo BDD
      let query = `DELETE FROM documentMessage WHERE documentMessageId = ${BddTool.NumericFormater(documentMessageId, BddEnvironnement, BddId)}`
      await BddTool.QueryExecBdd2(query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.tenderFileImport = (tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      const tender = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(tenderId)
      if (!tender) {
        resolve()
      }
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()
      const textParses = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()

      for (const cpv of CpvList) {
        const cpvWords = []
        for (const cpvWord of cpv.cpvWords) {
          let isOk = true
          if (cpvWord.word.endsWith('S') || cpvWord.word.endsWith('X')) {
            if (
              cpvWords.find(a => a.word === cpvWord.word.slice(0, -1))
            ) {
              isOk = false
            }
          }
          if (isOk) {
            cpvWords.push(cpvWord)
          }
        }
        cpv.cpvWords = cpvWords
      }


      // Remove tenderCriterion of this tender
      let query = `DELETE FROM tenderCriterionCpv WHERE tenderId = ${BddTool.NumericFormater(tender.id, BddEnvironnement, BddId)} AND scope = 'DOCUMENT' `
      await BddTool.QueryExecBdd2(query)
      query = `DELETE FROM tenderCriterion WHERE tenderId = ${BddTool.NumericFormater(tender.id, BddEnvironnement, BddId)} AND scope = 'DOCUMENT' `
      await BddTool.QueryExecBdd2(query)

      const documentNews = []
      const documents = await this.documentList({ tenderId })

      const sourceUrls = tender.sourceUrl.split(',')
      for (let sourceUrl of sourceUrls) {
        try {
          if (sourceUrl.trim() === '') {
            continue
          }
          let document = documents.find(a => a.sourceUrl === sourceUrl)
          if (document) {
            continue
          }
          if (sourceUrl.includes('www2.tenders.com')  && !sourceUrl.includes('secret=sdfsfs452Rfsdgbjsdb343RFGG')) {
            sourceUrl = sourceUrl + '?secret=sdfsfs452Rfsdgbjsdb343RFGG'
          }
          const fileInfo = await this.fileDownload(sourceUrl)
          const exportAws = await this.fileExportAws(tenderId, fileInfo.fileLocation)
          const textParseResults = await this.fileParse(fileInfo.fileLocation, fileInfo.filename, CpvList, textParses, tenderId, exportAws)
          let documentNew = await this.documentAddUpdate({
            documentId: document ? document.documentId : undefined,
            tenderId,
            cpvs: textParseResults.cpvs ? textParseResults.cpvs.join(',') : null,
            filename: fileInfo.filename,
            size: fileInfo.size,
            pageCount: textParseResults.pages ? textParseResults.pages.length : 0,
            sourceUrl,
            s3Url: exportAws.location,
            parseResult: JSON.stringify(textParseResults),
            status: 1,
            creationDate: new Date(),
            updateDate: new Date(),
          })
          const tenderCriterionDocuments = []
          for (const tenderCriterion of textParseResults.tenderCriterions) {
            let tenderCriterionFind = tenderCriterionDocuments.find(a => 
              a.textParseId === tenderCriterion.textParseId
              && ((a.value.trim() === "" && a.value === tenderCriterion.value) || (a.value.trim() !== "" && a.value === tenderCriterion.value && a.word === tenderCriterion.word))
            )
            if (!tenderCriterionFind) {
              tenderCriterionFind = {
                tenderId: documentNew.tenderId,
                documentId: documentNew.documentId,
                textParseId: tenderCriterion.textParseId,
                value: tenderCriterion.value,
                word: tenderCriterion.word,
                findCount: 0,
                status: 1,
                scope: 'DOCUMENT',
              }
              tenderCriterionDocuments.push(tenderCriterionFind)
            }
            tenderCriterionFind.findCount = tenderCriterionFind.findCount + 1
          }
          const tenderCriterionDocumentNews = []
          for (const tenderCriterion of tenderCriterionDocuments) {
            const tenderCriterionNew = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').tenderCriterionAddUpdate(tenderCriterion)
            tenderCriterionDocumentNews.push(tenderCriterionNew)
          }
          documentNew.tenderCriterions = tenderCriterionDocumentNews
          documentNews.push(documentNew)
        } catch (err) {
          console.log(err)
        }
      }
      
      resolve(documentNews)
    } catch (err) { reject(err) }
  })
}

exports.fileDownload = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')

      // File get http
      const fileGet = async (fileUrl) => {
        if (url.startsWith('http:')) {
          fileGetHttp(url)
        } else if (url.startsWith('https:')) {
          fileGetHttps(url)
        } else {
          reject(new Error('URL format not recognize : ' + url))
        }
      }

      // File get http
      const fileGetHttp = async (fileUrl) => {
        const http = require('http')
        http.get(fileUrl, (response) => {
          if (response.statusCode === 302 && response.headers && response.headers.location) {
            fileGet(response.headers.location)
            return
          }
          if (response.statusCode !== 200) {
            reject(new Error('HTTP error ' + response.statusCode))
          }
          fileDownload(response)
        }).on('error', (err) => {
          reject(err)
        })
      }

      // File get https
      const fileGetHttps = async (fileUrl) => {
        const https = require('https')
        https.get(fileUrl, (response) => {
          if (response.statusCode === 302 && response.headers && response.headers.location) {
            fileGet(response.headers.location)
            return
          }
          if (response.statusCode !== 200) {
            reject(new Error('HTTP error ' + response.statusCode))
          }
          fileDownload(response)
        }).on('error', (err) => {
          reject(err)
        })
      }

      // File download
      const fileDownload = async (fileResponse) => {
        const fs = require('fs-extra')
        const path = require('path')
        let filename = decodeURI(fileResponse.headers["content-disposition"])
        filename = filename.split('filename=')[1]
        filename = filename.replace(/"/g, '')
        const folderTemp = path.join(config.WorkSpaceFolder, '/Temp/')
        const fileLocation = path.join(folderTemp, filename)
        if (fs.existsSync(fileLocation)) {
          fs.unlinkSync(fileLocation)
        }
        let file = fs.createWriteStream(fileLocation)
        fileResponse.pipe(file)

        fileResponse.on('data', (d) => {
          process.stdout.write(d)
        })

        file.on('error', (err) => {
          reject(err)
        })
  
        file.on('finish', () => {
          file.close()
          const stats = fs.statSync(fileLocation)
          resolve({
            filename,
            fileLocation,
            size: stats["size"],
          })
        })
      }

      fileGet(url)
    } catch (err) { reject(err) }
  })
}

exports.fileParse = (fileLocation, filename, CpvList, textParses, tenderId, exportAws) => {
  return new Promise(async (resolve, reject) => {
    try {
      let text = null
      let textData = null
      if (filename.toLowerCase().endsWith('.pdf')) {
        textData = await this.fileParsePdf(fileLocation, tenderId)
      } else if (filename.toLowerCase().endsWith('.doc')) {
        text = await this.fileParseDoc(fileLocation)
      } else if (filename.toLowerCase().endsWith('.docx')) {
        text = await this.fileParseDocx(fileLocation)
      } else if (filename.toLowerCase().endsWith('.htm') || filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.php')) {
        textData = await this.fileParseHtml(fileLocation, tenderId)
      } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.png')) {
        textData = await this.fileParseImage(fileLocation, tenderId, exportAws)
      }
      let cpvs = []
      let tenderCriterions = []
      const pages = []
      if (text) {
        const page ={
          location: null,
          cpvs: [],
          tenderCriterions: []
        }

        const tenderCriterionCpvfounds = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(text, CpvList)
        if (tenderCriterionCpvfounds) {
          for (const tenderCriterionCpv of tenderCriterionCpvfounds) {
            const cpvFind = CpvList.find(a => a.cpvId === tenderCriterionCpv.cpvId)
            if (cpvFind) {
              const cpv = {
                tenderCriterionCpv,
                code: cpvFind.code,
                boundingBox: {
                  left: line.Geometry.BoundingBox.Left,
                  top: line.Geometry.BoundingBox.Top,
                  width: line.Geometry.BoundingBox.Width,
                  height: line.Geometry.BoundingBox.Height,
                },
              }
              page.cpvs.push(cpv)
              cpvs.push(cpv)
            }
          }
        }

        page.tenderCriterions = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(text, textParses, 'DOCUMENT')
        pages.push(page)
        tenderCriterions = page.tenderCriterions
      } else if (textData) {
        if (textData.pages) {
          for (const pageData of textData.pages) {
            const page ={
              location: pageData.location,
              imgWidth: pageData.imgWidth,
              imgHeight: pageData.imgHeight,
              cpvs: [],
              tenderCriterions: []
            }
            if (pageData.textData && pageData.textData.Blocks) {
              const lines = pageData.textData.Blocks.filter(a => a.BlockType === 'LINE')
              for (const line of lines) {
                const tenderCriterionCpvfounds = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(line.Text, CpvList)
                if (tenderCriterionCpvfounds) {
                  for (const tenderCriterionCpv of tenderCriterionCpvfounds) {
                    const cpvFind = CpvList.find(a => a.cpvId === tenderCriterionCpv.cpvId)
                    if (cpvFind) {
                      const cpv = {
                        tenderCriterionCpv,
                        code: cpvFind.code,
                        boundingBox: {
                          left: line.Geometry.BoundingBox.Left,
                          top: line.Geometry.BoundingBox.Top,
                          width: line.Geometry.BoundingBox.Width,
                          height: line.Geometry.BoundingBox.Height,
                        },
                      }
                      page.cpvs.push(cpv)
                      cpvs.push(cpv)
                    }
                  }
                }
                const tenderCriterionNews = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(line.Text, textParses, 'DOCUMENT')
                if (tenderCriterionNews) {
                  for (const tenderCriterionNew of tenderCriterionNews) {
                    tenderCriterionNew.boundingBox = {
                      left: line.Geometry.BoundingBox.Left,
                      top: line.Geometry.BoundingBox.Top,
                      width: line.Geometry.BoundingBox.Width,
                      height: line.Geometry.BoundingBox.Height,
                    }
                    page.tenderCriterions.push(tenderCriterionNew)
                    tenderCriterions.push(tenderCriterionNew)
                  }
                }
              }
            }
            pages.push(page)
          }
        }
        if (textData.text) {
          const tenderCriterionCpvfounds = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(textData.text, CpvList)
          if (tenderCriterionCpvfounds) {
            for (const tenderCriterionCpv of tenderCriterionCpvfounds) {
              const cpvFind = CpvList.find(a => a.cpvId === tenderCriterionCpv.cpvId)
              if (cpvFind) {
                const cpv = {
                  tenderCriterionCpv,
                  code: cpvFind.code,
                }
                cpvs.push(cpv)
              }
            }
          }
          const tenderCriterionNews = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(textData.text, textParses, 'DOCUMENT')
          for (const tenderCriterionNew of tenderCriterionNews) {
            const tenderCriterionFind = tenderCriterions.find(a => a.textParseId === tenderCriterionNew.textParseId)
            if (!tenderCriterionFind) {
              tenderCriterions.push(tenderCriterionNew)
            }
          }
        }
      }

      resolve({
        cpvs,
        tenderCriterions,
        pages,
      })
    } catch (err) { reject(err) }
  })
}

exports.fileParsePdf = (fileLocation, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const path = require('path')
      const text = await require(process.cwd() + '/controllers/CtrlTool').pdfGetText(fileLocation)

      // Convert PDF to images
      const imageDatas = await require(process.cwd() + '/controllers/CtrlTool').pdfToImages(fileLocation)

      // Put image on S3
      const pages = []
      for (const imageData of imageDatas) {
        const s3Location = `tenders/tender#${tenderId}/textParse/${path.basename(imageData.location)}`
        const location = await this.awsFileAdd(imageData.location, s3Location)
        const textData = await this.textractAnalyzeDocument(s3Location)
        pages.push({
          s3Location,
          location: location.location,
          imgWidth: imageData.width,
          imgHeight: imageData.height,
          textData,
        })
      }

      resolve({
        text,
        pages,
      })
    } catch (err) { reject(err) }
  })
}

exports.fileParseDoc = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const WordExtractor = require("word-extractor");
      const extractor = new WordExtractor();
      const extracted = extractor.extract(fileLocation);
      const doc = await extracted
      resolve(doc.getBody())
    } catch (err) { reject(err) }
  })
}

exports.fileParseDocx = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({path: fileLocation})
      resolve(result.value)
    } catch (err) { reject(err) }
  })
}

exports.fileParseHtml = (fileLocation, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const nodeHtmlToImage = require('node-html-to-image')
      const imageSizeOf = require('image-size')
      const htmlToText = require('html-to-text')

      const htmlText = require(process.cwd() + '/controllers/CtrlTool').readFileSync(fileLocation)
      const text = htmlToText.fromString(htmlText, {
        wordwrap: 130
      })

      const folderTemp = path.join(config.WorkSpaceFolder, '/Temp/')
      let filename = path.basename(fileLocation)
      filename = `${filename.split('.')[0]}.png`
      const imageLocation = path.join(folderTemp, filename)
      if (fs.existsSync(imageLocation)) {
        fs.unlinkSync(imageLocation)
      }

      // Convert HTML to image
      await nodeHtmlToImage({
        output: imageLocation,
        puppeteerArgs: { defaultViewport: { width: 2000, height: 2000 } },
        html: htmlText,
      })

      // Put image on S3
      const s3Location = `tenders/tender#${tenderId}/textParse/${filename}`
      const location = await this.awsFileAdd(imageLocation, s3Location)
      const textData = await this.textractAnalyzeDocument(s3Location)
      const imgSizeInfo = imageSizeOf(imageLocation)

      resolve({
        text,
        pages: [{
          s3Location,
          location: location.location,
          imgWidth: imgSizeInfo.width,
          imgHeight: imgSizeInfo.height,
          textData,
        }]
      })
    } catch (err) { reject(err) }
  })
}

exports.textractAnalyzeDocument = (awsLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')

      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      });
      AWS.config.region = "eu-west-1";
      const textract = new AWS.Textract();

      var params = {
        Document: {
          S3Object: {
            Bucket: config.awsBucket,
            Name: awsLocation
          }
        },
        FeatureTypes: ['FORMS']
      }
      textract.analyzeDocument(params, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    } catch (err) { reject(err) }
  })
}

exports.fileParseImage = (fileLocation, tenderId, exportAws) => {
  return new Promise(async (resolve, reject) => {
    try {
      const path = require('path')
      const imageSizeOf = require('image-size')

      const s3Location = `tenders/tender#${tenderId}/${path.basename(fileLocation)}`
      const textData = await this.textractAnalyzeDocument(s3Location)
      const imgSizeInfo = imageSizeOf(fileLocation)

      resolve({
        text: '',
        pages: [{
          s3Location,
          location: exportAws.location,
          imgWidth: imgSizeInfo.width,
          imgHeight: imgSizeInfo.height,
          textData,
        }]
      })
    } catch (err) { reject(err) }
  })
}

exports.awsFileAdd = (fileLocation, fileDestination) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      const fs = require('fs')
      
      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      });
      const s3 = new AWS.S3()
    
      const params = {
        Bucket: config.awsBucket,
        Body : fs.createReadStream(fileLocation),
        Key : fileDestination
      }

      if (
        fileLocation.toLowerCase().endsWith('.htm')
        || fileLocation.toLowerCase().endsWith('.html')
      ) {
        params.ContentType = "text/html"
      } else if (fileLocation.toLowerCase().endsWith('.png')) {
        params.ContentType = "image/png"
      } else if (fileLocation.toLowerCase().endsWith('.jpg')) {
        params.ContentType = "image/jpeg"
      } else if (fileLocation.toLowerCase().endsWith('.pdf')) {
        params.ContentType = "application/pdf"
      }

      s3.upload(params, (err, data) => {
        if (err) {
          reject(err)
        } else if (data) {
          resolve({
            location: data.Location
          })
        }
      })
    
    } catch (err) { reject(err) }
  })
}

exports.fileExportAws = (tenderId, fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const path = require('path')
      
      const fileDestination = `tenders/tender#${tenderId}/${path.basename(fileLocation)}`
      const location = await this.awsFileAdd(fileLocation, fileDestination)
      resolve(location)
    } catch (err) { reject(err) }
  })
}

exports.fileDeleteAws = (tenderId, filename) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
    
      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      })
      const s3 = new AWS.S3()
    
      var params = {
        Bucket: config.awsBucket,
        Key : `tenders/tender#${tenderId}/${filename}`
      }
    
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err)
        }
    
        //success
        if (data) {
          resolve()
        }
      })
    
    } catch (err) { reject(err) }
  })
}
