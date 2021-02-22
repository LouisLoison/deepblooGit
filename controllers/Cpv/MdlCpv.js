exports.CpvAddUpdate = (cpv) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let cpvNew = await BddTool.RecordAddUpdate('cpv', cpv)
      resolve(cpvNew);
    } catch (err) { reject(err) }
  })
}

exports.cpvDelete = (cpvId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!cpvId) {
        throw new Error("No available id !")
      }

      let query = `
        DELETE FROM   cpv 
      `
      let where = ``
      if (cpvId && cpvId !== '' && cpvId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `cpvId = ${BddTool.NumericFormater(cpvId)} \n`
      }
      if (where !== '') { query += '  WHERE ' + where }
      else {
        throw new Error("No available filter !")
      }
      await BddTool.QueryExecBdd2(query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.CpvList = (filter, removeDiacritics) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get cpv list
      var cpvs = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    cpv.cpvId AS "cpvId", 
                  cpv.code AS "code", 
                  cpv.label AS "label", 
                  cpv.active AS "active", 
                  cpv.logo AS "logo", 
                  cpv.picture AS "picture", 
                  cpv.category AS "category", 
                  cpv.status AS "status", 
                  cpv.creationDate AS "creationDate", 
                  cpv.updateDate AS "updateDate", 
                  cpvWord.cpvWordId AS "cpvWordId", 
                  cpvWord.word AS "cpvWord", 
                  cpvWord.status AS "cpvWordStatus", 
                  cpvWord.creationDate AS "cpvWordCreationDate", 
                  cpvWord.updateDate AS "cpvWordUpdateDate" 
        FROM      cpv 
        LEFT JOIN cpvWord ON cpvWord.cpvId = cpv.cpvId 
      `
      let where = ``
      if (filter) {
        if (filter.cpvId) {
          if (where !== '') { where += 'AND ' }
          where += `cpv.cpvId = ${BddTool.NumericFormater(filter.cpvId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY cpv.code, cpv.cpvId, cpvWord.word'
      // console.log(query)
      let recordset = await BddTool.QueryExecBdd2(query)
      // console.log(recordset)
      let cpv = null
      for (const record of recordset) {
        if (!cpv || cpv.cpvId !== record.cpvId) {
          cpv = {
            cpvId: record.cpvId,
            code: record.code,
            label: record.label,
            active: record.active,
            logo: record.logo,
            picture: record.picture,
            category: record.category,
            status: record.status,
            creationDate: record.creationDate,
            updateDate: record.updateDate,
            cpvWords: [],
            cpvExclusions: [],
          }
          cpvs.push(cpv)
        }
        if (record.cpvWordId) {
          cpv.cpvWords.push({
            cpvWordId: record.cpvWordId,
            cpvId: record.cpvId,
            word: record.cpvWord,
            status: record.cpvWordStatus,
            creationDate: record.cpvWordCreationDate,
            updateDate: record.cpvWordUpdateDate
          });
        }
      }
      query = `
        SELECT    cpvExclusion.cpvExclusionId AS "cpvExclusionId", 
                  cpvExclusion.cpvId AS "cpvId", 
                  cpvExclusion.word AS "word", 
                  cpvExclusion.status AS "status", 
                  cpvExclusion.creationDate AS "creationDate", 
                  cpvExclusion.updateDate AS "updateDate" 
        FROM      cpvExclusion 
      `
      recordset = await BddTool.QueryExecBdd2(query)
      for (const record of recordset) {
        cpv = cpvs.find(a => a.cpvId === record.cpvId)
        if (cpv) {
          cpv.cpvExclusions.push({
            cpvExclusionId: record.cpvExclusionId,
            cpvId: record.cpvId,
            word: record.word,
            status: record.status,
            creationDate: record.creationDate,
            updateDate: record.updateDate
          });
        }
      }
      cpvs.sort((a, b) => {
        let na = a.priority
        let nb = b.priority
        return na < nb ? 1 : na > nb ? -1 : 0
      })

      if (removeDiacritics) {
        for (const cpv of cpvs) {
          const cpvWords = []
          for (const cpvWord of cpv.cpvWords) {
            cpvWord.word = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(cpvWord.word).toUpperCase()
            let isOk = true
            if (
              cpvWords.find(a => a.word === cpvWord.word)
            ) {
              isOk = false
            }
            if (cpvWord.word.endsWith('S') || cpvWord.word.endsWith('X')) {
              if (
                cpvWords.find(a => a.word === cpvWord.word.slice(0, -1))
              ) {
                isOk = false
              }
            }
            if (isOk) {
              cpvWords.push(cpvWord)
            }
          }
          cpv.cpvWords = cpvWords
        }
      }
      
      resolve(cpvs)
    } catch (err) {
      reject(err)
    }
  })
}

exports.CpvSynchro = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const cpvs = require(process.cwd() + '/public/constants/cpvs.json')
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      await BddTool.QueryExecBdd2('DELETE FROM   cpv')
      await BddTool.QueryExecBdd2('DELETE FROM   cpvWord')

      for (const cpv of cpvs) {
        const cpvBdd = {
          code: cpv.code,
          label: cpv.label,
          active: cpv.active,
          logo: cpv.logo,
          picture: cpv.picture,
          category: cpv.category,
          status: 1,
          creationDate: new Date(),
          updateDate: new Date()
        }
        const cpvNew = await BddTool.RecordAddUpdate('cpv', cpvBdd)
        if (cpv.words) {
          for (const word of cpv.words) {
            const wordBdd = {
              cpvId: cpvNew.cpvId,
              word: word,
              status: 1,
              creationDate: new Date(),
              updateDate: new Date()
            }
            await BddTool.RecordAddUpdate('cpvWord', wordBdd)
          }
        }
      }
      resolve(cpvs)
    } catch (err) {
      reject(err)
    }
  })
}

exports.CpvWord = (cpvWordId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let cpvWord = null
      let filter = {
        cpvWordId
      }
      let cpvWords = await this.CpvWordList(filter)
      if (cpvWords && cpvWords.length > 0) {
        cpvWord = cpvWords[0]
      }
      resolve(cpvWord)
    } catch (err) { reject(err) }
  })
}

exports.CpvWordList = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get cpv list
      var cpvWords = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    cpvWord.cpvWordId AS "cpvWordId", 
                  cpvWord.cpvId AS "cpvId", 
                  cpvWord.word AS "word", 
                  cpvWord.status AS "status", 
                  cpvWord.creationDate AS "creationDate", 
                  cpvWord.updateDate AS "updateDate" 
        FROM      cpvWord 
      `
      if (filter) {
        let where = ``
        if (filter.cpvWordId) {
          if (where !== '') { where += 'AND ' }
          where += `cpvWord.cpvWordId = ${BddTool.NumericFormater(filter.cpvWordId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY cpvWord.word '
      let recordset = await BddTool.QueryExecBdd2(query)
      for (var record of recordset) {
        cpvWords.push({
          cpvWordId: record.cpvWordId,
          cpvId: record.cpvId,
          word: record.word,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        })
      }
      resolve(cpvWords)
    } catch (err) {
      reject(err)
    }
  })
}

exports.CpvWordAddUpdate = (cpvWord) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let cpvWordNew = await BddTool.RecordAddUpdate('cpvWord', cpvWord)
      resolve(cpvWordNew);
    } catch (err) { reject(err) }
  })
}

exports.cpvWordDelete = (cpvWordId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!cpvWordId) {
        throw new Error("No available id !")
      }

      let query = `
        DELETE FROM   cpvWord 
      `
      let where = ``
      if (cpvWordId && cpvWordId !== '' && cpvWordId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `cpvWordId = ${BddTool.NumericFormater(cpvWordId)} \n`
      }
      if (where !== '') { query += '  WHERE ' + where }
      else {
        throw new Error("No available filter !")
      }
      await BddTool.QueryExecBdd2(query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.CpvExclusion = (cpvExclusionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let cpvExclusion = null
      let filter = {
        cpvExclusionId
      }
      let cpvExclusions = await this.CpvExclusionList(filter)
      if (cpvExclusions && cpvExclusions.length > 0) {
        cpvExclusion = cpvExclusions[0]
      }
      resolve(cpvExclusion)
    } catch (err) { reject(err) }
  })
}

exports.CpvExclusionList = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get cpv list
      var cpvExclusions = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    cpvExclusion.cpvExclusionId AS "cpvExclusionId", 
                  cpvExclusion.cpvId AS "cpvId", 
                  cpvExclusion.word AS "word", 
                  cpvExclusion.status AS "status", 
                  cpvExclusion.creationDate AS "creationDate", 
                  cpvExclusion.updateDate AS "updateDate" 
        FROM      cpvExclusion 
      `
      if (filter) {
        let where = ``
        if (filter.cpvExclusionId) {
          if (where !== '') { where += 'AND ' }
          where += `cpvExclusion.cpvExclusionId = ${BddTool.NumericFormater(filter.cpvExclusionId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY cpvExclusion.word '
      let recordset = await BddTool.QueryExecBdd2(query)
      for (var record of recordset) {
        cpvExclusions.push({
          cpvExclusionId: record.cpvExclusionId,
          cpvId: record.cpvId,
          word: record.word,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        })
      }
      resolve(cpvExclusions)
    } catch (err) {
      reject(err)
    }
  })
}

exports.CpvExclusionAddUpdate = (cpvExclusion) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let cpvExclusionNew = await BddTool.RecordAddUpdate('cpvExclusion', cpvExclusion)
      resolve(cpvExclusionNew);
    } catch (err) { reject(err) }
  })
}

exports.cpvExclusionDelete = (cpvExclusionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!cpvExclusionId) {
        throw new Error("No available id !")
      }

      let query = `
        DELETE FROM   cpvExclusion 
      `
      let where = ``
      if (cpvExclusionId && cpvExclusionId !== '' && cpvExclusionId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `cpvExclusionId = ${BddTool.NumericFormater(cpvExclusionId)} \n`
      }
      if (where !== '') { query += '  WHERE ' + where }
      else {
        throw new Error("No available filter !")
      }
      await BddTool.QueryExecBdd2(query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.downloadCsv = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const moment = require('moment')
      const cpvs = await this.CpvList()

      let cpvText = `cpvId;category;code;label;logo;picture;word\n`
      if (cpvs) {
        for (const cpv of cpvs) {
          const words = cpv.cpvWords.map(a => a.word).join(';')
          cpvText += `${cpv.cpvId};${cpv.category || ''};${cpv.code || ''};${cpv.label || ''};${cpv.logo || ''};${cpv.picture || ''};${words}\n`
        }
      }
      const fileName = `cpvs_${moment().format("YYYYMMDD_HHmmss")}.csv`
      const downloadPath = path.join(config.WorkSpaceFolder, 'Download/')
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath)
      }
      const cpvListLocation = path.join(downloadPath, fileName)
      fs.writeFileSync(cpvListLocation, cpvText)

      resolve({
        fileName: fileName, 
        url: `download/${fileName}`,
      });
    } catch (err) { reject(err) }
  })
}

exports.cpvCategories = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get cpv list
      var categories = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    cpv.category AS "category" 
        FROM      cpv 
        GROUP BY  cpv.category 
      `
      if (filter) {
        let where = ``
        if (filter.cpvId) {
          if (where !== '') { where += 'AND ' }
          where += `cpv.cpvId = ${BddTool.NumericFormater(filter.cpvId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY cpv.category '
      let recordset = await BddTool.QueryExecBdd2(query)
      for (var record of recordset) {
        categories.push(record.category)
      }
      resolve(categories)
    } catch (err) {
      reject(err)
    }
  })
}
