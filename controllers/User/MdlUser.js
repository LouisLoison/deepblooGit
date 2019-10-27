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
                  regions AS "regions", 
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
          regions: record.regions,
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
      let user = null;
      let filter = {
        userId
      }
      let users = await this.List(filter);
      if (users && users.length > 0) {
        user = users[0];
      }
      resolve(user);
    } catch (err) { reject(err) }
  })
}

exports.UserCpvs = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let cpvs = [];
      let query = `
        SELECT      userCpv.cpvCode AS "cpvCode", 
                    userCpv.cpvName AS "cpvName", 
                    userCpv.origineType AS "origineType", 
                    userCpv.rating AS "rating" 
        FROM        userCpv 
        WHERE       userCpv.userId = ${userId} 
      `
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      for (var record of recordset) {
        cpvs.push({
          cpvCode: record.cpvCode,
          cpvName: record.cpvName,
          origineType: record.origineType,
          rating: record.rating,
        });
      }
      resolve(cpvs);
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
      
      let isFreeMembership = false;
      let isPremiumMembership = false;
      let isBusinessMembership = false;
      for (let membership of memberships) {
        if (
          membership.type_name.startsWith('Free Trial')
          && new Date(membership.expires_at) > new Date()
        ) {
          isFreeMembership = true
        }
        if (
          membership.status === "paid"
          && new Date(membership.expires_at) > new Date()
          // && membership.type_name.startsWith('Premium Membership')
        ) {
          isPremiumMembership = true
        }
        if (
          membership.status === "paid"
          && new Date(membership.expires_at) > new Date()
          && membership.type_name.startsWith('Business')
        ) {
          isBusinessMembership = true
        }
      }

      if (user.type !== 1) {
        let userUpdate = false
        if (isBusinessMembership && user.type !== 4) {
          user.type = 4
          userUpdate = true
        } else if (isPremiumMembership && user.type !== 2) {
          user.type = 2
          userUpdate = true
        } else if (isFreeMembership && user.type !== 5) {
          user.type = 5
          userUpdate = true
        }
        if (!isPremiumMembership && !isBusinessMembership && !isFreeMembership && user.type !== 3) {
          user.type = 3
          userUpdate = true
        }
        if (userUpdate) {
          await this.AddUpdate(user)
        }
      }

      resolve({
        isFreeMembership,
        isPremiumMembership,
        isBusinessMembership,
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

exports.SynchroAllFull = () => {
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
      users = users.reverse();

      // Update user bdd list
      for (let user of users) {
        let userBdd = usersBdd.find(a => a.email === user.email);
        await this.SynchroFull(userBdd.userId, user, usersBdd, organizationsBdd);
      }

      resolve(users.length);
    } catch (err) { reject(err) }
  })
}

exports.SynchroFull = (userId, user, usersBdd, organizationsBdd) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!usersBdd) {
        usersBdd = await this.List()
      }
      if (!organizationsBdd) {
        organizationsBdd = await require(process.cwd() + '/controllers/Organization/MdlOrganization').List()
      }
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')
      const RegionList = require(process.cwd() + '/public/constants/regions.json')

      // Update user bdd list
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let userBdd = usersBdd.find(a => a.userId === userId)
      if (!userBdd) {
        throw new Error("No available user id !")
      }

      if (!user) {
        let userExperiencesResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users/${userBdd.hivebriteId}`);
        user = userExperiencesResponse.data.user;
      }

      // Get user organization by user experiences
      let organizationId = 0
      let userExperiencesResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users/${userBdd.hivebriteId}/experiences`)
      if (userExperiencesResponse.data.experiences.length > 0) {
        let experiences = userExperiencesResponse.data.experiences.sort((a, b) => {
          let aValue = a.to
          if (!aValue) {
            aValue = '9999-99-99'
          }
          let bValue = b.to
          if (!bValue) {
            bValue = '9999-99-99'
          }
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        });
        // for (let experience of experiences) {
        //   let userExperienceResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/experiences/${experience.id}`);
        // }
        let organizationDgmarketId = experiences[0].companies_company_id
        organization = organizationsBdd.find(a => a.dgmarketId === organizationDgmarketId)
        if (organization) {
          organizationId = organization.organizationId
        }
      }

      // Get user country
      let userResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users/${userBdd.hivebriteId}`)
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

      // Get _Interested_in_business_opportunities_in_these_areas"
      let interesteAreaData = userData.custom_attributes.find(a => a.name === '_Interested_in_business_opportunities_in_these_areas');
      let interesteAreas = [];
      if (interesteAreaData) {
        let interesteAreaLabels = interesteAreaData.value;
        if (interesteAreaLabels && interesteAreaLabels.length > 0) {
          for (interesteAreaLabel of interesteAreaLabels) {
            let label = interesteAreaLabel.trim();
            interesteAreas.push(label);
          }
        }
      }
      let regions = interesteAreas.join(',');

      if (!userBdd) {
        userBdd = {
          hivebriteId: userBdd.hivebriteId,
          type: 3,
          email: user.email,
          username: user.name,
          organizationId: organizationId,
          country: country,
          countryCode: countryCode,
          regions: regions,
          photo: photo,
          creationDate: new Date(),
          updateDate: new Date()
        }
        userBdd = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
      } else {
        if (
          userBdd.email !== user.email
          || userBdd.username !== user.name
          || userBdd.organizationId !== organizationId
          || userBdd.country !== country
          || userBdd.countryCode !== countryCode
          || userBdd.regions !== regions
          || userBdd.photo !== photo
        ) {
          userBdd.email = user.email
          userBdd.username = user.name
          userBdd.organizationId = organizationId
          userBdd.country = country
          userBdd.countryCode = countryCode
          userBdd.regions = regions
          userBdd.photo = photo
          userBdd.updateDate = new Date()
          await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
        }
      }

      // Get user cpv
      let cpvData = userData.custom_attributes.find(a => a.name === '_CPV');
      let cpvs = [];
      if (cpvData) {
        let cpvLabels = cpvData.value;
        if (cpvLabels && cpvLabels.length > 0) {
          for (cpvLabel of cpvLabels) {
            let label = cpvLabel.split('-').join(' ').trim();
            let cpv = CpvList.find(a => a.label.toUpperCase() === label.toUpperCase());
            if (cpv && !cpvs.find(a => a.label.toUpperCase() === label.toUpperCase())) {
              cpvs.push(cpv);
            }
          }
        }
      }
      
      let query = `
          DELETE FROM userCpv 
          WHERE userId = ${userBdd.userId} 
      `;
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query);
      for (let cpv of cpvs) {
        let userCpv= {
          userId: userBdd.userId,
          cpvCode: cpv.code,
          cpvName: cpv.label.trim(),
          origineType: cpv.origineType,
          rating: cpv.rating,
        };
        await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'userCpv', userCpv);
      }

      // Synchro membership
      await this.Memberships(userBdd.userId);

      resolve(userBdd);
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

exports.OpportunityDownloadCsv = (tenderIds) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const moment = require('moment')
      tenderIds = tenderIds

      let tenderText = `cpvs;region;country;title;description;publication;bidDeadline;buyerName;email\n`
      if (tenderIds) {
        for (let tenderId of tenderIds) {
          const tender = await  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(tenderId)
          let description = tender.description.substring(0, 1000)
          description = description.split(';').join(',')
          description = description.split('\r\n').join(' ').trim()
          description = description.split('\r').join(' ').trim()
          description = description.split('\n').join(' ').trim()
          // description = ''
          description = description.trim()
          let title = tender.title.substring(0, 1000)
          title = title.split(';').join(',')
          title = title.split('\n').join(' ').trim()
          title = title.trim()
          tenderText += `${tender.cpvDescriptions};${tender.region};${tender.country};${title};${description};${tender.publicationDate};${tender.bidDeadlineDate};${tender.buyerName};${tender.contactEmail}\n`
        }
      }
      const fileName = `opportunities_${moment().format("YYYYMMDD_HHmmss")}.csv`
      const downloadPath = path.join(config.WorkSpaceFolder, 'Download/')
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath)
      }
      const tenderListLocation = path.join(downloadPath, fileName)
      fs.writeFileSync(tenderListLocation, tenderText)

      resolve({
        fileName: fileName, 
        url: `download/${fileName}`,
      });
    } catch (err) { reject(err) }
  })
}

exports.Notify = (userIds, subject, body, footerHtml, emails) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Send email
      if (userIds) {
        for (const userId of userIds) {
          const user = await require(process.cwd() + '/controllers/User/MdlUser').User(userId);
          if (!user || !user.email || user.email.trim() === '') {
            continue;
          }
          let to = user.email;
          let text = `${body.trim()}\r\n\r\n${footerHtml}`;
          let html = text.replace(/(?:\r\n|\r|\n)/g, '<br>')
          await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, to)
        }
      }
      if (emails) {
        for (const email of emails) {
          let to = email;
          let text = `${body.trim()}\r\n\r\n${footerHtml}`;
          let html = text.replace(/(?:\r\n|\r|\n)/g, '<br>')
          await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, to)
        }
      }
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
