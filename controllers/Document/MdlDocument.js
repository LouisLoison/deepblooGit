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
      const documents = await this.documentList({ tenderId })
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()

      const sourceUrls = tender.sourceUrl.split(',')
      for (const sourceUrl of sourceUrls) {
        try {
          let document = documents.find(a => a.sourceUrl === sourceUrl)
          if (document) {
            continue
          }
          const fileInfo = await this.fileDownload(sourceUrl)
          let text = ''
          if (fileInfo.filename.toLowerCase().endsWith('.pdf')) {
            text = await this.fileParsePdf(fileInfo.fileLocation)
          } else if (fileInfo.filename.toLowerCase().endsWith('.doc')) {
            text = await this.fileParseDoc(fileInfo.fileLocation)
          } else if (fileInfo.filename.toLowerCase().endsWith('.docx')) {
            text = await this.fileParseDocx(fileInfo.fileLocation)
          }
          const cpvs = await require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').DescriptionParseForCpv(text, '', '', null, CpvList)
          const exportAws = await this.fileExportAws(tenderId, fileInfo.fileLocation)
          const exportBox = await this.fileExportBox(tenderId, fileInfo.fileLocation, fileInfo.filename)
          await this.documentAddUpdate({
            documentId: document ? document.documentId : undefined,
            tenderId,
            cpvs: cpvs.cpvsText,
            filename: fileInfo.filename,
            size: fileInfo.size,
            sourceUrl,
            s3Url: exportAws.location,
            boxFolderId: exportBox.folderId,
            boxFileId: exportBox.fileId,
            status: 1,
            creationDate: new Date(),
            updateDate: new Date(),
          })
        } catch (err) {}
      }
      
      resolve()
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

exports.fileParsePdf = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const PdfReader = require("pdfreader").PdfReader;

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

exports.fileExportAws = (tenderId, fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const AWS = require('aws-sdk');
      const fs = require('fs');
      const path = require('path');
    
      AWS.config.update({
        accessKeyId: "AKIAI3MOVDQQCFHNPKLQ",
        secretAccessKey: "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"
      });
      const s3 = new AWS.S3();
    
      var params = {
        Bucket: 'tender-document-bucket',
        Body : fs.createReadStream(fileLocation),
        Key : `tenders/tender#${tenderId}/${path.basename(fileLocation)}`
      };
    
      s3.upload(params, function (err, data) {
        if (err) {
          reject(err)
        }
    
        //success
        if (data) {
          resolve({
            location: data.Location
          })
        }
      });
    
    } catch (err) { reject(err) }
  })
}

exports.fileExportBox = (tenderId, fileLocation, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const BoxSDK = require('box-node-sdk')
      const fs = require('fs')

      const sdk = new BoxSDK({
        clientID: 'u8xce5doashbnphpd53jsg4atfskouk7',
        clientSecret: 'floQE6DVCwUFYBKdilejjvEa7XhlZrIO',
      })
      const client = sdk.getBasicClient('iH7n3S17iL2gZtmmaQYy1qMIGHUJN21y')

      let file = null
      let folderId = '111153560320'
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
