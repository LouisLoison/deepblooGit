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

exports.ESBArchivePath = (Environnement, Server, Projet, Sequenceur) => {
    const Config = require(process.cwd() + '/config')
    const path = require('path')
    const fs = require('fs-extra')

    var ArchiveDirectory = path.join(Config.WorkSpaceFolder, `Archive/`)
    if (!fs.existsSync(ArchiveDirectory)) { fs.mkdirSync(ArchiveDirectory) }
    ArchiveDirectory = path.join(ArchiveDirectory, `${Environnement}/`)
    if (!fs.existsSync(ArchiveDirectory)) { fs.mkdirSync(ArchiveDirectory) }
    ArchiveDirectory = path.join(ArchiveDirectory, `ESB/`)
    if (!fs.existsSync(ArchiveDirectory)) { fs.mkdirSync(ArchiveDirectory) }
    if (!['ref_DEV', 'ref_MCO'].includes(Environnement) && Server && Server !== '') {
        ArchiveDirectory = path.join(ArchiveDirectory, `${Server}/`)
        if (!fs.existsSync(ArchiveDirectory)) { fs.mkdirSync(ArchiveDirectory) }
    }
    ArchiveDirectory = path.join(ArchiveDirectory, `${Projet}/`)
    if (!fs.existsSync(ArchiveDirectory)) { fs.mkdirSync(ArchiveDirectory) }
    ArchiveDirectory = path.join(ArchiveDirectory, `${Sequenceur}/`)
    if (!fs.existsSync(ArchiveDirectory)) { fs.mkdirSync(ArchiveDirectory) }

    return ArchiveDirectory
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

var fileItemSearchDirectory = (dir, fileName) => {
    var fs = require('fs')
    var path = require('path')
    let JobItemList = []
    let JobItemMax = null

    var filePath = ''
    try {
        if (!fs.existsSync(dir)) {
            return null
        }

        fs.readdirSync(dir).forEach(file => {
            if (filePath != '') { return }
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filePath = fileItemSearchDirectory(path.join(dir, file), fileName)
                if (filePath !== '') { return filePath }
            }
            else {
                if (file.endsWith('.item')) {
                    let Name = file.substring(0, file.lastIndexOf('.item'))
                    let Version = Name.substring(Name.lastIndexOf('_') + 1)
                    Name = Name.substring(0, Name.lastIndexOf('_'))

                    if (Name === fileName) {
                        let JobItem = {
                            dir: dir,
                            file: file,
                            Version: Version,
                            VersionValue: Version && Version !== '' ? this.leftPad(Version.split('.')[0], 10, '0') + '.' + this.leftPad(Version.split('.')[1], 10, '0') : ''
                        }
                        JobItemList.push(JobItem)
                        if (!JobItemMax || JobItem.VersionValue > JobItemMax.VersionValue) {
                            JobItemMax = JobItem
                        }
                    }
                }
            }
        })
    } catch (err) {
        throw err
    }

    if (JobItemMax) {
        filePath = path.join(JobItemMax.dir, `/${JobItemMax.file}`)
    }
    
    return filePath 
}

var fileItemListSearchDirectory = (dir, fileName, JobItemList) => {
    var fs = require('fs')
    var path = require('path')

    if (!JobItemList) { JobItemList = [] }
    fs.readdirSync(dir).forEach(file => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            fileItemListSearchDirectory(path.join(dir, file), fileName, JobItemList)
        }
        else {
            if (file.endsWith('.item')) {
                var Name = file.substring(0, file.lastIndexOf('.item'))
                var Version = Name.substring(Name.lastIndexOf('_') + 1)
                Name = Name.substring(0, Name.lastIndexOf('_'))
                let JobItem = {
                    dir: dir,
                    file: file,
                    Name: Name,
                    Version: Version,
                    VersionValue: this.leftPad(Version.split('.')[0], 10, '0') + '.' + this.leftPad(Version.split('.')[1], 10, '0')
                }

                let JobItemListTemp = JobItemList.filter(a => a.Name === JobItem.Name)
                if (JobItemListTemp.length > 0) {
                    if (JobItem.VersionValue > JobItemListTemp[0].VersionValue) {
                        JobItemListTemp[0].dir = JobItem.dir
                        JobItemListTemp[0].file = JobItem.file
                        JobItemListTemp[0].Name = JobItem.Name
                        JobItemListTemp[0].Version = JobItem.Version
                        JobItemListTemp[0].VersionValue = JobItem.VersionValue
                    }
                } else {
                    JobItemList.push(JobItem)
                }
            }
        }
    })
    
    return JobItemList
}

exports.fileItemSearch = (Environnement, Projet, Sequenceur, JobNom, JobType) => {
    var path = require('path')
    var JobRootDirectory = JobPath(Environnement, Projet, Sequenceur)
    if (JobType === 'ESB') {
        JobRootDirectory = path.join(JobRootDirectory, `Source/${Sequenceur}/${Projet}/process/`)
    } else {
        JobRootDirectory = path.join(JobRootDirectory, `${Sequenceur}/items/${Projet}/process/`)
    }
    var filePath = fileItemSearchDirectory(JobRootDirectory, JobNom)
    return filePath
}

exports.fileItemSearch2 = (Environnement, Server, Projet, Sequenceur, JobNom, JobType) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fs = require('fs-extra')
            const path = require('path')
            let ProjetPathList = await ProjetPath2(Environnement, Server, Projet)
            let JobRootDirectory = ProjetPathList[0]
            let filePath = ''
            if (JobType === 'ESB') {
                JobRootDirectory = path.join(JobRootDirectory, `${Sequenceur}/Source/${Sequenceur}/${Projet}/process/`)
                if (!fs.existsSync(JobRootDirectory)) {
                    JobRootDirectory = path.join(ProjetPathList[0], `${Sequenceur}/Source/${Sequenceur}/${Sequenceur}/${Projet}/process/`)
                }
            } else {
                JobRootDirectory = path.join(JobRootDirectory, `${Sequenceur}/${Sequenceur}/items/${Projet}/process/`)
            }
            filePath = fileItemSearchDirectory(JobRootDirectory, JobNom)
            resolve(filePath)
        } catch (err) { reject(err) }
    })
}

exports.fileItemJson = (Environnement, Server, Projet, Sequenceur, JobNom, JobType, Version) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fs = require('fs-extra')
            const path = require('path')
            const xml2js = require('xml2js')
            const parser = new xml2js.Parser()
            if (!Version) {
                let FileLocation = await this.fileItemSearch2(Environnement, Server, Projet, Sequenceur, JobNom, JobType, Version)
                fs.readFile(FileLocation, (err, data) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    parser.parseString(data, (err, result) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        resolve(result)
                    })
                })
            } else {
                let ProjetPathList = await ProjetPath2(Environnement, Server, Projet)
                var JobRootDirectory = ProjetPathList[0]
                let VersionList = await require(process.cwd() + '/controllers/Job/MdlJob').VersionList(Environnement, Server, Projet, Sequenceur, JobType)
                let VersionObject = VersionList.find(a => a.Version === Version)
                if (VersionObject) {
                    if (JobType === 'ESB') {
                        JobRootDirectory = path.join(JobRootDirectory, `${Sequenceur}/Source/`)
                    }
                    let ArchiveLocation = path.join(JobRootDirectory, VersionObject.file)
                    if (fs.existsSync(ArchiveLocation)) {
                        var AdmZip = require('adm-zip')
                        var zip = new AdmZip(ArchiveLocation)
                        var zipEntries = zip.getEntries()
                        zipEntries.forEach((zipEntry) => {
                            if (RegExp('/' + JobNom + '_*([0-9]+)(\.)([0-9]+)(\.item)').test(zipEntry.entryName)) {
                                parser.parseString(zip.readAsText(zipEntry.entryName), (err, result) => {
                                    if (err) {
                                        reject(err)
                                        return
                                    }
                                    resolve(result)
                                })
                            }
                        })
                    }
                }
                resolve(filePath)
            }
        } catch (err) { reject(err) }
    })
}

exports.JobItemList = (Environnement, Server, Projet, Sequenceur, JobNom, JobType, FileName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fs = require('fs-extra')
            const path = require('path')
            let ProjetPathList = await ProjetPath2(Environnement, Server, Projet)
            if (Environnement === 'Temp') {
                let FileLocation = path.join(ProjetPathList[0], FileName)
                if (fs.existsSync(FileLocation)) {
                    await this.unzipAsync(FileLocation, ProjetPathList[0])
                }
            }
            if (JobType === 'ESB') {
                JobRootDirectory = path.join(ProjetPathList[0], `/${Sequenceur}/Source/${Sequenceur}/${Projet}/process/`)
            } else {
                JobRootDirectory = path.join(ProjetPathList[0], `/${Sequenceur}/${Sequenceur}/items/${Projet}/process/`)
            }
            let JobItemList = fileItemListSearchDirectory(JobRootDirectory, JobNom)
            resolve(JobItemList)
        } catch (err) { reject(err) }
    })
}

var JobPath = (Environnement, Projet, Sequenceur, Server) => {
    var path = require('path')
    var Config = require(process.cwd() + '/config')
    var JobRootDirectory = ''
    if (['ref_DEV', 'ref_MCO'].includes(Environnement)) {
        JobRootDirectory = path.join(Config.WorkSpaceFolder, `${Environnement}/${Projet}/${Sequenceur}/`)
        return JobRootDirectory
    }
    return JobRootDirectory
}
exports.JobPath = JobPath

var JobPath2 = (Environnement, Server, Projet, Sequenceur, JobType) => {
    return new Promise((resolve, reject) => {
        var path = require('path')
        var Config = require(process.cwd() + '/config')

        let JobRootDirectory = ''
        if (['ref_DEV', 'ref_MCO'].includes(Environnement)) {
            JobRootDirectory = path.join(Config.WorkSpaceFolder, `${Environnement}/${Projet}/`)
            resolve(JobRootDirectory)
        } else {
            ProjetPath2(Environnement, Server, Projet).then((ProjetPathList) => {
                if (JobType === 'ESB') {
                    JobRootDirectory = path.join(ProjetPathList[0], `/${Sequenceur}/`)
                } else {
                    JobRootDirectory = path.join(ProjetPathList[0], `/${Sequenceur}/`)
                }
                resolve(JobRootDirectory)
            }).catch((err) => { reject(err) })
        }
    })
}
exports.JobPath2 = JobPath2

exports.leftPad = function(str, length, carac) {
    if (!carac) { carac = ' ' }
    return `${carac.repeat(Math.max(length - str.length,0))}${str}`;
}

var ProjetPath = (Environnement, Projet) => {
    var path = require('path')
    var Config = require(process.cwd() + '/config')
    var JobRootDirectory = ''
    if (['ref_DEV', 'ref_MCO'].includes(Environnement)) {
        JobRootDirectory = path.join(Config.WorkSpaceFolder, `${Environnement}/${Projet}/`)
        return JobRootDirectory
    }
    return JobRootDirectory
}
exports.ProjetPath = ProjetPath

var ProjetPath2 = (Environnement, Server, Projet) => {
    return new Promise((resolve, reject) => {
        const path = require('path')
        const Config = require(process.cwd() + '/config')
        var ProjetDirectory = ''
        if (['ref_DEV', 'ref_MCO'].includes(Environnement)) {
            ProjetDirectory = path.join(Config.WorkSpaceFolder, `${Environnement}/${Projet}/`)
            resolve([ProjetDirectory])
        } else if (Environnement === 'Livraison') {
            ProjetDirectory = path.join(Config.WorkSpaceFolder, `Livraison/`)
            resolve([ProjetDirectory])
        } else if (Environnement === 'Temp') {
            ProjetDirectory = path.join(Config.WorkSpaceFolder, `Upload/Temp/`)
            resolve([ProjetDirectory])
        } else {
            const path = require('path')
            const BddTool = require(process.cwd() + '/global/BddTool')
            var ServerList = []
            var BddId = 'EtlTool'
            var BddEnvironnement = 'PRD'
            BddTool.QueryExecBdd(BddId, BddEnvironnement, `
                SELECT      ServerID AS "ServerID", 
                            Nom AS "Nom", 
                            EmplacementDEV AS "EmplacementDEV", 
                            EmplacementINT AS "EmplacementINT", 
                            EmplacementRCT AS "EmplacementRCT", 
                            EmplacementPPR AS "EmplacementPPR", 
                            EmplacementPRD AS "EmplacementPRD", 
                            Statut AS "Statut"
                FROM        Server 
                WHERE       Nom = '${BddTool.ChaineFormater(Server, BddEnvironnement, BddId)}'
            `, reject, (recordset) => { 
                var Emplacement = ''
                for (var record of recordset) {
                    Emplacement = record[`Emplacement${Environnement}`]
                }
                ProjetDirectory = Emplacement.replace(/\[Projet\]/gi, Projet)
                resolve(ProjetDirectory.split('|'))
            })
        }
    })
}
exports.ProjetPath2 = ProjetPath2

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
