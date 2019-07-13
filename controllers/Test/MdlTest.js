exports.ArchiveTest = () => {
    return new Promise((resolve, reject) => {
        const fs = require('fs')
        const path = require('path')
        const moment = require('moment')

        // Liste des fichiers du rep
        let dir = 'C:/Temp/Partage/Archive/'
        fs.readdirSync(dir).forEach(file => {
            let fileLocation = path.join(dir, file)
            let fileStat = fs.statSync(fileLocation)
            if (fileStat.isDirectory()) { return }
            let fileDays = moment().diff(moment(fileStat.mtime), 'days')
            if (fileDays > 60) {
                let archivePath = path.join(dir, 'Archive')
                if (!fs.existsSync(archivePath)) { fs.mkdirSync(archivePath) }
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

exports.OracleTest = () => {
    return new Promise((resolve, reject) => {
        var oracledb = require('oracledb')
        oracledb.getConnection(
        {
            user          : "Ethelp",
            password      : "Ethelp",
            connectString : "(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521)))(CONNECT_DATA=(SID=xe)))"
        },
        function(err, connection)
        {
            if (err) { reject(err); return; }
            connection.execute("SELECT * FROM Job ", (err, result) => {
                if (err) { reject(err); return; }
                console.log(result.rows)
                resolve()
            })
        })
    })
}

exports.PromiseTest = (JobInterfaceID) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var sql = require('mssql');
        sql.connect(Config.AppBdd.config).then(() => { return sql.query`
            SELECT TOP 1 * 
            FROM dsi_hlp_JobInterface WITH(NOLOCK) 
            WHERE JobInterfaceID = ${JobInterfaceID} 
        `}).then(result => {
            sql.close();
            resolve(result.recordset)
        }).catch(err => { sql.close(); reject(err); })
        sql.on('error', err => { sql.close(); reject(err); })
    })
}

exports.CpvCreateJson = () => {
  return new Promise(async (resolve, reject) => {
    fs = require('fs')

    let cpvs = []
    fs.readFileSync('c:/Temp/Onglet1.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      let labels = lineArray[1].split('-').join(' ').trim().split(',')
      for (let label of labels) {
        let labelFormat = label.trim()
        if (labelFormat === '') {
          continue
        }
        cpvs.push({
          code: parseInt(lineArray[0], 10),
          label: labelFormat,
          active: lineArray[5] === 'Y',
          logo: lineArray[7].trim(),
          picture: lineArray[6].trim(),
          category: lineArray[3].trim(),
        })
      }
    })

    let familys = []
    fs.readFileSync('c:/Temp/Onglet4.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      familys.push({
        category: lineArray[0].trim(),
        family: lineArray[1].trim()
      })
    })

    let categories = []
    fs.readFileSync('c:/Temp/Onglet3.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      let category = {
        category: lineArray[0].trim(),
        cpv: parseInt(lineArray[1].trim(), 10),
        cpvText: lineArray[2].trim(),
        words: [],
      }
      for (let i = 5; i < lineArray.length; i++) {
        if (!lineArray[i] || lineArray[i].trim() === '') {
          continue
        }
        category.words.push(lineArray[i].trim().toLowerCase())
      }
      let family = familys.find(a => a.category === category.category)
      if (family) {
        category.family = family.family
      }
      categories.push(category)
    })

    fs.readFileSync('c:/Temp/Onglet5.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      let cpvLabels = lineArray[0].trim()
      let words = []
      for (let i = 2; i < lineArray.length; i++) {
        if (!lineArray[i] || lineArray[i].trim() === '') {
          continue
        }
        let wordTextes = lineArray[i].trim().toLowerCase()
        for (let word of wordTextes.split(',')) {
          words.push(word.trim().toLowerCase())
        }
      }
      for (let cpvLabel of cpvLabels.split(',')) {
        let cpvLabelFormat = cpvLabel.split('-').join(' ').trim()
        if (cpvLabelFormat === '') {
          continue
        }
        let categorie = categories.find(a => a.cpvText.toLowerCase() === cpvLabel.toLowerCase())
        if (categorie) {
          if (!categorie.words) {
            categorie.words = []
          }
          categorie.words = categorie.words.concat(words)
        }
        let cpv = cpvs.find(a => a.label.toLowerCase() === cpvLabelFormat.toLowerCase())
        if (cpv) {
          if (!cpv.words) {
            cpv.words = []
          }
          cpv.words = cpv.words.concat(words)
        } else {
          console.log(`Unknow CPV : ${cpvLabelFormat}`)
        }
      }
    })

    let categoriesText = JSON.stringify(categories, null, 3)
    fs.writeFile('c:/Temp/OngletJson2.txt', categoriesText, function (err) {
      if (err) {
        return console.log(err);
      }
    })
  
    /*
    let industries = []
    fs.readFileSync('c:/Temp/Onglet2.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      industries.push(lineArray)
    })
    */

    let cpvsText = JSON.stringify(cpvs, null, 3)
    fs.writeFile('c:/Temp/OngletJson.txt', cpvsText, function (err) {
      if (err) {
        return console.log(err);
      }
    })
    resolve()
  })
}

exports.Test = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const horodatage = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      const fileLocation = path.join(config.WorkSpaceFolder, `ApiTest${horodatage}.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          return console.log(err);
        }
      })
      resolve({
        horodatage,
        fileLocation
      })
    } catch (err) { reject(err) }
  })
}

exports.Test2 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const sleep = require('util').promisify(setTimeout)

      let horodatage1 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      let fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      await sleep(900000)

      let horodatage2 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start_${horodatage2}End.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      resolve({
        horodatage1,
        horodatage2,
        fileLocation
      })
    } catch (err) { reject(err) }
  })
}

exports.Test3 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const sleep = require('util').promisify(setTimeout)

      let horodatage1 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      let fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      await sleep(30000)

      let horodatage2 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start_${horodatage2}End.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      resolve({
        horodatage1,
        horodatage2,
        fileLocation
      })
    } catch (err) { reject(err) }
  })
}
