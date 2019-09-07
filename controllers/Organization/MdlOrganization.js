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
                  organization.countrys AS "countrys", 
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
            countrys: record.countrys,
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

exports.ListFromCpvs = (cpvs, country) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const RegionList = require(process.cwd() + '/public/constants/regions.json')

      let cpvSearchLabels = []
      for (let cpvLabel of cpvs) {
        if (!cpvLabel || cpvLabel === '') {
          continue;
        }
        if (['electricity', 'energy and related services'].includes(cpvLabel.toLowerCase())) {
          continue;
        }
        cpvSearchLabels.push(cpvLabel);
      }

      // Get country region
      let region1Source = null
      let region2Source = null
      for (let region1 of RegionList) {
        if (region1.countrys) {
          if (region1.countrys.find(a => a.toLowerCase() === country.toLowerCase())) {
            region1Source = region1
            break
          }
        }
        if (region1.regions) {
          for (let region2 of region1.regions) {
            if (region2.countrys) {
              if (region2.countrys.find(a => a.toLowerCase() === country.toLowerCase())) {
                region1Source = region1
                region2Source = region2
                break
              }
            }
          }
          if (region1Source) {
            break
          }
        }
      }

      var organizations = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT      organization.organizationId AS "organizationId", 
                    organization.name AS "name", 
                    organization.dgmarketId AS "dgmarketId", 
                    organization.countrys AS "countrys", 
                    organization.creationDate AS "creationDate", 
                    organization.updateDate AS "updateDate", 
                    organizationCpv.cpvCode AS "cpvCode", 
                    organizationCpv.cpvName AS "cpvName", 
                    organizationCpv.origineType AS "origineType", 
                    organizationCpv.rating AS "rating", 
                    user.userId AS "userId", 
                    user.hivebriteId AS "hivebriteId", 
                    user.username AS "userName", 
                    user.email AS "userEmail", 
                    user.photo AS "userPhoto", 
                    user.regions AS "userRegions", 
                    user.country AS "userCountry", 
                    user.countryCode AS "userCountryCode", 
                    userCpv.cpvCode AS "userCpvCode", 
                    userCpv.cpvName AS "userCpvName", 
                    userCpv.origineType AS "userOrigineType", 
                    userCpv.rating AS "userRating" 
        FROM        organization 
        INNER JOIN  organizationCpv ON organizationCpv.organizationId = organization.organizationId 
        LEFT JOIN   user ON user.organizationId = organization.organizationId 
        LEFT JOIN   userCpv ON userCpv.userId = user.userId 
      `
      if (cpvs) {
        let where = ``
        if (where !== '') { where += 'AND ' }
        where += `( \n`
        where += `organizationCpv.cpvName IN (${BddTool.ArrayStringFormat(cpvSearchLabels, BddEnvironnement, BddId)}) \n`
        where += `OR userCpv.cpvName IN (${BddTool.ArrayStringFormat(cpvSearchLabels, BddEnvironnement, BddId)}) \n`
        where += `) \n`
        if (where !== '') { query += 'WHERE ' + where }
      }
      query += '  ORDER BY organization.organizationId, organizationCpv.cpvCode, user.userId, userCpv.cpvCode '
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let organization = null
      let cpvCode = null
      let user = null
      let userCpvCode = null
      for (var record of recordset) {
        if (!organization || organization.organizationId !== record.organizationId) {
          organization = {
            organizationId: record.organizationId,
            dgmarketId: record.dgmarketId,
            name: record.name.trim(),
            countrys: record.countrys ? record.countrys.trim().split(',') : [],
            cpvs: [],
            users: [],
            cpvFounds: [],
            cpvRatings: [],
            creationDate: record.creationDate,
            updateDate: record.updateDate,
          }
          organizations.push(organization)
          cpvCode = null
          user = null
          userCpvCode = null
        }
        if (record.cpvCode && cpvCode !== record.cpvCode) {
          organization.cpvs.push({
            code: record.cpvCode,
            name: record.cpvName.trim(),
            origineType: record.origineType,
            rating: record.rating,
          })
          cpvCode = record.cpvCode
        }
        if (record.userId && (!user || user.userId !== record.userId)) {
          user = organization.users.find(a => a.userId === record.userId)
          if (!user) {
            user = {
              userId: record.userId,
              hivebriteId: record.hivebriteId,
              username: record.userName,
              email: record.userEmail,
              photo: record.userPhoto,
              regions: record.userRegions,
              country: record.userCountry,
              cpvs: [],
              cpvFounds: [],
            }
            organization.users.push(user)
          }
        }
        if (user && record.userCpvCode && userCpvCode !== record.userCpvCode) {
          user.cpvs.push({
            code: record.userCpvCode,
            name: record.userCpvName.trim(),
            origineType: record.userOrigineType,
            rating: record.userRating,
          })
          userCpvCode = record.userCpvCode
        }
      }

      // Init CPV rating
      for (let organization of organizations) {
        let organizationCpvFlg = false
        let organizationCountryFlg = false
        let userRegionFlg = false
        let userSubRegionFlg = false
        let userCountryFlg = false
        let userCpvFlg = false

        if (organization.countrys.includes(country)) {
          organizationCountryFlg = true
        }

        for (let user of organization.users) {
          if (user.hivebriteId === 1937699) {
            let toto = 10;
          }

          // Test user region
          if (region1Source) {
            let region1 = null
            let region2 = null
            let regionLabel2 = ''
            if (user.regions) {
              let regionLabels = user.regions.trim().split(',')
              for (let regionLabel of regionLabels) {
                let regionLabel1 = regionLabel.trim().split('-')[0].trim()
                if (regionLabel1 !== '') {
                  region1 = RegionList.find(a => a.label.toLowerCase() === regionLabel1.toLowerCase())
                  if (region1) {
                    if (regionLabel.includes('-')) {
                      regionLabel2 = regionLabel.trim().split('-')[1].trim()
                      region2 = region1.regions.find(a => a.label.toLowerCase() === regionLabel2.toLowerCase())
                    }
                    break;
                  }
                }
              }
            }
            if (region1 && region1.label === region1Source.label) {
              userRegionFlg = true
              if (region2 && regionLabel2.toLowerCase() !== 'all') {
                if (region2Source && region2 && region2.label === region2Source.label) {
                  userSubRegionFlg = true
                }
              }
              if (!region2 && regionLabel2.toLowerCase() === 'all') {
                userSubRegionFlg = true
              }
            }
          }

          // Test user country
          if (user.country === country) {
            userCountryFlg = true
          }

          // Test user CPV
          if (user.cpvs && user.cpvs.length > 0) {
            let cpvLabels = user.cpvs.map(a => a.name.toLowerCase())
            for (let cpvLabel of cpvSearchLabels) {
              if (cpvLabels.includes(cpvLabel.toLowerCase())) {
                userCpvFlg = true
                user.cpvFounds.push(cpvLabel)
                let cpvFound = organization.cpvFounds.find(a => a === cpvLabel);
                if (!cpvFound) {
                  organization.cpvFounds.push(cpvLabel)
                }
              }
            }
          }
        }

        let cpvLabels = organization.cpvs.filter(a => a.origineType !== -1).map(b => b.name.toLowerCase())
        for (let cpvLabel of cpvSearchLabels) {
          if (cpvLabels.includes(cpvLabel.toLowerCase())) {
            organizationCpvFlg = true
            if (!organization.cpvFounds.find(a => a === cpvLabel)) {
              organization.cpvFounds.push(cpvLabel)
            }
          }
        }

        organization.cpvRating = 0
        if (userCpvFlg && userSubRegionFlg && userCountryFlg) {
          organization.cpvRating = 5
        } else if (userCpvFlg && userSubRegionFlg) {
          organization.cpvRating = 3
        } else if (userCpvFlg) {
          organization.cpvRating = 1
        }

        organization.userRegionFlg = userRegionFlg
        organization.userSubRegionFlg = userSubRegionFlg
        organization.userCountryFlg = userCountryFlg
        organization.userCpvFlg = userCpvFlg

        // Get all user of the organization
        organization.organization = await this.Organization(organization.organizationId);
        if (organization.organization) {
          organization.organization.users  = await require(process.cwd() + '/controllers/User/MdlUser').List({
            organizationId: organization.organizationId
          });
        }
      }

      organizations = organizations.filter(a => a.cpvRating > 0);
      organizations = organizations.sort((a, b) => {
        let aValue = a.cpvRating
        let bValue = b.cpvRating
        if (aValue === bValue) {
          aValue = a.cpvFounds.length
          bValue = b.cpvFounds.length
          if (aValue === bValue) {
            aValue = a.users.length
            bValue = b.users.length
          }
        }
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      });
      resolve(organizations);
    } catch (err) { reject(err) }
  })
}
