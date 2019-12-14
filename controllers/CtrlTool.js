exports.countrysFromRegions = (regions) => {
  let countrys = []
  try {
    const RegionList = require(process.cwd() + '/public/constants/regions.json')
    if (regions && regions.trim() !== '') {
      for (const region of regions.split(',')) {
        let regionLabel = region.trim()
        if (regionLabel.toLowerCase() === 'worldwide') {
          return null
        }
        const regionLabel1 = regionLabel.trim().split('-')[0].trim()
        const regionFind = RegionList.find(a => a.label.toLowerCase() === regionLabel1.toLowerCase())
        if (regionFind) {
          let regionLabel2 = ''
          if (regionLabel.includes('-')) {
            regionLabel2 = regionLabel.trim().split('-')[1].trim()
          }
          if (regionLabel2.toLowerCase() === 'all' || regionLabel2.trim() === ''){
            if (regionFind.countrys) {
              countrys = countrys.concat(regionFind.countrys)
            }
            if (regionFind.regions) {
              for (const regionSub of regionFind.regions) {
                if (regionSub.countrys) {
                  countrys = countrys.concat(regionSub.countrys)
                }
              }
            }
          } else {
            if (regionFind.regions) {
              const regionSubFind = regionFind.regions.find(a => a.label.toLowerCase() === regionLabel2.toLowerCase())
              if (regionSubFind.countrys) {
                countrys = countrys.concat(regionSubFind.countrys)
              }
            }
          }
        }
      }
    }
  } catch (err) { reject(err) }
  return countrys
}

exports.regionFromCountry = (country) => {
  let regionInfo = {
    region: null,
    regionSub: null,
  }
  try {
    const RegionList = require(process.cwd() + '/public/constants/regions.json')
    for (const region of RegionList) {
      if (region.countrys && region.countrys.find(a => a.toLowerCase() === country.toLowerCase())) {
        regionInfo.region = region.label
      }
      if (region.regions) {
        for (const regionSub of region.regions) {
          if (regionSub.countrys && regionSub.countrys.find(a => a.toLowerCase() === country.toLowerCase())) {
            regionInfo.region = region.label
            regionInfo.regionSub = regionSub.label
          }
        }
      }
    }
  } catch (err) { reject(err) }
  return regionInfo
}

exports.sendMail = (subject, html, text, to, from) => {
  return new Promise((resolve, reject) => {
    const nodeMailer = require('nodemailer')
    const transporter = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,  // true for 465 port, false for other ports
      auth: {
        user: 'alexandre@deepbloo.com',
        pass: 'fuegofuego'
      },
      tls: {
        rejectUnauthorized: false
      }
    })
    /*
    const transporter = nodeMailer.createTransport({
      host: 'email-smtp.eu-west-1.amazonaws.com',
      port: 465,
      secure: true,  // true for 465 port, false for other ports
      auth: {
        user: 'AKIAZXRLCF3CBWZKCSA2',
        pass: 'BCtgQx4OAwGFeTV/gK05RpdDPakWT9YObgCEnlqdFP5a'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    */
    /*
    const transporter = nodeMailer.createTransport({
      host: 'smtp.ionos.fr',
      port: 465,
      secure: true,  // true for 465 port, false for other ports
      auth: {
        user: 'j.cazaux@arread.fr',
        pass: 'ArreadCazaux'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    */
    if (!from) {
      from = '"Deepbloo" <info@deepbloo.com>'
    }
    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve()
      }
    });
  })
}

exports.getXmlJsonData = (data) => {
    if (data && data.length > 0) {
        if (data[0]._) {
            return data[0]._
        } else {
            return data[0]
        }
    }
    return ''
}

exports.ArchiveFile = (filePath, archivePath) => {
  return new Promise((resolve, reject) => {
    const fs = require('fs')
    const path = require('path')
    const moment = require('moment')

    // Liste des fichiers du rep
    if (!fs.existsSync(archivePath)) { fs.mkdirSync(archivePath) }
    fs.readdirSync(filePath).forEach(file => {
        let fileLocation = path.join(filePath, file)
        let fileStat = fs.statSync(fileLocation)
        if (fileStat.isDirectory()) { return }
        let fileDays = moment().diff(moment(fileStat.mtime), 'days')
        if (fileDays > 60) {
            let year = fileStat.mtime.getUTCFullYear()
            let yearPath = path.join(archivePath, `${year}`)
            if (!fs.existsSync(yearPath)) { fs.mkdirSync(yearPath) }
            let month = fileStat.mtime.getUTCMonth() + 1
            let monthPath = path.join(yearPath, `${month}`)
            if (!fs.existsSync(monthPath)) { fs.mkdirSync(monthPath) }
            let day = fileStat.mtime.getUTCDate()
            let dayPath = path.join(monthPath, `${day}`)
            if (!fs.existsSync(dayPath)) { fs.mkdirSync(dayPath) }
            dayPath = dayPath
            let fileLocationNew = path.join(dayPath, file)
            require(process.cwd() + '/controllers/CtrlTool').renameSync(fileLocation, fileLocationNew)
        }
    })
    resolve(true)
  })
}

exports.ArchiveFile = (filePath, archivePath) => {
    return new Promise((resolve, reject) => {
        const fs = require('fs')
        const path = require('path')
        const moment = require('moment')

        // Liste des fichiers du rep
        if (!fs.existsSync(archivePath)) { fs.mkdirSync(archivePath) }
        fs.readdirSync(filePath).forEach(file => {
            let fileLocation = path.join(filePath, file)
            let fileStat = fs.statSync(fileLocation)
            if (fileStat.isDirectory()) { return }
            let fileDays = moment().diff(moment(fileStat.mtime), 'days')
            if (fileDays > 60) {
                let year = fileStat.mtime.getUTCFullYear()
                let yearPath = path.join(archivePath, `${year}`)
                if (!fs.existsSync(yearPath)) { fs.mkdirSync(yearPath) }
                let month = fileStat.mtime.getUTCMonth() + 1
                let monthPath = path.join(yearPath, `${month}`)
                if (!fs.existsSync(monthPath)) { fs.mkdirSync(monthPath) }
                let day = fileStat.mtime.getUTCDate()
                let dayPath = path.join(monthPath, `${day}`)
                if (!fs.existsSync(dayPath)) { fs.mkdirSync(dayPath) }
                dayPath = dayPath
                let fileLocationNew = path.join(dayPath, file)
                require(process.cwd() + '/controllers/CtrlTool').renameSync(fileLocation, fileLocationNew)
            }
        })
        resolve(true)
    })
}

exports.ArchiveFromFolder = (Folder, Sequenceur) => {
    return new Promise(async (resolve, reject) => {
        const Config = require(process.cwd() + '/config')
        const fs = require('fs-extra')
        const path = require('path')
        const zipdir = require('zip-dir')

        if (!fs.existsSync(Folder)) {
            reject(new Error(`Unknow folder : ${Folder}`))
            return
        }

        // Créer download
        var DownloadFolder = path.join(Config.WorkSpaceFolder, `/Download/`)
        if (!fs.existsSync(DownloadFolder)) { fs.mkdirSync(DownloadFolder) }

        // Créer download/Sequenceur/
        var JobFolder1 = path.join(DownloadFolder, `/${Sequenceur}/`)
        if (fs.existsSync(JobFolder1)) { fs.removeSync(JobFolder1) }
        fs.mkdirSync(JobFolder1)
        var JobFolder2 = path.join(JobFolder1, `/${Sequenceur}/`)
        fs.mkdirSync(JobFolder2)
    
        // Copier les sources dans download/Sequenceur/
        await fs.copy(Folder, JobFolder2)

        // Faire le zip dans download/
        let JobArchive = `${Sequenceur}.zip`
        let JobArchiveLocation = path.join(DownloadFolder, JobArchive)
        if (fs.existsSync(JobArchiveLocation)) { fs.removeSync(JobArchiveLocation) }
        zipdir(JobFolder1, { saveTo: JobArchiveLocation }, (err, buffer) => {
            if (err) {
                reject(err)
                return
            }
            // Supprimer le rep download/Sequenceur/
            fs.remove(JobFolder1, (err) => {
                if(err) { reject(err) }
                else { resolve({JobArchive: JobArchive, JobArchiveLocation: JobArchiveLocation}) }
            })
        })
    })
}

exports.ArchiveVersionSync = (FileLocation) => {
    var JobVersion = ''
    try {
        var AdmZip = require('adm-zip')
        var zip = new AdmZip(FileLocation)
        var zipEntries = zip.getEntries()
        zipEntries.forEach((zipEntry) => {
            if (zipEntry.entryName.endsWith("jobInfo.properties")) {
                var LineList = zip.readAsText(zipEntry.entryName).split('\n')
                for(var LineNum = 0; LineNum < LineList.length; LineNum++){
                    var Line = LineList[LineNum].trim()
                    var InfoType = Line.split('=')[0].trim()
                    if (InfoType === "jobVersion") { JobVersion = Line.split('=')[1].trim() }
                }
            }
        })
    } catch (err) {}
    return JobVersion
}

exports.onError = (err, res) => {
    res.end(JSON.stringify({ success: false, Error: err.message }, null, 3))
}

var fileSearch = (dir, fileName) => {
    var fs = require('fs')
    var path = require('path')

    var filePath = ''
    try {
        fs.readdirSync(dir).forEach(file => {
            if (filePath != '') { return }
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filePath = fileSearch(path.join(dir, file), fileName)
                if (filePath !== '') { return filePath }
            }
            else {
                if (file === fileName) {
                    filePath  =  dir
                    return filePath
                }
            }
        })
    } catch (err) {
        throw err
    }
    return filePath 
}
exports.fileSearch = fileSearch

exports.leftPad = function(str, length, carac) {
    if (!carac) { carac = ' ' }
    return `${carac.repeat(Math.max(length - str.length,0))}${str}`;
}

exports.renameSync = (oldPath, newPath) => {
    const fs = require('fs-extra')
    try {
        if (fs.existsSync(newPath)) { fs.removeSync(newPath) }
        fs.renameSync(oldPath, newPath)
    } catch (err) {
        fs.copySync(oldPath, newPath)
        fs.removeSync(oldPath)
    }
}

exports.removeAsync = (objectPath) => {
    return new Promise(async (resolve, reject) => {
        const fs = require('fs-extra')
        try {
            if (fs.existsSync(objectPath)) {
                let data = await fs.remove(objectPath)
            }
        } catch (err) { }
        resolve()
    })
}

exports.unzipAsync = (zipLocation, deployPath) => {
    return new Promise(async (resolve, reject) => {
        const extract = require('extract-zip')
        extract(zipLocation, {dir: deployPath}, (err) => {
            resolve()
        })

        /*
        const AdmZip = require('adm-zip')
        var zip = new AdmZip(JobZipLocation)
        zip.extractAllTo(DeployToPath, true)
        */

        /*
        const unzip = require('unzip')
        try {
            fs.createReadStream(JobZipLocation).pipe(unzip.Extract({ path: DeployToPath }))
                .on('close', function(){
                    resolve(JobZipLocation)
                })
                .on('error', function(err) {
                    reject(err)
                })
        } catch (err) {
            console.log(err)
        }
        */

    })
}

exports.readFile = (fileName) => {
    return new Promise(function(resolve, reject) {
        const fs = require('fs-extra')
        fs.readFile(fileName, (err, data) => {
            err ? reject(err) : resolve(data)
        })
    })
}
