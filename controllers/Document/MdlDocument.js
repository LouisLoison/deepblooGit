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
      let documentNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'document', document)
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

      // Remove document from Box
      try {
        await this.fileDeleteBox(document.boxFileId)
      } catch (err) {}

      // Remove document from AWS
      try {
        await this.fileDeleteAws(document.tenderId, document.filename)
      } catch (err) {}

      // Remove document from Deepbloo BDD
      let query = `DELETE FROM document WHERE documentId = ${BddTool.NumericFormater(documentId, BddEnvironnement, BddId)}`
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
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
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      for (var record of recordset) {
        documents.push({
          documentId: record.documentId,
          tenderId: record.tenderId,
          cpvs: record.cpvs,
          filename: record.filename,
          size: record.size,
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
                  documentMessage.message AS "message", 
                  documentMessage.status AS "status", 
                  documentMessage.creationDate AS "creationDate", 
                  documentMessage.updateDate AS "updateDate" `
      if (userData) {
        query += `,
                    user.username AS "userName",
                    user.email AS "userEmail",
                    user.hivebriteId AS "userHivebriteId",
                    user.photo AS "userPhoto" `
      }
      query += `
                    FROM      documentMessage 
      `
      if (userData) {
        query += `LEFT JOIN  user ON user.userId = documentMessage.userId \n`
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
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      for (var record of recordset) {
        documentMessages.push({
          documentMessageId: record.documentMessageId,
          documentId: record.documentId,
          organizationId: record.organizationId,
          userId: record.userId,
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
      let documentMessageNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'documentMessage', documentMessage)
      resolve(documentMessageNew)
    } catch (err) { reject(err) }
  })
}

exports.tenderFileImport = (tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tender = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(tenderId)
      if (!tender) {
        resolve()
      }
      const documentNews = []
      const documents = await this.documentList({ tenderId })
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()
      const textParses = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()

      const sourceUrls = tender.sourceUrl.split(',')
      for (const sourceUrl of sourceUrls) {
        try {
          let document = documents.find(a => a.sourceUrl === sourceUrl)
          if (document) {
            continue
          }
          const fileInfo = await this.fileDownload(sourceUrl)
          const tenderCriterions = await this.fileParse(fileInfo.fileLocation, fileInfo.filename, CpvList, textParses)
          const exportAws = await this.fileExportAws(tenderId, fileInfo.fileLocation)
          const exportBox = await this.fileExportBox(tenderId, fileInfo.fileLocation, fileInfo.filename)
          let documentNew = await this.documentAddUpdate({
            documentId: document ? document.documentId : undefined,
            tenderId,
            cpvs: tenderCriterions.cpvs.cpvsText,
            filename: fileInfo.filename,
            size: fileInfo.size,
            sourceUrl,
            s3Url: exportAws.location,
            boxFolderId: exportBox.folderId,
            boxFileId: exportBox.fileId,
            parseResult: JSON.stringify(tenderCriterions.textParseResults),
            status: 1,
            creationDate: new Date(),
            updateDate: new Date(),
          })
          const tenderCriterionNews = []
          for (const tenderCriterion of tenderCriterions) {
            tenderCriterion.documentId = documentNew.documentId
            tenderCriterion.tenderId = documentNew.tenderId
            const tenderCriterionNew = tenderCriterion
            tenderCriterionNews.push(tenderCriterionNew)
          }
          documentNew.tenderCriterions = tenderCriterionNews
          documentNews.push(documentNew)
        } catch (err) {}
      }
      
      resolve(documentNews)
    } catch (err) { reject(err) }
  })
}

exports.fileDownload = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const https = require('https')
      const fs = require('fs')
      const path = require('path')
  
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error('HTTP error ' + response.statusCode))
        }
  
        let filename = decodeURI(response.headers["content-disposition"])
        filename = filename.split('filename=')[1]
        const folderTemp = path.join(config.WorkSpaceFolder, '/Temp/')
        const fileLocation = path.join(folderTemp, filename)
        if (fs.existsSync(fileLocation)) {
          fs.unlinkSync(fileLocation)
        }
        let file = fs.createWriteStream(fileLocation)
        response.pipe(file)
  
        file.on('finish', function() {
          file.close()
          const stats = fs.statSync(fileLocation)
          resolve({
            filename,
            fileLocation,
            size: stats["size"],
          })
        })
      
        response.on('data', (d) => {
          process.stdout.write(d);
        })
      
      }).on('error', (err) => {
        reject(err)
      })
    } catch (err) { reject(err) }
  })
}

exports.fileParse = (fileLocation, filename, CpvList, textParses) => {
  return new Promise(async (resolve, reject) => {
    try {
      let text = ''
      if (filename.toLowerCase().endsWith('.pdf')) {
        text = await this.fileParsePdf(fileLocation)
      } else if (filename.toLowerCase().endsWith('.doc')) {
        text = await this.fileParseDoc(fileLocation)
      } else if (filename.toLowerCase().endsWith('.docx')) {
        text = await this.fileParseDocx(fileLocation)
      } else if (filename.toLowerCase().endsWith('.htm') || filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.php')) {
        text = await this.fileParseHtml(fileLocation)
      }
      const cpvs = await require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').DescriptionParseForCpv(text, '', '', null, CpvList)

      const textParseResults = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(text, textParses)

      resolve({
        cpvs,
        textParseResults,
      })
    } catch (err) { reject(err) }
  })
}

exports.fileParsePdf = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const PdfReader = require("pdfreader").PdfReader

      let text = ''
      new PdfReader().parseFileItems(fileLocation, (err, item) => {
        if (err) {
          reject(err)
        } else if (!item) {
          resolve(text)
        } else if (item.text) {
          text += item.text + '\n'
        }
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

exports.fileParseHtml = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const htmlToText = require('html-to-text')

      const htmlText = require(process.cwd() + '/controllers/CtrlTool').readFileSync(fileLocation)
      const text = htmlToText.fromString(htmlText, {
        wordwrap: 130
      })

      resolve(text)
    } catch (err) { reject(err) }
  })
}

exports.fileExportAws = (tenderId, fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      const fs = require('fs')
      const path = require('path')
    
      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      });
      const s3 = new AWS.S3()
    
      const params = {
        Bucket: 'tender-document-bucket',
        Body : fs.createReadStream(fileLocation),
        Key : `tenders/tender#${tenderId}/${path.basename(fileLocation)}`
      }

      if (
        fileLocation.toLowerCase().endsWith('.htm')
        || fileLocation.toLowerCase().endsWith('.html')
      ) {
        params.ContentType = "text/html"
      }

      s3.upload(params, (err, data) => {
        if (err) {
          reject(err)
        }
    
        //success
        if (data) {
          resolve({
            location: data.Location
          })
        }
      })
    
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
        Bucket: 'tender-document-bucket',
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

exports.fileExportBox = (tenderId, fileLocation, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BoxSDK = require('box-node-sdk')
      const fs = require('fs')

      const sdk = new BoxSDK({
        clientID: config.boxClientId,
        clientSecret: config.boxClientSecret,
      })
      const client = sdk.getBasicClient(config.boxToken)

      let file = null
      let folderId = config.boxFolderTendersId
      const folderName = `Tender#${tenderId}`
      let folderItems = await client.folders.getItems(folderId, {
        usemarker: 'false',
        fields: 'name',
        offset: 0,
        limit: 100000
      })
      const folder = folderItems.entries.find(a => a.name === folderName)
      if (folder) {
        folderId = folder.id
        folderItems = await client.folders.getItems(folderId, {
          usemarker: 'false',
          fields: 'name',
          offset: 0,
          limit: 100000
        })
        file = folderItems.entries.find(a => a.name === fileName)
      } else {
        const folderInfo = await client.folders.create(folderId, folderName)
        folderId = folderInfo.id
      }

      if (!file) {
        const stream = fs.createReadStream(fileLocation)
        const files = await client.files.uploadFile(folderId, fileName, stream)
        if (files && files.entries && files.entries.length) {
          file = files.entries[0]
        }
      }

      let thumbnail = null
      /*
      if (file) {
          thumbnail = await client.files.getThumbnail(file.id, {
            max_height: 320,
            max_width: 320,
            min_height: 32,
            min_width: 32
        })
      }
      */

      resolve({
        folderId,
        fileId: file ? file.id : null,
        thumbnail,
      })
    } catch (err) { reject(err) }
  })
}

exports.fileDeleteBox = (fileId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BoxSDK = require('box-node-sdk')
      const fs = require('fs')

      const sdk = new BoxSDK({
        clientID: config.boxClientId,
        clientSecret: config.boxClientSecret,
      })
      const client = sdk.getBasicClient(config.boxToken)

      await client.files.delete(fileId)

      resolve()
    } catch (err) { reject(err) }
  })
}
