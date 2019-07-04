exports.Login = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const jwt = require('jsonwebtoken')
      const BddTool = require(process.cwd() + '/global/BddTool')

      /*
      // Get hivebrite token
      let tokenResponse = await require('axios').post(`${config.hivebriteUrl}oauth/token`, {
        grant_type: 'password',
        scope: 'admin',
        admin_email: username,
        password: password,
        client_id: 'b97245387eab5b1b57ac3135e8ba7fbac2399775844ba8a2fa70426fb0d26e55',
        client_secret: '24487443aee0962b24b678e9e6f90fec40b25fa645007d418681164423486166',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        refresh_token: null,
      })
      config.hivebrite.token = tokenResponse.data.access_token

      // Get hivebrite user info
      let meResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/me`)
      let hivebriteId = meResponse.data.admin.id
      */

      // Check user in deepbloo bdd
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    userId AS "userId", 
                  hivebriteId AS "hivebriteId", 
                  type AS "type", 
                  email AS "email", 
                  username AS "username", 
                  password AS "password" 
        FROM      user 
        WHERE     email = '${BddTool.ChaineFormater(username, BddEnvironnement, BddId)}' 
        AND       password = '${BddTool.ChaineFormater(password, BddEnvironnement, BddId)}' 
      `
      // WHERE     hivebriteId = ${BddTool.NumericFormater(hivebriteId, BddEnvironnement, BddId)} 
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let user = {}
      for (let record of recordset) {
        user = { 
          userId: record.userId,
          hivebriteId: record.hivebriteId,
          type: record.type,
          email: record.email,
          username: record.username
        }
      }

      if (!user || !user.userId) {
        throw new Error('User unknown !')
      }

      // Get hivebrite user info
      if (user.hivebriteId) {
        await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').TokenGet()
        let userResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`/api/admin/v1/users/${user.hivebriteId}`)
        if (userResponse && userResponse.data && userResponse.data.user && userResponse.data.user.photo) {
          user.photo = userResponse.data.user.photo['large-url']
        }
      }

      // Creat user token
      let certText = 'certTest'
      let token = jwt.sign({ userId: user.userId, hivebriteId: user.hivebriteId, type: user.type, email: user.email, username: user.username, photo: user.photo }, certText, { algorithm: 'HS256'})
      
      resolve({
        user,
        token
      })
    } catch (err) { reject(err) }
  })
}

exports.List = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      // Get ticket list
      var users = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = `
        SELECT    userId AS "userId", 
                  hivebriteId AS "hivebriteId", 
                  type AS "type", 
                  email AS "email", 
                  username AS "username", 
                  password AS "password", 
                  membershipFree AS "membershipFree", 
                  organizationId AS "organizationId", 
                  country AS "country", 
                  countryCode AS "countryCode", 
                  photo AS "photo" 
        FROM      user 
      `
      if (filter) {
        let where = ``
        if (filter.userId) {
          if (where !== '') { where += 'AND ' }
          where += `userId = ${BddTool.NumericFormater(filter.userId, BddEnvironnement, BddId)} \n`
        }
        if (filter.organizationId) {
          if (where !== '') { where += 'AND ' }
          where += `organizationId = ${BddTool.NumericFormater(filter.organizationId, BddEnvironnement, BddId)} \n`
        }
        if (filter.type) {
          if (where !== '') { where += 'AND ' }
          where += `type = ${BddTool.NumericFormater(filter.type, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      for (var record of recordset) {
        users.push({
          userId: record.userId,
          hivebriteId: record.hivebriteId,
          type: record.type,
          email: record.email,
          username: record.username,
          password: record.password,
          membershipFree: record.membershipFree,
          organizationId: record.organizationId,
          country: record.country,
          countryCode: record.countryCode,
          photo: record.photo,
        })
      }
      resolve(users);
    } catch (err) { reject(err) }
  })
}

exports.User = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = null
      let filter = {
        userId
      }
      let users = await this.List(filter)
      if (users && users.length > 0) {
        user = users[0]
      }
      resolve(user);
    } catch (err) { reject(err) }
  })
}

exports.Memberships = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await this.User(userId)

      // Get hivebrite user info
      let memberships = null
      if (user.hivebriteId) {
        let membershipsResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users/${user.hivebriteId}/memberships`)
        memberships = membershipsResponse.data.memberships
      }
      
      let isPremiumMembership = false;
      for (let membership of memberships) {
        if (
          membership.status === "paid"
          && new Date(membership.expires_at) > new Date()
          // && membership.type_name.startsWith('Premium Membership')
        ) {
          isPremiumMembership = true
        }
      }

      let userUpdate = false
      if (isPremiumMembership && user.type !== 1 && user.type !== 2) {
        user.type = 2
        userUpdate = true
      }
      if (!isPremiumMembership && user.type === 2) {
        user.type = 3
        userUpdate = true
      }
      if (userUpdate) {
        await this.AddUpdate(user)
      }

      resolve({
        isPremiumMembership,
        memberships,
        hasFree : user.membershipFree > 0
      });
    } catch (err) { reject(err) }
  })
}

exports.AddUpdate = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let userNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', user)
      resolve(userNew);
    } catch (err) { reject(err) }
  })
}

exports.Synchro = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get hivebrite user list
      await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').TokenGet()
      let users = []
      let userTotal = 1
      let currentPage = 1
      while (users.length < userTotal && currentPage < 200) {
        let usersResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users?page=${currentPage}&per_page=500`)
        users = users.concat(usersResponse.data.users)
        userTotal = usersResponse.headers["x-total"]
        currentPage++
      }

      let usersBdd = await this.List()

      // Update user bdd list
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      for (let user of users) {
        let userBdd = usersBdd.find(a => a.email === user.email)
        if (!userBdd) {
          userBdd = {
            hivebriteId: user.id,
            type: 3,
            email: user.email,
            username: user.name,
            creationDate: new Date(),
            updateDate: new Date()
          }
          userBdd = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
        } else {
          if (
            userBdd.hivebriteId !== user.id
            || userBdd.hivebriteId !== user.id
            || userBdd.email !== user.email
            || userBdd.username !== user.name
          ) {
            userBdd.hivebriteId = user.id
            userBdd.email = user.email
            userBdd.username = user.name
            userBdd.updateDate = new Date()
            await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
          }
        }
      }
      resolve(users.length);
    } catch (err) { reject(err) }
  })
}

exports.SynchroFull = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get hivebrite user list
      await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').TokenGet()
      let users = []
      let userTotal = 1
      let currentPage = 1
      while (users.length < userTotal && currentPage < 200) {
        let usersResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users?page=${currentPage}&per_page=500`)
        users = users.concat(usersResponse.data.users)
        userTotal = usersResponse.headers["x-total"]
        currentPage++
      }

      let usersBdd = await this.List()
      let organizationsBdd = await require(process.cwd() + '/controllers/Organization/MdlOrganization').List()
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      // Update user bdd list
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      for (let user of users) {
        let userBdd = usersBdd.find(a => a.email === user.email)

        // Get user organization by user experiences
        let organizationId = 0
        let userExperiencesResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users/${user.id}/experiences`)
        if (userExperiencesResponse.data.experiences.length > 0) {
          let experiences = userExperiencesResponse.data.experiences.sort((a, b) => {
            return a.id > b.id ? -1 : a.id < b.id ? 1 : 0;
          });
          let organizationDgmarketId = experiences[0].companies_company_id
          organization = organizationsBdd.find(a => a.dgmarketId === organizationDgmarketId)
          if (organization) {
            organizationId = organization.organizationId
          }
        }

        // Get user country
        let userResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users/${user.id}`)
        let userData = userResponse.data.user
        let country = ''
        let countryCode = ''
        if (userData.live_location) {
          country = userData.live_location.country
          countryCode = userData.live_location.country_code
        }

        // Get user photo
        let photo = ''
        if (userData.photo && userData.photo['large-url']) {
          photo = userData.photo['large-url']
        }

        if (!userBdd) {
          userBdd = {
            hivebriteId: user.id,
            type: 3,
            email: user.email,
            username: user.name,
            organizationId: organizationId,
            country: country,
            countryCode: countryCode,
            photo: photo,
            creationDate: new Date(),
            updateDate: new Date()
          }
          userBdd = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
        } else {
          if (
            userBdd.hivebriteId !== user.id
            || userBdd.hivebriteId !== user.id
            || userBdd.email !== user.email
            || userBdd.username !== user.name
            || userBdd.organizationId !== organizationId
            || userBdd.country !== country
            || userBdd.countryCode !== countryCode
            || userBdd.photo !== photo
          ) {
            userBdd.hivebriteId = user.id
            userBdd.email = user.email
            userBdd.username = user.name
            userBdd.organizationId = organizationId
            userBdd.country = country
            userBdd.countryCode = countryCode
            userBdd.photo = photo
            userBdd.updateDate = new Date()
            await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
          }
        }

        // Get user cpv
        let cpvData = userData.custom_attributes.find(a => a.name === '_CPV')
        let cpvs = []
        if (cpvData) {
          let cpvLabels = cpvData.value
          if (cpvLabels && cpvLabels.length > 0) {
            for (cpvLabel of cpvLabels) {
              let label = cpvLabel.split('-').join(' ').trim()
              let cpv = CpvList.find(a => a.label === label)
              if (cpv && !cpvs.find(a => a.label === label)) {
                cpvs.push(cpv)
              }
            }
          }
          cpvs = cpvs
        }
        
        let query = `
            DELETE FROM userCpv 
            WHERE userId = ${userBdd.userId} 
        `
        await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
        for (let cpv of cpvs) {
          let userCpv= {
            userId: userBdd.userId,
            cpvCode: cpv.code,
            cpvName: cpv.label.trim(),
            origineType: cpv.origineType,
            rating: cpv.rating,
          }
          await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'userCpv', userCpv)
        }
      }

      resolve(users.length);
    } catch (err) { reject(err) }
  })
}

exports.SetPremium = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')

      let user = await this.User(userId)

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      user.type = 2
      if (!user.password || user.password.trim() === '') {
        user.password = Math.random().toString(36).slice(-10)
      }
      await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', user)
      resolve(user);
    } catch (err) { reject(err) }
  })
}

exports.Opportunity = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let query = ''
      let recordset = null

      let user = await this.User(userId)
      let organization = null
      if (user.organizationId) {
        organization = await require(process.cwd() + '/controllers/Organization/MdlOrganization').Organization(user.organizationId)
        let filter = {
          organizationId: organization.organizationId
        }
        organization.users = await this.List(filter)
      }


      let cpvs = []
      query = `
        SELECT      userCpv.cpvCode AS "userCpvCode", 
                    userCpv.cpvName AS "userCpvName", 
                    userCpv.origineType AS "userOrigineType", 
                    userCpv.rating AS "userRating" 
        FROM        userCpv 
        WHERE       userCpv.userId = ${user.userId} 
      `
      query += '  ORDER BY userCpv.cpvCode '
      recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let userCpvCode = null
      for (var record of recordset) {
        if (userCpvCode !== record.userCpvCode) {
          cpvs.push({
            code: record.userCpvCode,
            name: record.userCpvName.trim(),
            origineType: record.userOrigineType,
            rating: record.userRating,
          })
          userCpvCode = record.userCpvCode
        }
      }

      resolve({
        user,
        organization,
        cpvs,
      });
    } catch (err) { reject(err) }
  })
}