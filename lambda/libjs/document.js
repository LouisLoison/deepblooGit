const https = require('https')
const http = require('http')
const BddTool = require('./db/BddTool')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const { v4: uuidv4 } = require('uuid')
const { AWS, documentsBucket } = require('./config')
const objectHash = require('object-hash')

const fileHash = (fileName) => {
  const data = fs.readFileSync(fileName)
  const hash = objectHash(data, { algorithm: 'sha256' })
  return hash
}


exports.documentAddUpdate = async (client, document) => {
  const documentNew = await BddTool.RecordAddUpdate('document', document, 'tenderuuid, sourceurl', client)
  return (documentNew)
}

exports.tenderFileImport = async (tenderUuid, sourceUrl, tenderId) => {
  const client = await BddTool.getClient()
  await BddTool.QueryExecPrepared(client, 'BEGIN;')

  const document = await this.documentAddUpdate(client, { tenderUuid, sourceUrl, tenderId })

  if (sourceUrl.includes('www2.dgmarket.com') && !sourceUrl.includes('secret=sdfsfs452Rfsdgbjsdb343RFGG')) {
    sourceUrl = sourceUrl + '?secret=sdfsfs452Rfsdgbjsdb343RFGG'
  }
  let result = {}
  if (!document.size) {
    try {
      const fileInfo = await this.fileDownload(sourceUrl)
      const {
        location: s3Url, objectName, contentType
      } = await this.fileExportAws(tenderUuid, fileInfo.fileLocation)

      document.contentHash = fileHash(fileInfo.fileLocation)
      document.size = fileInfo.size
      document.s3Url = s3Url
      document.bucketName = documentsBucket
      document.objectName = objectName
      document.contentType = contentType
      result = await this.documentAddUpdate(client, document)
    } catch (err) {
      client.release()
      // result = err
      throw new Error(err)
    }
  }
  await BddTool.QueryExecPrepared(client, 'COMMIT;');
  client.release()
  return { ...document, ...result }
}

exports.fileDownload = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      // File get http
      const fileGet = async (fileUrl) => {
        if (fileUrl.startsWith('http:')) {
          fileGetHttp(fileUrl)
        } else if (fileUrl.startsWith('https:')) {
          fileGetHttps(fileUrl)
        } else {
          reject(new Error('URL format not recognized : ' + fileUrl))
        }
      }

      // File get http
      const fileGetHttp = async (fileUrl) => {
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
        let filename = decodeURI(fileResponse.headers["content-disposition"])
        console.log(fileResponse.headers)
        filename = filename.split('filename=')[1]
        filename = filename.replace(/"/g, '')
        if (filename === "") { filename = 'unnamedFile' }
        const folderTemp = path.join(os.tmpdir(), uuidv4())
        fs.mkdirSync(folderTemp)
        const fileLocation = path.join(folderTemp, filename)
        if (fs.existsSync(fileLocation)) {
          fs.unlinkSync(fileLocation)
        }
        let file = fs.createWriteStream(fileLocation)
        fileResponse.pipe(file)

        /*
        fileResponse.on('data', (d) => {
          process.stdout.write(d)
        })
  */

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

const getContentType = (fileLocation) => {
  const [extension] = fileLocation.toLowerCase().split('.').slice(-1)
  let contentType = "unknown"
  if (extension === 'htm' || extension === 'html') {
    contentType = "text/html"
  } else if (extension === 'png') {
    contentType = "image/png"
  } else if (extension === 'jpg') {
    contentType = "image/jpeg"
  } else if (extension === 'pdf') {
    contentType = "application/pdf"
  } else if (extension === 'docx') {
    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  } else if (extension === 'doc') {
    contentType = "application/msword"
  } else if (extension === 'zip') {
    contentType = "application/zip"
  }
  return contentType
}

const awsFileGet = async (objectName) => {
  const s3 = new AWS.S3()
  const params = {
    Bucket: documentsBucket,
    Key: objectName
  }
  const folderTemp = path.join(os.tmpdir(), uuidv4())
  fs.mkdirSync(folderTemp)
  const fileLocation = path.join(folderTemp, path.basename(objectName))

  var file = fs.createWriteStream(fileLocation);
  await new Promise((resolve, reject) =>
    s3.getObject(params).createReadStream()
      .on('end', () => { return resolve(); })
      .on('error', (error) => { return reject(error); })
      .pipe(file)
  )
  return fileLocation
}

exports.awsFileAdd = (fileLocation, objectName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new AWS.S3()

      const params = {
        Bucket: documentsBucket,
        Body: fs.createReadStream(fileLocation),
        Key: objectName
      }
      const contentType = getContentType(fileLocation)
      if (contentType) { params.ContentType = contentType }
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err)
        } else if (data) {
          resolve({
            location: data.Location,
            contentType
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

      const objectName = `tenders/tender#${tenderId}/${path.basename(fileLocation)}`
      const res = await this.awsFileAdd(fileLocation, objectName)
      resolve({ ...res, objectName })
    } catch (err) { reject(err) }
  })
}

exports.fileDeleteAws = (tenderId, filename) => {
  return new Promise(async (resolve, reject) => {
    try {

      /*
       * AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      })
      */
      const s3 = new AWS.S3()

      var params = {
        Bucket: documentsBucket,
        Key: `tenders/tender#${tenderId}/${filename}`
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


exports.fileParsePdf = async (fileLocation, tenderId) => {

  // const text = await require(process.cwd() + '/controllers/CtrlTool').pdfGetText(fileLocation)

  // Convert PDF to images
  const imageDatas = await pdfToImages(fileLocation)

  // Put image on S3
  const pages = []
  for (const imageData of imageDatas) {
    const s3Location = `tenders/tender#${tenderId}/textParse/${path.basename(imageData.location)}`
    const location = await this.awsFileAdd(imageData.location, s3Location)
    // const textData = await this.textractAnalyzeDocument(s3Location)
    pages.push({
      s3Location,
      location: location.location,
      imgWidth: imageData.width,
      imgHeight: imageData.height,
      textData,
    })
  }

  return ({
    text,
    pages,
  })

}

exports.fileParseDoc = async (objectName) => {
  const fileLocation = awsFileGet(objectName)
  const WordExtractor = require("word-extractor");
  const extractor = new WordExtractor();
  const extracted = extractor.extract(fileLocation);
  const doc = await extracted
  return (doc.getBody())
}

exports.fileParseDocx = async (objectName) => {
  const fileLocation = awsFileGet(objectName)
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ path: fileLocation })
  return (result.value)
}

exports.fileParseHtml = (fileLocation,  ) => {
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

exports.fileParseImage = async (fileLocation, tenderId, exportAws) => {
  const imageSizeOf = require('image-size')

  const s3Location = `tenders/tender#${tenderId}/${path.basename(fileLocation)}`
  const textData = await this.textractAnalyzeDocument(s3Location)
  const imgSizeInfo = imageSizeOf(fileLocation)

  return ({
    text: '',
    pages: [{
      s3Location,
      location: exportAws.location,
      imgWidth: imgSizeInfo.width,
      imgHeight: imgSizeInfo.height,
      textData,
    }]
  })

}
