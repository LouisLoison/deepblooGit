const PromiseFtp = require('promise-ftp')
const fs = require('fs')
const path = require('path')

const ftpFileFolder = '/home/ftp/dgmarket'
const archiveFileFolder = '/home/archive/dgmarket'

const ftpConfig = {
  host: '34.230.223.174',
  user: 'deepbloo',
  password: process.env.DGMARKET_PASSWORD,
  protocol: 'ftp'
}

const FtpGet = async () => {

      // Get file list on FTP
      const files = await FtpList()
      const xmlFiles = files.filter(a => a.name.toLowerCase().startsWith('feed-') && a.name.toLowerCase().endsWith('.xml'))

      // Get file list on workspace folder
      const ftpFiles = fs.readdirSync(ftpFileFolder)
      const archiveFiles = fs.readdirSync(archiveFileFolder)
      const workspaceFiles = ftpFiles.concat(archiveFiles)

      let importFiles = []
      for (const file of xmlFiles) {
        if (workspaceFiles.includes(file.name)) {
          continue
        }
        importFiles.push(file)
        await FtpGetFile(file.name)
      }
      return importFiles
}

const FtpGetFile = (fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const ftp = new PromiseFtp()

      ftp.connect(ftpConfig)
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

const FtpList = () => {
  return new Promise((resolve, reject) => {
    try {
      const ftp = new PromiseFtp()

      let files = []
      ftp.connect(ftpConfig)
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


(async function() {
  let ftpGot = await FtpGet()
  console.log(ftpGot)
})()
