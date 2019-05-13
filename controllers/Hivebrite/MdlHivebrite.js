exports.TokenGet = () => {
  return new Promise((resolve, reject) => {
    const config = require(process.cwd() + '/config')
    require('axios').post(`${config.hivebriteUrl}oauth/token`, {
      grant_type: 'password',
      scope: 'admin',
      admin_email: 'stanislas@deepbloo.com',
      password: 'appli1806',
      client_id: 'b97245387eab5b1b57ac3135e8ba7fbac2399775844ba8a2fa70426fb0d26e55',
      client_secret: '24487443aee0962b24b678e9e6f90fec40b25fa645007d418681164423486166',
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      refresh_token: null,
    }).then(response => {
      config.hivebriteToken = response.data.access_token
      resolve(response.data)
    }).catch(err => { reject(err) })
  })
}

exports.MembershipSynchro = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await this.TokenGet()
      
      // Synchro new user
      await require(process.cwd() + '/controllers/User/MdlUser').Synchro()

      // Get memberships
      let memberships = []
      let membershipTotal = 1
      let currentPage = 1
      while (memberships.length < membershipTotal && currentPage < 200) {
        let membershipsResponse = await this.get(`api/admin/v2/memberships?page=${currentPage}&per_page=500`)
        memberships = memberships.concat(membershipsResponse.data.memberships)
        membershipTotal = membershipsResponse.headers["x-total"]
        currentPage++
      }

      // Synchro user type
      const config = require(process.cwd() + '/config')
      let userMemberships = []
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')
      for (let membership of memberships) {
        if (
          membership.status !== "paid"
          || new Date(membership.expires_at) < new Date()
        ) {
          continue
        }
        let userMembership = userMemberships.find(a => a.user.hivebriteId === membership.user_id)
        if (!userMembership) {
          // Search for internal id
          let query = `
            SELECT      userId AS "userId", 
                        hivebriteId AS "hivebriteId", 
                        type AS "type", 
                        email AS "email", 
                        username AS "username", 
                        password AS "password", 
                        membershipFree AS "membershipFree" 
            FROM        user 
            WHERE       type = 3 
            AND         hivebriteId = ${BddTool.NumericFormater(membership.user_id, BddEnvironnement, BddId)} 
          `
          let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
          for (let record of recordset) {
            userMemberships.push({
              user: {
                userId: record.userId,
                hivebriteId: record.hivebriteId,
                email: record.email,
                username: record.username,
                password: record.password,
                membershipFree: record.membershipFree
              },
              memberships: [ membership ],
              membership
            })
          }
        } else {
          userMembership.membership = membership
          userMembership.memberships.push(membership)
        }
      }

      for (let userMembership of userMemberships) {
        let user = userMembership.user
        let membership = userMembership.membership

        // If user already have take a premium Free Trial
        if (membership.type_name.startsWith("Premium Free Trial") && user.membershipFree === 1) {
          user.membershipFree = 2
          user.updateDate = new Date()
          await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', user)

          // Send email
          let to = user.email
          let subject = 'Deepbloo - login information'
          let text = `
            Dear ${user.username},

            Thanks for your interest but it seems that you had already chosen our Free Trial plan earlier and unfortunatelly this can not be renewed.

            If you would like to continue as a premium member on DEEPBLOO , please select one of our membership plans here: https://platform.deepbloo.com/memberships

            If you have any question, do not hesitate to contact us at info@deepbloo.com

            The Deepbloo team
          `
          let html = text.replace(/(?:\r\n|\r|\n)/g, '<br>')
          await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, to)
          await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, 'alexandre@deepbloo.com')
          await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, 'julie@deepbloo.com')
          await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, 'jeancazaux@hotmail.com')
          continue
        }

        if (membership.type_name.startsWith("Premium Free Trial") && !user.membershipFree) {
          user.membershipFree = 1
        }
        if (!user.password || user.password.trim() === '') {
          user.password = Math.random().toString(36).slice(-10)
        }
        user.type = 2
        user.updateDate = new Date()
        await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'user', user)
      
        // Send email
        let to = user.email
        let subject = 'Deepbloo - login information'
        let text = `
          Dear ${user.username},

          Please find your login and password to activate your DEEPBLOO premium account.
          (${membership.type_name})

          Login: ${user.email}
          Password: ${user.password}

          You can now go to the tender section here: https://platform.deepbloo.com/page/tenders

          And click on Login (blue button on the top left side) and enter your login and password.

          If you have any question, do not hesitate to contact us at info@deepbloo.com

          The Deepbloo team
        `
        let html = text.replace(/(?:\r\n|\r|\n)/g, '<br>')
        await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, to)
        await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, 'alexandre@deepbloo.com')
        await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, 'julie@deepbloo.com')
        await require(process.cwd() + '/controllers/CtrlTool').sendMail(subject, html, text, 'jeancazaux@hotmail.com')
      }

      resolve(userMemberships)
    } catch (err) { reject(err) }
  })
}

exports.delete = (url, param) => {
  return new Promise(async (resolve, reject) => {
    const config = require(process.cwd() + '/config')
    await this.TokenGet()
    const axios = require('axios');
    axios.defaults.baseURL = config.hivebriteUrl
    axios.defaults.headers.common = {'Authorization': `bearer ${config.hivebriteToken}`}
    axios.delete(url, param).then(response => {
      resolve(response)
    }).catch(err => { reject(err) })
  })
}

exports.get = (url, param) => {
    return new Promise(async (resolve, reject) => {
        const config = require(process.cwd() + '/config')
        await this.TokenGet()
        const axios = require('axios');
        axios.defaults.baseURL = config.hivebriteUrl
        axios.defaults.headers.common = {'Authorization': `bearer ${config.hivebriteToken}`}
        axios.get(url, param).then(response => {
            resolve(response)
        }).catch(err => { reject(err) })
    })
}

exports.VenturesGet = () => {
  return new Promise(async (resolve, reject) => {
    await this.TokenGet()
    let tenders = []
    let ventures = []
    let ventureDuplicates = []
    let pageCount = null
    let pagenum = 0
    for (let i = 1; i < 26; i++) {
      pagenum++
      let response = await this.get(`api/admin/v2/ventures?page=${pagenum}&per_page=100`)
      if (!pageCount) {
        pageCount = Math.ceil(parseInt(response.headers['x-total'], 10) / parseInt(response.headers['x-per-page'], 10))
        console.log(`Page count (${pageCount})`)
      }
      for (let venture of response.data.ventures) {
        // venture.pagenum = pagenum
        ventures.push(venture)
      }
    }
    ventures.reverse()
    let ventureNum = -1
    let ventureNbr = ventures.length
    let ventureDateNull = 0
    let ventureDateOk = 0
    for(let venture of ventures) {
      ventureNum++
      //feedable_at:"2019-02-19T00:00:00Z"
      if (!venture.feedable_at) { ventureDateNull++ }
      else {

      }
      // if (venture.company_name === 'Rural Restructuring Agency') { let toto = '' }
      venture.ventureNum = ventureNum
      let _DG_Market_ID = venture.customizable_attributes.find(a => a._DG_Market_ID)
      if (!_DG_Market_ID) { continue }
      let dgMarketId = _DG_Market_ID._DG_Market_ID
      let tender = tenders.find(a => a.dgMarketId === dgMarketId)
      if (!tender) {
        tenders.push({
          dgMarketId: dgMarketId,
          hivebriteId: venture.id,
          created_at: venture.created_at,
          ventureNum: ventureNum
        })
      } else {
        ventureDuplicates.push({
          tender,
          ventureNum,
          venture
        })
      }
    }
    console.log(`Venture date null (${ventureDateNull})`)
    // Delete duplicate tenders
    /*
    console.log(`Delete duplicate (${ventureDuplicates.length})`)
    for(let venture of ventureDuplicates) {
      try {
        await this.delete(`api/admin/v2/ventures/${venture.venture.id}`)
      } catch (error) {
        console.log(`Error ${venture.venture.id}`)
      }
    }
    */
    resolve(ventureDuplicates)
  })
}
