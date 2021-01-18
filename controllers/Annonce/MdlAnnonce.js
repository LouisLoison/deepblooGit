exports.AddUpdate = (annonce) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let annonceNew = await BddTool.RecordAddUpdate('annonce', annonce)
      resolve(annonceNew)
    } catch (err) { reject(err) }
  })
}

exports.Click = (annonceId, userId, screen) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      const annonceClick = {
        annonceId: annonceId,
        userId: userId,
        screen: screen,
        status: 1,
        creationDate: new Date(),
        updateDate: new Date()
      }

      let annonceNew = await BddTool.RecordAddUpdate('annonceClick', annonceClick)
      resolve(annonceNew);
    } catch (err) { reject(err) }
  })
}

exports.List = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get annonce list
      var annonces = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    annonce.annonceId AS "annonceId", 
                  annonce.title AS "title", 
                  annonce.description AS "description", 
                  annonce.image AS "image", 
                  annonce.url AS "url", 
                  annonce.priority AS "priority", 
                  annonce.userId AS "userId", 
                  annonce.organizationId AS "organizationId", 
                  annonce.status AS "status", 
                  annonce.creationDate AS "creationDate", 
                  annonce.updateDate AS "updateDate", 
                  annonceClick.annonceClickId AS "annonceClickId" 
        FROM      annonce 
        LEFT JOIN annonceClick ON annonceClick.annonceId = annonce.annonceId 
      `
      if (filter) {
        let where = ``
        if (filter.annonceId) {
          if (where !== '') { where += 'AND ' }
          where += `annonce.annonceId = ${BddTool.NumericFormater(filter.annonceId, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY annonce.annonceId'
      let recordset = await BddTool.QueryExecBdd2(query)
      let annonce = null
      for (var record of recordset) {
        if (!annonce || annonce.annonceId !== record.annonceId) {
          annonce = {
            annonceId: record.annonceId,
            title: record.title,
            description: record.description,
            image: record.image,
            url: record.url,
            clickCount: 0,
            priority: record.priority,
            userId: record.userId,
            organizationId: record.organizationId,
            status: record.status,
            creationDate: record.creationDate,
            updateDate: record.updateDate,
          }
          annonces.push(annonce)
        }
        if (record.annonceClickId) {
          annonce.clickCount++;
        }
      }
      annonces.sort((a, b) => {
        let na = a.priority;
        let nb = b.priority;
        return na < nb ? 1 : na > nb ? -1 : 0;
      });
      resolve(annonces);
    } catch (err) { reject(err) }
  })
}

exports.Remove = (annonceId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (!annonceId) {
        throw new Error("No available id !")
      }

      let query = `
        DELETE FROM   annonce 
      `
      let where = ``
      if (annonceId && annonceId !== '' && annonceId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `annonceId = ${BddTool.NumericFormater(annonceId, BddEnvironnement, BddId)} \n`
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

exports.AnnonceClickList = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get ticket list
      var annonceClicks = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    annonceClick.annonceClickId AS "annonceClickId", 
                  annonceClick.annonceId AS "annonceId", 
                  annonceClick.userId AS "userId", 
                  annonceClick.screen AS "screen", 
                  annonceClick.status AS "status", 
                  annonceClick.creationDate AS "creationDate", 
                  user.hivebriteId AS "hivebriteId", 
                  user.type AS "type", 
                  user.email AS "email", 
                  user.username AS "username", 
                  user.membershipFree AS "membershipFree", 
                  user.organizationId AS "organizationId", 
                  user.country AS "country", 
                  user.photo AS "photo" 
        FROM      annonceClick 
      `
      query += `LEFT JOIN user ON annonceClick.userId = user.userId `
      if (filter) {
        let where = ``
        if (filter.annonceClickId) {
          if (where !== '') { where += 'AND ' }
          where += `annonceClickId = ${BddTool.NumericFormater(filter.annonceClickId, BddEnvironnement, BddId)} \n`
        }
        if (filter.annonceId && filter.annonceId !== '' && filter.annonceId > 0) {
          if (where !== '') { where += 'AND ' }
          where += `annonceId = ${BddTool.NumericFormater(filter.annonceId, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY creationDate DESC '
      let recordset = await BddTool.QueryExecBdd2(query)
      for (var record of recordset) {
        let annonceClick = {
          annonceClickId: record.annonceClickId,
          annonceId: record.annonceId,
          userId: record.userId,
          screen: record.screen,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate,
          user: null
        };
        if (record.userId) {
          annonceClick.user = {
            userId: record.userId,
            hivebriteId: record.hivebriteId,
            type: record.type,
            email: record.email,
            username: record.username,
            membershipFree: record.membershipFree,
            organizationId: record.organizationId,
            country: record.country,
            photo: record.photo,
          }
        }
        annonceClicks.push(annonceClick);
      }
      resolve(annonceClicks);
    } catch (err) { reject(err) }
  })
}
