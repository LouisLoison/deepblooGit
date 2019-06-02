exports.List = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get ticket list
      var organizations = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    organization.organizationId AS "organizationId", 
                  organization.name AS "name", 
                  organization.dgmarketId AS "dgmarketId", 
                  organization.creationDate AS "creationDate", 
                  organization.updateDate AS "updateDate", 
                  organizationCpv.cpvCode AS "cpvCode", 
                  organizationCpv.cpvName AS "cpvName", 
                  organizationCpv.origineType AS "origineType", 
                  organizationCpv.rating AS "rating" 
        FROM      organization 
        LEFT JOIN organizationCpv ON organizationCpv.organizationId = organization.organizationId 
      `
      if (filter) {
        let where = ``
        if (filter.organizationId) {
          if (where !== '') { where += 'AND ' }
          where += `organization.organizationId = ${BddTool.NumericFormater(filter.organizationId, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY organization.organizationId '
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let organization = null
      for (var record of recordset) {
        if (!organization || organization.organizationId !== record.organizationId) {
          organization = {
            organizationId: record.organizationId,
            dgmarketId: record.dgmarketId,
            name: record.name.trim(),
            cpvs: [],
            creationDate: record.creationDate,
            updateDate: record.updateDate,
          }
          organizations.push(organization)
        }
        if (record.cpvCode) {
          organization.cpvs.push({
            code: record.cpvCode,
            name: record.cpvName.trim(),
            origineType: record.origineType,
            rating: record.rating,
          })
        }
      }
      resolve(organizations);
    } catch (err) { reject(err) }
  })
}

exports.Organization = (organizationId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let organization = null
      let filter = {
        organizationId
      }
      let organizations = await this.List(filter)
      if (organizations && organizations.length > 0) {
        organization = organizations[0]
      }
      resolve(organization);
    } catch (err) { reject(err) }
  })
}

exports.AddUpdate = (organization) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let organizationNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'organization', organization)

      if (organization.cpvs) {
        let query = `
            DELETE FROM organizationcpv 
            WHERE organizationId = ${organizationNew.organizationId} 
        `
        await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
        for (let cpv of organization.cpvs) {
          let organizationCpv= {
            organizationId: organizationNew.organizationId,
            cpvCode: cpv.code,
            cpvName: cpv.name.trim(),
            origineType: cpv.origineType,
            rating: cpv.rating,
          }
          await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'organizationCpv', organizationCpv)
        }
      }
      resolve(organizationNew);
    } catch (err) { reject(err) }
  })
}

exports.ListFromCpvs = (cpvs) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get ticket list
      var organizations = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT      organization.organizationId AS "organizationId", 
                    organization.name AS "name", 
                    organization.dgmarketId AS "dgmarketId", 
                    organization.creationDate AS "creationDate", 
                    organization.updateDate AS "updateDate", 
                    organizationCpv.cpvCode AS "cpvCode", 
                    organizationCpv.cpvName AS "cpvName", 
                    organizationCpv.origineType AS "origineType", 
                    organizationCpv.rating AS "rating" 
        FROM        organization 
        INNER JOIN  organizationCpv ON organizationCpv.organizationId = organization.organizationId 
      `
      if (cpvs) {
        let where = ``
        if (where !== '') { where += 'AND ' }
        where += `organizationCpv.cpvName IN (${BddTool.ArrayStringFormat(cpvs, BddEnvironnement, BddId)}) \n`
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY organization.organizationId '
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let organization = null
      for (var record of recordset) {
        if (!organization || organization.organizationId !== record.organizationId) {
          organization = {
            organizationId: record.organizationId,
            dgmarketId: record.dgmarketId,
            name: record.name.trim(),
            cpvs: [],
            creationDate: record.creationDate,
            updateDate: record.updateDate,
          }
          organizations.push(organization)
        }
        if (record.cpvCode) {
          organization.cpvs.push({
            code: record.cpvCode,
            name: record.cpvName.trim(),
            origineType: record.origineType,
            rating: record.rating,
          })
        }
      }

      // Init CPV rating
      for (let organization of organizations) {
        organization.cpvRatings = []
        for (let cpv of organization.cpvs) {
          if (cpv.origineType === -1) {
            continue;
          }
          let cpvFound = organization.cpvRatings.find(a => a.code === cpv.code);
          if (!cpvFound) {
            cpvFound = {
              code: cpv.code,
              name: cpv.name,
              ratingSynchro: 0,
              rating: 0,
              cpvs: [],
              isDelete: false,
            };
            organization.cpvRatings.push(cpvFound);
          }
          if (cpv.origineType === 1) {
            cpvFound.ratingSynchro++;
          }
          if (cpv.origineType === 2) {
            cpvFound.isManual = true;
            cpvFound.rating = Math.max(cpvFound.rating, cpv.rating);
          }
          if (cpv.origineType === -1) {
            cpvFound.isDelete = true;
          }
          cpvFound.cpvs.push(cpv);
        }
        organization.cpvRatings = organization.cpvRatings.filter(a => !a.isDelete);
        organization.cpvRatings = organization.cpvRatings.sort((a, b) => {
          return a.rating > b.rating ? -1 : a.rating < b.rating ? 1 : 0;
        });
      }
      organizations = organizations.filter(a => a.cpvRatings.length > 0);

      for (let organization of organizations) {
        let cpvRating = organization.cpvRatings[0];
        if (cpvRating.rating > 0) {
          organization.cpvRating = cpvRating.rating
        } else {
          organization.cpvRating = cpvRating.ratingSynchro
        }
        organization.cpvs = undefined;
      }

      organizations = organizations.sort((a, b) => {
        return a.cpvRating > b.cpvRating ? -1 : a.cpvRating < b.cpvRating ? 1 : 0;
      });

      resolve(organizations);
    } catch (err) { reject(err) }
  })
}
