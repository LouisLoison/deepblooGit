const https = require('https')
const http = require('http')
const BddTool = require('./db/BddTool')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const { v4: uuidv4 } = require('uuid')
const { AWS, documentsBucket } = require('./config')
const crypto = require('crypto');

const fileHash = (fileName) => {
  const data = fs.readFileSync(fileName);
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}


exports.documentAddUpdate = async (document) => {
  const [ documentNew ] = await BddTool.RecordAddUpdate('document', document, 'tenderuuid, sourceurl')
  return(documentNew)
}

exports.tenderFileImport = async (tenderUuid, sourceUrl) => {
  const document = await this.documentAddUpdate({ tenderUuid, sourceUrl })

  if (sourceUrl.includes('www2.dgmarket.com')  && !sourceUrl.includes('secret=sdfsfs452Rfsdgbjsdb343RFGG')) {
    sourceUrl = sourceUrl + '?secret=sdfsfs452Rfsdgbjsdb343RFGG'
  }
  const fileInfo = await this.fileDownload(sourceUrl)
  const { location: s3Url } = await this.fileExportAws(tenderUuid, fileInfo.fileLocation)

  document.contentHash = fileHash(fileInfo.fileLocation)
  document.size = fileInfo.size
  document.s3Url = s3Url
  await this.documentAddUpdate(document)

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
        filename = filename.split('filename=')[1]
        filename = filename.replace(/"/g, '')
        const folderTemp = path.join(os.tmpdir(), uuidv4())
        fs.mkdirSync(folderTemp)
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

exports.awsFileAdd = (fileLocation, fileDestination) => {
  return new Promise(async (resolve, reject) => {
    try {

      const s3 = new AWS.S3()

      const params = {
        Bucket: documentsBucket,
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
