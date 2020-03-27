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
                  photo AS "photo", 
                  doNotContact AS "doNotContact",
                  notifPostEmail AS "notifPostEmail",
                  notifTripEmail AS "notifTripEmail",
                  notifEventEmail AS "notifEventEmail",
                  notifDigestEmail AS "notifDigestEmail",
                  notifCommentEmail AS "notifCommentEmail",
                  notifVentureEmail AS "notifVentureEmail",
                  notifBusinessRequest AS "notifBusinessRequest",
                  notifCurrentLocationEmail AS "notifCurrentLocationEmail",
                  notifEmailingComEmail AS "notifEmailingComEmail",
                  notifForumPostEmail AS "notifForumPostEmail",
                  notifContactByPhone AS "notifContactByPhone",
                  notifContactBySms AS "notifContactBySms",
                  notifContactByPost AS "notifContactByPost",
                  creationDate AS "creationDate",
                  updateDate AS "updateDate"
        FROM      user 
      `
      if (filter) {
        let where = ``
        if (filter.userId) {
          if (where !== '') { where += 'AND ' }
          where += `userId = ${BddTool.NumericFormater(filter.userId, BddEnvironnement, BddId)} \n`
        }
        if (filter.hivebriteId) {
          if (where !== '') { where += 'AND ' }
          where += `hivebriteId = ${BddTool.NumericFormater(filter.hivebriteId, BddEnvironnement, BddId)} \n`
        }
        if (filter.organizationId) {
          if (where !== '') { where += 'AND ' }
          where += `organizationId = ${BddTool.NumericFormater(filter.organizationId, BddEnvironnement, BddId)} \n`
        }
        if (filter.type) {
          if (where !== '') { where += 'AND ' }
          where += `type = ${BddTool.NumericFormater(filter.type, BddEnvironnement, BddId)} \n`
        }
        if (filter.types) {
          if (where !== '') { where += 'AND ' }
          where += `type IN (${BddTool.ArrayNumericFormater(filter.types, BddEnvironnement, BddId)}) \n`
        }
        if (filter.doNotContact) {
          if (where !== '') { where += 'AND ' }
          where += `doNotContact = ${BddTool.NumericFormater(filter.doNotContact, BddEnvironnement, BddId)} \n`
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
          doNotContact: record.doNotContact,
          notifPostEmail: record.notifPostEmail,
          notifTripEmail: record.notifTripEmail,
          notifEventEmail: record.notifEventEmail,
          notifDigestEmail: record.notifDigestEmail,
          notifCommentEmail: record.notifCommentEmail,
          notifVentureEmail: record.notifVentureEmail,
          notifBusinessRequest: record.notifBusinessRequest,
          notifCurrentLocationEmail: record.notifCurrentLocationEmail,
          notifEmailingComEmail: record.notifEmailingComEmail,
          notifForumPostEmail: record.notifForumPostEmail,
          notifContactByPhone: record.notifContactByPhone,
          notifContactBySms: record.notifContactBySms,
          notifContactByPost: record.notifContactByPost,
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
          && membership.type_name.startsWith('Premium Membership')
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
          const userBdds = await this.List({hivebriteId : user.hivebriteId});
          if (userBdds && userBdds.length) {
            const userBdd = userBdds[0]
            user = {
              ...userBdd,
              ...user
            }
          }
          await this.AddUpdate(user)
        }
      }

      const data = {
        ...user,
        isFreeMembership,
        isPremiumMembership,
        isBusinessMembership,
        memberships,
        hasFree : user.membershipFree > 0
      }
      resolve(data)
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
            username: user.name.substring(0, 100),
            creationDate: new Date(),
            updateDate: new Date()
          }
          userBdd = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
        } else {
          if (
            userBdd.hivebriteId !== user.id
            || userBdd.hivebriteId !== user.id
            || userBdd.email !== user.email
            || userBdd.username.substring(0, 100) !== user.name.substring(0, 100)
          ) {
            userBdd.hivebriteId = user.id
            userBdd.email = user.email
            userBdd.username = user.name.substring(0, 100)
            userBdd.updateDate = new Date()
            await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
          }
        }
      }
      resolve(users.length);
    } catch (err) { reject(err) }
  })
}

exports.SynchroAllFullLight = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await this.SynchroAllFull(1, 100)
      resolve(data);
    } catch (err) { reject(err) }
  })
}

exports.SynchroAllFull = (pageNbr, perPage) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get hivebrite user list
      await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').TokenGet()
      if (!perPage) {
        perPage = 500
      }
      let users = []
      let userTotal = 1
      let currentPage = 1
      let usersResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users?page=1&per_page=1`)
      const pageTotal = Math.ceil(parseInt(usersResponse.headers["x-total"]) / perPage) + 1
      while (users.length < userTotal && currentPage < 200) {
        usersResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users?page=${pageTotal - currentPage}&per_page=${perPage}`)
        users = users.concat(usersResponse.data.users)
        userTotal = usersResponse.headers["x-total"]
        currentPage++
        if (pageNbr && currentPage > pageNbr) {
          break
        }
      }

      let usersBdd = await this.List()
      let organizationsBdd = await require(process.cwd() + '/controllers/Organization/MdlOrganization').List()
      users = users.reverse();

      // Update user bdd list
      for (let user of users) {
        let userBdd = usersBdd.find(a => a.email === user.email);
        if (userBdd) {
          await this.SynchroFull(userBdd.userId, user, usersBdd, organizationsBdd);
        }
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

      // Get user notification settings
      let userNotificationSettingsResponse = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').get(`api/admin/v1/users/${userBdd.hivebriteId}/notification_settings`)
      if (userNotificationSettingsResponse.data.notification_settings) {
        const notificationSetting = userNotificationSettingsResponse.data.notification_settings
        user.notifBusinessRequest = notificationSetting.businessopportunities_request
        user.notifCommentEmail = notificationSetting.comment_email
        user.notifContactByPhone = notificationSetting.contact_by_phone
        user.notifContactByPost = notificationSetting.contact_by_post
        user.notifContactBySms = notificationSetting.contact_by_sms
        user.notifCurrentLocationEmail = notificationSetting.current_location_email
        user.notifDigestEmail = notificationSetting.digest_email
        user.notifEmailingComEmail = notificationSetting.emailing_communication_email
        user.notifEventEmail = notificationSetting.event_email
        user.notifForumPostEmail = notificationSetting.forum_post_email
        user.notifPostEmail = notificationSetting.post_email
        user.notifTripEmail = notificationSetting.trip_email
        user.notifVentureEmail = notificationSetting.ventures_comment_email
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
          username: user.name.substring(0, 100),
          organizationId: organizationId,
          country: country,
          countryCode: countryCode,
          regions: regions,
          photo: photo,
          doNotContact: userData.do_not_contact,
          notifPostEmail: user.notifPostEmail,
          notifTripEmail: user.notifTripEmail,
          notifEventEmail: user.notifEventEmail,
          notifDigestEmail: user.notifDigestEmail,
          notifCommentEmail: user.notifCommentEmail,
          notifVentureEmail: user.notifVentureEmail,
          notifBusinessRequest: user.notifBusinessRequest,
          notifCurrentLocationEmail: user.notifCurrentLocationEmail,
          notifEmailingComEmail: user.notifEmailingComEmail,
          notifForumPostEmail: user.notifForumPostEmail,
          notifContactByPhone: user.notifContactByPhone,
          notifContactBySms: user.notifContactBySms,
          notifContactByPost: user.notifContactByPost,
          creationDate: new Date(),
          updateDate: new Date()
        }
        userBdd = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', userBdd)
      } else {
        if (
          userBdd.email !== user.email
          || userBdd.username.substring(0, 100) !== user.name.substring(0, 100)
          || userBdd.organizationId !== organizationId
          || userBdd.country !== country
          || userBdd.countryCode !== countryCode
          || userBdd.regions !== regions
          || userBdd.photo !== photo
          || userBdd.doNotContact !== userData.do_not_contact          
          || userBdd.notifPostEmail !== user.notifPostEmail
          || userBdd.notifTripEmail !== user.notifTripEmail
          || userBdd.notifEventEmail !== user.notifEventEmail
          || userBdd.notifDigestEmail !== user.notifDigestEmail
          || userBdd.notifCommentEmail !== user.notifCommentEmail
          || userBdd.notifVentureEmail !== user.notifVentureEmail
          || userBdd.notifBusinessRequest !== user.notifBusinessRequest
          || userBdd.notifCurrentLocationEmail !== user.notifCurrentLocationEmail
          || userBdd.notifEmailingComEmail !== user.notifEmailingComEmail
          || userBdd.notifForumPostEmail !== user.notifForumPostEmail
          || userBdd.notifContactByPhone !== user.notifContactByPhone
          || userBdd.notifContactBySms !== user.notifContactBySms
          || userBdd.notifContactByPost !== user.notifContactByPost
        ) {
          userBdd.email = user.email
          userBdd.username = user.name.substring(0, 100)
          userBdd.organizationId = organizationId
          userBdd.country = country
          userBdd.countryCode = countryCode
          userBdd.regions = regions
          userBdd.photo = photo
          userBdd.doNotContact = userData.do_not_contact
          userBdd.notifPostEmail = user.notifPostEmail
          userBdd.notifTripEmail = user.notifTripEmail
          userBdd.notifEventEmail = user.notifEventEmail
          userBdd.notifDigestEmail = user.notifDigestEmail
          userBdd.notifCommentEmail = user.notifCommentEmail
          userBdd.notifVentureEmail = user.notifVentureEmail
          userBdd.notifBusinessRequest = user.notifBusinessRequest
          userBdd.notifCurrentLocationEmail = user.notifCurrentLocationEmail
          userBdd.notifEmailingComEmail = user.notifEmailingComEmail
          userBdd.notifForumPostEmail = user.notifForumPostEmail
          userBdd.notifContactByPhone = user.notifContactByPhone
          userBdd.notifContactBySms = user.notifContactBySms
          userBdd.notifContactByPost = user.notifContactByPost
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
      const userMembership = await this.Memberships(userBdd.userId);
      if (userMembership) {
        userBdd = {
          ...userBdd,
          ...userMembership
        }
      }

      resolve(userBdd)
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

      let tenderText = `tenderId;region;regionSub;country;title;description;publication;bidDeadline;bidDeadlineStatus;buyerName;email;noticeType;cpvs;url\n`
      if (tenderIds) {
        for (let tenderId of tenderIds) {
          const tender = await  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(tenderId)
          let description = tender.description.substring(0, 1000)
          description = description.split(';').join(',')
          description = description.split('\r\n').join(' ').trim()
          description = description.split('\r').join(' ').trim()
          description = description.split('\n').join(' ').trim()
          description = description.trim()
          let title = tender.title.substring(0, 1000)
          title = title.split(';').join(',')
          title = title.split('\n').join(' ').trim()
          title = title.trim()
          let cpvDescriptions = tender.cpvDescriptions
          cpvDescriptions = cpvDescriptions.split(',').join(';')
          cpvDescriptions = cpvDescriptions.split('-').join(' ')
          cpvDescriptions = cpvDescriptions.trim()
          const regionInfoSource = require(`${process.cwd()}/controllers/CtrlTool`).regionFromCountry(tender.country)
          let bidDeadlineStatus = 'Live - expiry > 1 week'
          let bidDeadlineDateText = ''
          if (tender.bidDeadlineDate && tender.bidDeadlineDate.trim() !== '') {
            try {
              bidDeadlineDateText = `${tender.bidDeadlineDate.substring(0, 4)}-${tender.bidDeadlineDate.substring(4, 6)}-${tender.bidDeadlineDate.substring(6, 8)}`
              let termDate = new Date(bidDeadlineDateText)
              if (!termDate || isNaN(termDate)) {
                termDate = new Date()
              }
              let expiredLimit = new Date()
              if (termDate < expiredLimit) {
                bidDeadlineStatus = 'Expired'
              } else {
                let dateLimit = new Date()
                dateLimit.setDate(dateLimit.getDate() + 7)
                if (termDate < dateLimit) {
                  bidDeadlineStatus = 'Live - expiry < 1 week'
                }
              }
              bidDeadlineDateText = `${tender.bidDeadlineDate.substring(6, 8)}/${tender.bidDeadlineDate.substring(4, 6)}/${tender.bidDeadlineDate.substring(0, 4)}`
            } catch (err) {
              console.log(err)
            }
          }
          let publicationDate = ''
          if (tender.publicationDate && tender.publicationDate.trim() !== '') {
            try {
              publicationDate = `${tender.publicationDate.substring(6, 8)}/${tender.publicationDate.substring(4, 6)}/${tender.publicationDate.substring(0, 4)}`
            } catch (err) {
              console.log(err)
            }
          }
          let tenderUrl = `https://dsqgapbuwsfze.cloudfront.net/#/tenders?tenderId=${tenderId}`
          tenderText += `${tenderId};${regionInfoSource.region || ''};${regionInfoSource.regionSub || ''};${tender.country};${title};${description};${publicationDate};${bidDeadlineDateText};${bidDeadlineStatus};${tender.buyerName};${tender.contactEmail};${tender.noticeType};${cpvDescriptions};${tenderUrl}\n`
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

exports.SendPeriodicDashboard = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const moment = require('moment')
      const htmlToText = require('html-to-text')

      const types = [1, 2, 4, 5]
      let users = await this.List({ types })

      let emailSents = []
      for (const user of users) {
        const dataSynchroFull = await this.SynchroFull(user.userId)
        if (
          !dataSynchroFull
          || !dataSynchroFull.type
          || !types.includes(dataSynchroFull.type)
        ) {
          continue
        }
        let to = user.email.trim()
        /*
        if (to !== 'rob@rvesol.com') {
          continue
        }
        if (user.userId !== 2) {
          continue
        }
        */
        if (dataSynchroFull.doNotContact === 1) {
          continue
        }
        if (dataSynchroFull.notifEmailingComEmail !== 1) {
          continue
        }
        let userCpvs = await this.UserCpvs(dataSynchroFull.userId)
        let cpvLabels = userCpvs.map(a => a.cpvName)
        let regions = dataSynchroFull.regions.trim()
        let termDateMin = new Date()
        if (cpvLabels === '' || to === '') {
          continue
        }
        let limit = 5000
        let orderBy = 'publicationDate DESC'
        let tenders = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderList(null, null, null, null, termDateMin, null, cpvLabels, regions, limit, null, null, orderBy)
        tenders = tenders.filter(a => a.noticeType !== 'Contract Award')
        if (!tenders || !tenders.length) {
          continue
        }
        tenders.sort((a, b) => {
          return a.publicationDate < b.publicationDate ? 1 : -1
        })
        let tenderMax = 4
        let subject = `DeepBloo - Business opportunities`

        // Text version
        let text = ``
        text += `Dear ${user.username},\r\n`
        text += `\r\n`
        text += `Please find your summary of business opportunities corresponding to your profile (${cpvLabels} in ${regions}).\r\n`
        text += `\r\n`
        text += `There are ${tenders.length} live opportunities (not yet expired) corresponding to your criteria.\r\n`
        text += `\r\n`
        text += `Regards\r\n`
        text += `The Deepbloo Team\r\n`
        text += `Mail desinscription\r\n`

        // HTML version
        let html = ``
        html += `Dear ${user.username},<br>`
        html += `<br>`
        html += `Please find your summary of business opportunities corresponding to your profile (${cpvLabels} in ${regions}).<br>`
        html += `<br>`

        html += `<table cellpadding=2 cellspacing=0 style="width: 100%;">`
        html += `  <tr style="background-color: #494949; color: #ffffff; text-align: center; font-size: 0.8em;">`
        html += `    <td>CPV</td>`
        html += `    <td>Country</td>`
        html += `    <td style="min-width: 100px; max-width: 100px;">Publication</td>`
        html += `    <td style="min-width: 100px; max-width: 100px;">Bid deadline</td>`
        html += `    <td>Description</td>`
        html += `    <td>Link to tender</td>`
        html += `  </tr>`
        let tenderNum = -1
        for (const tender of tenders) {
          tenderNum++
          if (tenderNum > tenderMax) {
            continue
          }
          const description = htmlToText.fromString(tender.description);
          html += `  <tr style="font-size: 0.9em;">`
          html += `    <td style="border-bottom: 1px solid #d6d6d6; width: 40%;">`
          html += `      ${tender.cpvDescriptions.substring(0, 150)}...`
          html += `    </td>`
          html += `    <td style="border-bottom: 1px solid #d6d6d6; padding-right: 15px;">`
          html += `      ${tender.country}`
          html += `    </td>`
          html += `    <td style="border-bottom: 1px solid #d6d6d6;">`
          html += `      ${moment(tender.publicationDate).format('YYYY-MM-DD')}`
          html += `    </td>`
          html += `    <td style="border-bottom: 1px solid #d6d6d6;">`
          html += `      ${moment(tender.bidDeadlineDate).format('YYYY-MM-DD')}`
          html += `    </td>`
          html += `    <td style="border-bottom: 1px solid #d6d6d6; width: 60%;">`
          html += `      ${description.substring(0, 150)}...`
          html += `    </td>`
          html += `    <td style="border-bottom: 1px solid #d6d6d6;">`
          html += `      <a href="https://dsqgapbuwsfze.cloudfront.net/#/tender?tenderId=${tender.id}" target="_blank">#${tender.id}</a>`
          html += `    </td>`
          html += `  </tr>`
        }
        html += `</table>`
        html += `<br>`

        if (user.type === 1 || user.type === 4) {
          html += `There are <span style="color: #3498DB; font-weight: 600;">${tenders.length - tenderMax}</span> more live opportunities (not yet expired) corresponding to your criteria. To check them, go to your Business+ interface<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://platform.deepbloo.com/page/tenders" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">GO TO MY BUSINESS+</a></div>`
          html += `<br>`
          html += `You can as well  update your business preferences in order to change your CPV's and Business areas to adjust your pipeline and the opportunities you will receive by email.<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://platform.deepbloo.com/users/${user.hivebriteId}" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">UPDATE MY BUSINESS PREFERENCES</a></div>`
          html += `<br>`
          html += `If you want to add more sources, to specify your own keywords to find relevant tenders or access to stats and dashboards of your pipeline, please contact us.<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://zfrmz.com/mboskCSG6TIFctLumTgb" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">Contact us</a></div>`
        } else if (user.type === 2) {
          html += `There are <span style="color: #3498DB; font-weight: 600;">${tenders.length - tenderMax}</span> more live opportunities (not yet expired) corresponding to your criteria.<br>`
          html += `<br>`
          html += `You can update your business preferences in order to change your CPV’s and Business areas to adjust the type of opportunities you will receive by email.<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://platform.deepbloo.com/users/${user.hivebriteId}" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">UPDATE MY BUSINESS PREFERENCES</a></div>`
          html += `<br>`
          html += `If you want to Go on "Business+" membership in order to a access to a private pipeline of opportunities, add more sources, specify your own keywords to find relevant tenders, access to stats and dashboards of your pipeline or ask any other question, please contact us.<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://zfrmz.com/mboskCSG6TIFctLumTgb" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">Contact us</a></div>`
        } else if (user.type === 5) {
          html += `There are <span style="color: #3498DB; font-weight: 600;">${tenders.length - tenderMax}</span> more live opportunities (not yet expired) corresponding to your criteria.  To check them, go to your Business+ interface.<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://platform.deepbloo.com/page/tenders" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">GO TO MY BUSINESS+</a></div>`
          html += `<br>`
          html += `You can as well update your business preferences in order to change your CPV’s and Business areas to adjust your private pipeline and the opportunities you will receive by email.<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://platform.deepbloo.com/users/${user.hivebriteId}" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">UPDATE MY BUSINESS PREFERENCES</a></div>`
          html += `<br>`
          html += `If you want to get a demo, add more sources, specify your own keywords to find relevant tenders, access to stats and dashboards of your pipeline or for any other queries, please contact us.<br>`
          html += `<br>`
          html += `<div style="text-align: center; padding: 10px 0px 10px 0px; font-size: 0.9em;"><a href="https://zfrmz.com/mboskCSG6TIFctLumTgb" target="_blank" style="background-color: #3498DB; color: #ffffff; padding: 12px 45px; text-decoration: none;">Contact us</a></div>`
        }

        html += `<br>`
        html += `<br>`
        html += `Regards<br>`
        html += `The Deepbloo Team<br>`
        html += `<br>`
        html += `
          <div style="color:#707070; font-family:'Helvetica Neue',Arial; font-size:12px; line-height:125%; text-align:center">
            <p style="margin:0cm 0cm 0.0001pt; text-align:justify"><span style="font-size:9px"><span style="font-style:normal"><span style="font-variant-caps:normal"><span style="font-weight:normal"><span style="letter-spacing:normal"><span style="text-transform:none"><span style="white-space:normal"><span style="word-spacing:0px"><span style="text-decoration:none"><span style="font-family:&quot;Avenir Roman&quot;,sans-serif"><span style="color:#4e5f70">You are receiving this email because you have registered to Deepbloo.</span></span></span></span></span></span></span></span></span></span></span></p>
            <p style="margin:0cm 0cm 0.0001pt; text-align:justify"><span style="font-size:9px"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style=""><span style="font-style:normal"><span style="font-variant-caps:normal"><span style="font-weight:normal"><span style="letter-spacing:normal"><span style="text-transform:none"><span style="white-space:normal"><span style="word-spacing:0px"><span style="text-decoration:none"><span style="font-family:&quot;Avenir Roman&quot;,sans-serif"><span style="color:#4e5f70">To consult our privacy policy&nbsp;</span><a href="https://u172330.ct.sendgrid.net/wf/click?upn=zeOWIoPpUAD-2Bm3dwHtzRoAYoeTMO24wXPp9y0NGsdFaMT1lb6dU6K6RwQSKuv-2FBN_I3RLVHD7ifj0d9uzTyteqFcTKHbFdRlFxkGAEN5vQUMQ5FJe7XXdCmmksnHWsp31j6WBitxFmgON7jZ-2BHxF1ZYIRDFecQq8J7Sn4HLrFjFOH3IB1HYqEByzExGaJW3L9N2mH9bsXD2iD6Az1csDNuNmo6Qwyi8vn8Y2TEnLM2kdq20oiNlWUMINbZhzvkJAckD2XLJuqRE4xYB2js6CoqUBZAnAbHQ2WRlTfc24uTbLKibkNgRyjyI1ccYlDxd15gRnr0Qmli4A1c9198TA8SAAwgsJ-2F-2FJ-2F2NmNn14T0KUOGPHHZDLSpyV31qMRN0G9P-2Bt0AIUyCMVRfjMBcI9fgDQ-3D-3D" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="text-decoration:none; color:#0250ac"><span style="color:#4e5f70">click here.</span></a><span style="color:#4e5f70">&nbsp;</span></span></span></span></span></span></span></span></span></span></span></span></span></p>
            <p style="margin:0cm 0cm 0.0001pt; text-align:justify"><span style="font-size:9px"><span style="font-style:normal"><span style="font-variant-caps:normal"><span style="font-weight:normal"><span style="letter-spacing:normal"><span style="text-transform:none"><span style="white-space:normal"><span style="word-spacing:0px"><span style="text-decoration:none"><span style="font-family:&quot;Avenir Roman&quot;,sans-serif"><span style="color:#4e5f70">To unsubscribe or to adjust your notification settings&nbsp;</span><a href="https://u172330.ct.sendgrid.net/wf/click?upn=Ise1EV3nrZfVL9kUOtCnu-2Ba7fMJ3gvJ35zfgB7LcpFyGQblxfJrX5dghf2-2B-2BFI5lITAZOj0LnXkcM74X9e7yHhpI0iRIY5PROKVOADEdrB7eidWGtwGPnAvCU-2B6fMi87ie3mTvRRwZuosThseWwl-2B1eKaJIq4c-2BJOKYX9cb7pWYuy79m-2FGiEn562WXSDYngtUJWZ7O4cXV7S-2Fah2PzFeHY-2BYit-2FqRByEre0M3ZIWLewCKwg69R48MsB5DbRaibNuj6Mw-2BYL6Iqed8XSsktVkCfSmG9zKxslHfDN7qTnjXN-2B8rORWcciNpzeCNapxaROHAK6L5eSpYidE3dorR3Lsgv3-2F1CVelOwFc-2BPhAH3h2GuCKcHDvnW-2BWNn-2BAanfRzhrAFfNuP-2FkpvZkEtFxB2eYibdCbb12CZ8dq3KF5SOC68t0ttu-2BWjxUChlDMom2XdReFRTnFUYix2XokOCvqjqBIKZbUwmHo1312yOIhUXqTxj1XRnui-2FZMZMJ5cYBAe-2FfqnbPnyRgSZ7LIZfuvetg9YuPnH5PyoC7RywAVj4PgB0GFr-2Bqu4F3ys26kMJXKFvzE54v9F3HT6aU3I-2B6EGy-2FBf1RTBsa5-2BoSYV9jpXCxAT8Q0WQ2m1b7n1vhUh0N9hNSPfV4Ajg2oSn0aaq9IzL2tTiVS4RSwM9lmAJtR8g-2FNKd4yjIYM5Pl7ns6FDQ9O-2BumSFDyZ1NcVKroVON-2B5wgwK-2BfGqFwoiwBGsFV-2BUyABDFXGhRY7oWRNjBN-2BNYkQMxy5P_I3RLVHD7ifj0d9uzTyteqFcTKHbFdRlFxkGAEN5vQUMQ5FJe7XXdCmmksnHWsp31j6WBitxFmgON7jZ-2BHxF1ZYIRDFecQq8J7Sn4HLrFjFOH3IB1HYqEByzExGaJW3L9N2mH9bsXD2iD6Az1csDNuNmo6Qwyi8vn8Y2TEnLM2kdq20oiNlWUMINbZhzvkJAcXjv0UUwf1MGpmGVU-2B9OPrBQ52kvC2U6eyirAPT1AVMNKwECmVmvDSNMrcUchnTrGFAYUg8Um-2BrC4xH3aX5aky5TtlD6rBYYfqLrTNCdHhVqlOQEZICd7z933Fj7UHhG2RgjD1KbOMiNcLF4odoQEOA-3D-3D" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="text-decoration:none; color:#0250ac"><span style="color:#4e5f70">click here.</span></a></span></span></span></span></span></span></span></span></span></span></p>
            <p style="margin:0cm 0cm 0.0001pt; text-align:justify"><span style="font-size:9px"><span style="font-style:normal"><span style="font-variant-caps:normal"><span style="font-weight:normal"><span style="letter-spacing:normal"><span style="text-transform:none"><span style="white-space:normal"><span style="word-spacing:0px"><span style="text-decoration:none"><span style="font-family:&quot;Avenir Roman&quot;,sans-serif"><span style="color:#4e5f70">To contact the administrator of Deepbloo&nbsp;</span><a href="mailto:alexfuegoguillemot@yahoo.fr" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="text-decoration:none; color:#0250ac"><span style="color:#4e5f70">click here.</span></a><span style="color:#4e5f70">&nbsp;</span></span></span></span></span></span></span></span></span></span></span></p>
            <p style="margin:0cm 0cm 0.0001pt; text-align:justify"><span style="font-size:10px"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-style:normal"><span style="font-variant-caps:normal"><span style="font-weight:normal"><span style="letter-spacing:normal"><span style="text-transform:none"><span style="white-space:normal"><span style="word-spacing:0px"><span style="text-decoration:none"><span style=""><span style="font-family:&quot;Helvetica Neue&quot;">&nbsp;</span></span></span></span></span></span></span></span></span></span></span></span></p>
          </div> 
        `
        emailSents.push({
          email: user.email,
          tendersLength: tenders.length
        })
        to = "jeancazaux@hotmail.com"
        await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, to)
      }

      resolve(emailSents)
    } catch (err) {
      reject(err)
    }
  })
}
