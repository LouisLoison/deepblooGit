exports.awsFileAdd = (awsBucket, fileLocation, fileDestination) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      const fs = require('fs')
      
      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      })
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

exports.awsFileList = (awsBucket, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      
      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      })
      const s3 = new AWS.S3()

      const params = {
        Bucket: awsBucket,
        Delimiter: '/',
        Prefix: location,
      }
    
      s3.listObjects(params, (err, data) => {
        if(err) {
          throw err
        }
        resolve(data.Contents)
      })
    } catch (err) { reject(err) }
  })
}

exports.awsFileGet = (awsBucket, fileKey, fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      const fs = require('fs')
      
      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      })
      const s3 = new AWS.S3()

      const params = {
        Bucket: awsBucket,
        Key: fileKey,
      }

      let readStream = s3.getObject(params).createReadStream()
      let writeStream = fs.createWriteStream(fileLocation)
      readStream.pipe(writeStream)
      resolve()
    } catch (err) { reject(err) }
  })
}

exports.awsFileMove = (awsBucket, fileKey, fileDestination) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      
      AWS.config.update({
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      })
      const s3 = new AWS.S3()
    
      await s3.copyObject({
        Bucket: awsBucket,
        CopySource: `/${awsBucket}/${fileKey}`,
        Key: fileDestination,
      }).promise()
  
      await s3.deleteObject({
        Bucket: awsBucket,
        Key: fileKey,
      }).promise()
    
      resolve()
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
