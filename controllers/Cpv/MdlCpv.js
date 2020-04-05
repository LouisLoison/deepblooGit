exports.CpvAddUpdate = (cpv) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let cpvNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'cpv', cpv)
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
        where += `cpvId = ${BddTool.NumericFormater(cpvId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += '  WHERE ' + where }
      else {
        throw new Error("No available filter !")
      }
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.CpvList = (filter) => {
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
      if (filter) {
        let where = ``
        if (filter.cpvId) {
          if (where !== '') { where += 'AND ' }
          where += `cpv.cpvId = ${BddTool.NumericFormater(filter.cpvId, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY cpv.code, cpv.cpvId, cpvWord.word'
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let cpv = null
      for (var record of recordset) {
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
      cpvs.sort((a, b) => {
        let na = a.priority;
        let nb = b.priority;
        return na < nb ? 1 : na > nb ? -1 : 0;
      });
      resolve(cpvs);

      /*
      const cpvs = require(process.cwd() + '/public/constants/cpvs.json')
      let cpvId = -1;
      for (const cpv of cpvs) {
        cpv.cpvId = cpvId;
        cpvId++;
      }
      resolve(cpvs);
      */
    } catch (err) {
      reject(err);
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

      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, 'DELETE FROM   cpv')
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, 'DELETE FROM   cpvWord')

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
        const cpvNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'cpv', cpvBdd)
        if (cpv.words) {
          for (const word of cpv.words) {
            const wordBdd = {
              cpvId: cpvNew.cpvId,
              word: word,
              status: 1,
              creationDate: new Date(),
              updateDate: new Date()
            }
            await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'cpvWord', wordBdd)
          }
        }
      }
      resolve(cpvs)
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
      let cpvWordNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'cpvWord', cpvWord)
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
        where += `cpvWordId = ${BddTool.NumericFormater(cpvWordId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += '  WHERE ' + where }
      else {
        throw new Error("No available filter !")
      }
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}