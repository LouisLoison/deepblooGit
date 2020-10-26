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

exports.awsFileMove = (awsBucket, fileLocation, fileDestination) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      const fs = require('fs')
      
      AWS.config.update({
        accessKeyId: awsBucket,
        secretAccessKey: config.awsSecretAccessKey
      })
      const s3 = new AWS.S3()
    
      const params = {
        Bucket: config.awsBucket,
        Body : fs.createReadStream(fileLocation),
        Key : fileDestination
      }
    
    } catch (err) { reject(err) }
  })
}

exports.awsFileList = (awsBucket, fileLocation, fileDestination) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const AWS = require('aws-sdk')
      
      AWS.config.update({
        accessKeyId: awsBucket,
        secretAccessKey: config.awsSecretAccessKey
      })
      const s3 = new AWS.S3()
    
      const params = {
        Bucket: config.awsBucket,
        Delimiter: '/',
        Prefix: 's/5469b2f5b4292d22522e84e0/ms.files/',
      }
    
      s3.listObjects(params, (err, data) => {
        if(err) {
          throw err
        }
        console.log(data)
        resolve(data)
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
