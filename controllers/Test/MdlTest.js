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
        if (lineArray[i].trim() !== '') {
          category.words.push(lineArray[i].trim().toLowerCase())
        }
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
      let cpvLabelDeepbloos = lineArray[2].trim()
      if (cpvLabelDeepbloos !== '') {
        cpvLabels += ',' + cpvLabelDeepbloos
      }
      let words = []
      for (let i = 3; i < lineArray.length; i++) {
        if (!lineArray[i] || lineArray[i].trim() === '') {
          continue
        }
        let wordTextes = lineArray[i].trim().toLowerCase()
        for (let word of wordTextes.split(',')) {
          if (word.trim() !== '') {
            words.push(word.trim().toLowerCase())
          }
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
  
    // let industries = []
    // fs.readFileSync('c:/Temp/Onglet2.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
    //   let lineArray = line.split('|')
    //   industries.push(lineArray)
    // })

    let cpvsText = JSON.stringify(cpvs, null, 3)
    fs.writeFile('c:/Temp/OngletJson.txt', cpvsText, function (err) {
      if (err) {
        return console.log(err);
      }
    })
    resolve()
  })
}

exports.CountryCreateCsv = () => {
  return new Promise(async (resolve, reject) => {
    fs = require('fs')
    const regionList = require(process.cwd() + '/public/constants/regions.json')

    let countrys = []
    for(const region of regionList) {
      if (region.countrys && region.countrys.length) {
        for(const country of region.countrys) {
          countrys.push({
            country,
            region: region.label,
            subRegion: '',
          })
        }        
      }
      if (region.regions && region.regions.length) {
        for(const subRegion of region.regions) {
          if (subRegion.countrys && subRegion.countrys.length) {
            for(const country of subRegion.countrys) {
              countrys.push({
                country,
                region: region.label,
                subRegion: subRegion.label,
              })
            }        
          }        
        }        
      }
    }

    countryText = 'country;region;subRegion\n'
    for(const country of countrys) {
      countryText += `${country.country};${country.region};${country.subRegion}\n`
    }
    fs.writeFileSync('c:/Temp/Country.csv', countryText)

    resolve()
  })
}

exports.Test = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const fs = require('fs')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const lines = fs.readFileSync('c:/Temp/country.csv', 'utf-8').split(/\r?\n/)
      
      for (const line of lines) {
        const lineArray = line.split(';')
        const countryId = lineArray[0]
        const countryCode = lineArray[1]
        const countryCode3 = lineArray[2]
        const name = lineArray[3]
        const nameShort = lineArray[4]
        const query = `
          INSERT INTO mappingCountry (
            countryId,
            countryCode,
            countryCode3,
            name,
            nameShort,
            creationDate,
            updateDate
          ) VALUES (
            '${BddTool.ChaineFormater(countryId)}',
            '${BddTool.ChaineFormater(countryCode)}',
            '${BddTool.ChaineFormater(countryCode3)}',
            '${BddTool.ChaineFormater(name)}',
            '${BddTool.ChaineFormater(nameShort)}',
            ${BddTool.DateNow(BddEnvironnement, BddId)},
            ${BddTool.DateNow(BddEnvironnement, BddId)}
          )
        `
        await BddTool.QueryExecBdd2(query)
      }
  
      /*
      let text = '123456789 1288&amp;amp;994 4654 4654 588&amp;amp;994 646846849 7498 79amp8 7 94 98 49 84amp;'
      let html = text.replace(/&amp;amp;/g, '')
      html = html.replace(/&amp;/g, '')
      html = html.replace(/amp;/g, '')
      html = html
      */

      /*
      const { v4: uuidv4 } = require('uuid')

      let count = 0
      for (i = 0; i < 6; i++) {
        const tenderDatas = await require(process.cwd() + '/controllers/Tender/MdlTender').tenders({
          noUuid: true,
        }, null, 500)

        for (const tender of tenderDatas.entries) {
          tender.tenderUuid = uuidv4()
          await require(process.cwd() + '/controllers/Tender/MdlTender').tenderAddUpdate(tender)
        }
        count += tenderDatas.entries.length
      }
      */

      /*
      const line = 'sgfkhjdfgk dfk fdkjv dfskjvn fdkvjn dfskvjndfsvkjn fdsvkjdnfs vkj dnfs vkdjsfn vkdjnvkdsjnvdfkjvn sdfkjv nddfg'
      const regex = '(?:.*fdk|d88fk)(?:.*vkdjsfn)'
      const value = line.match(regex)
      */
      resolve(count)
    } catch (err) {
      reject(err)
    }
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

exports.Test4 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const horodatage = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      const fileLocation = path.join(config.WorkSpaceFolder, `ApiTest${horodatage}.txt`)


      const testSector = `
      `
      const sectors = testSector.split('\n')
      const SECTORS_LIST = []
      for (const sector of sectors) {
        if (sector.trim() === '') {
          continue
        }
        NACECode = parseInt(sector.split(';')[2], 10)
        TradeSector = sector.split(';')[3]
        Description = sector.split(';')[4]
        Industry = ''
        if (NACECode >= 110 && NACECode <= 1450) {
          Industry = 'Agriculture & mining'
        } else if ((NACECode >= 1500 && NACECode <= 2330) || (NACECode >= 2600 && NACECode <= 2875)) {
          Industry = 'Manufacturing of raw material (excl. mining)'
        } else if ((NACECode >= 2900 && NACECode <= 3350) || (NACECode >= 3600 && NACECode <= 3720)) {
          Industry = 'Other manufacturing of machinery & equipment'
        } else if (NACECode >= 3400 && NACECode <= 3550) {
          Industry = 'Automotive & aeronautics (incl. suppliers) manufacturing'
        } else if (NACECode >= 4000 && NACECode <= 4100) {
          Industry = 'Regulated energy/utilities'
        } else if (NACECode >= 4500 && NACECode <= 4550) {
          Industry = 'Construction'
        } else if (NACECode >= 5010 && NACECode <= 5274) {
          Industry = 'Wholesale & retail trade'
        } else if ((NACECode >= 5510 && NACECode <= 5552) || (NACECode === 6420) || (NACECode >= 7200 && NACECode <= 7487)) {
          Industry = 'Business & consumer services'
        } else if (NACECode >= 6000 && NACECode <= 6412) {
          Industry = 'Transportation'
        } else if (NACECode >= 7000 && NACECode <= 7140) {
          Industry = 'Real estate & rental'
        } else if (NACECode >= 7511 && NACECode <= 9305) {
          Industry = 'Public & community services'
        } else if (NACECode >= 9500 && NACECode <= 9990) {
          Industry = 'Misc'
        } else if ((NACECode >= 1500 && NACECode <= 2330) || (NACECode >= 2600 && NACECode <= 2875)) {
          Industry = 'Other chemicals'
        } else if (NACECode >= 2440 && NACECode <= 2442) {
          Industry = 'Specialized chemicals (pharmaceuticals, etc.)'
        } else if (NACECode >= 4000 && NACECode <= 4100) {
          Industry = 'Unregulated energy/utilities'
        }
        SECTORS_LIST.push({
          NACECode: NACECode.toString(),
          TradeSector,
          Description,
          Industry: Industry === '' ? null : Industry
        })
      }

      fs.writeFile(fileLocation, JSON.stringify(SECTORS_LIST, null, 3), function (err) {
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

exports.Test5 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()

      let creationDateMax = new Date()
      creationDateMax.setDate(creationDateMax.getDate() - 10);
      let creationDateMin = new Date()
      creationDateMin.setDate(creationDateMin.getDate() - 15);
      const tenders = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderList(null, null, creationDateMin, creationDateMax)
      const tendersToDelete = []
      const tendersToUpdate = []
      for (const tender of tenders) {
        let isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(tender.title, 'TITLE')
        if (!isOk.status) {
          tendersToDelete.push(tender)
          continue
        }
        isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(tender.description, 'DESCRIPTION')
        if (!isOk.status) {
          tendersToDelete.push(tender)
          continue
        }

        /*
        if (tender.id === 496662) {
          const toto = 1
        }
        */

        const tenderCriterionsTitle = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.title, CpvList)
        if (tenderCriterionsTitle.length) {
          isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusionIfNoCpv(tender.title, 'TITLE')
          if (!isOk.status) {
            tendersToDelete.push(tender)
            continue
          }
        }
        const tenderCriterionsDescription = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.description, CpvList)
      }

      for (const tender of tendersToDelete) {
        if (!tender.id || !tender.algoliaId) {
          continue
        }
        await require(process.cwd() + '/controllers/Tender/MdlTender').TenderRemove(tender.id, tender.algoliaId, true)
      }

      for (const tender of tendersToUpdate) {
        if (!tender.id || !tender.algoliaId) {
          continue
        }
        // await require(process.cwd() + '/controllers/Tender/MdlTender').tenderAddUpdate(tender)
      }

      resolve()
    } catch (err) { reject(err) }
  })
}

exports.importDgmarket = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')

      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'TenderImport/DgMarket/Archive/treat/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
        return
      }
      const fileLocation = path.join(fileFolder, files[0])

      const fileParseData = await require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').FileParse(fileLocation)
      const importDgmarkets = fileParseData.importDgmarkets

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')      
      await BddTool.bulkInsert(
        BddId,
        BddEnvironnement,
        'importDgmarket',
        importDgmarkets
      )

      resolve()
    } catch (err) { reject(err) }
  })
}
