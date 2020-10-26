exports.synchro = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const moment = require('moment')

      let hivebriteUsers = await require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').users()

      // Get zoho access token
      let zohoTokenResponse = await require('axios').post(`https://accounts.zoho.com/oauth/v2/token?refresh_token=${config.zohoRefreshToken}&client_id=${config.zohoClientId}&client_secret=${config.zohoClientSecret}&grant_type=refresh_token`)
      const zohoHeaders = {
        'Authorization': `Zoho-oauthtoken ${zohoTokenResponse.data.access_token}`
      }

      // Get zoho contacts : DB_Membership_Type
      let contacts = []
      let moreRecord = true
      let page = 1
      while (moreRecord && page < 1000) {
        let zohoResponse = await require('axios').get(`${config.zohoUrl}crm/v2/Contacts?page=${page}`, { headers: zohoHeaders })
        contacts = contacts.concat(zohoResponse.data.data)
        moreRecord = zohoResponse.data.info.more_records
        page++
      }

      // Get DeepBloo users
      const users = await require(process.cwd() + '/controllers/User/MdlUser').List()

      // Find user to delete
      const userDeletes = []
      /*
      for (const contact of contacts) {
        const user = users.find(a => a.hivebriteId === contact.DB_ID)
        if (!user) {
          let response = await require('axios').delete(`${config.zohoUrl}crm/v2/Contacts/${contact.id}`, { headers: zohoHeaders })
          if (response.data.data[0].code !== 'SUCCESS') {
            let returnData = response.data.data[0]
            console.log(returnData)
          }
          userDeletes.push(contact)
        }
      }
      */

      // Find users to add or update
      const userAdds = []
      const userUpdates = []
      for (const user of users) {
        /*
        if (user.email === 'sales@tironi.com') {
          let toto = 1
        } else {
          continue
        }
        */

        if (!user.hivebriteId) {
          continue
        }

        const hivebriteUser = hivebriteUsers.find(a => a.id === user.hivebriteId)
        if (!hivebriteUser) {
          continue
        }

        let contact = contacts.find(a => a.DB_ID === user.hivebriteId)
        if (!contact) {
          contact = contacts.find(a => a.Email === hivebriteUser.email)
        }

        let cpvs = []
        if (hivebriteUser.custom_attributes && hivebriteUser.custom_attributes.find(a => a.name === '_CPV') && hivebriteUser.custom_attributes.find(a => a.name === '_CPV').value) {
          let cpvsText = hivebriteUser.custom_attributes.find(a => a.name === '_CPV').value.join(';')
          cpvs = cpvsText.split(';').map(a => a.trim())
          cpvs = cpvs.filter(a => a.trim() !== '')
          cpvs = Array.from(new Set(cpvs))
        }

        let DB_Do_not_contact = 'true'
        if (user.notifEmailingComEmail && !hivebriteUser.do_not_contact) {
          DB_Do_not_contact = 'false'
        }

        // Computed data
        const computed = {
          Email: hivebriteUser.email,
          Status_DB: hivebriteUser.confirmed_at ? 'YES' : 'NO',
          Secondary_Email: hivebriteUser.email2 && hivebriteUser.email2.trim() !== '' ? hivebriteUser.email2.trim() : null,
          First_Name: hivebriteUser.firstname,
          Last_Name: hivebriteUser.lastname,
          Full_Name: `${hivebriteUser.firstname} ${hivebriteUser.lastname}`,
          DB_ID: user.hivebriteId,
          DB_Do_not_contact,
          Mobile: hivebriteUser.mobile_pro || hivebriteUser.mobile_perso,
          Phone: hivebriteUser.landline_pro || hivebriteUser.landline_perso,
          CPV: cpvs,
          Business_Region: hivebriteUser.custom_attributes.find(a => a.name === '_Interested_in_business_opportunities_in_these_areas') && hivebriteUser.custom_attributes.find(a => a.name === '_Interested_in_business_opportunities_in_these_areas').value ? hivebriteUser.custom_attributes.find(a => a.name === '_Interested_in_business_opportunities_in_these_areas').value : [],
          DB_LinkedIn_URL: hivebriteUser.linkedin_profile_url && hivebriteUser.linkedin_profile_url.trim() !== '' ? hivebriteUser.linkedin_profile_url : null,
          DB_Country_code: hivebriteUser.postal_work && hivebriteUser.postal_work.country && hivebriteUser.postal_work.country.trim() !== '' ? hivebriteUser.postal_work.country.trim() : null,
          Mailing_Country: hivebriteUser.postal_work ? require(`${process.cwd()}/controllers/CtrlTool`).countryFromCode(hivebriteUser.postal_work.country) : null,
          Mailing_City: hivebriteUser.postal_work && hivebriteUser.postal_work.city && hivebriteUser.postal_work.city.trim() !== '' ? hivebriteUser.postal_work.city.trim() : null,
          Mailing_Zip: hivebriteUser.postal_work && hivebriteUser.postal_work.postal_code && hivebriteUser.postal_work.postal_code.trim() !== '' ? hivebriteUser.postal_work.postal_code.trim() : null,
          Mailing_Street: hivebriteUser.postal_work && hivebriteUser.postal_work.address_1 && hivebriteUser.postal_work.address_1.trim() !== '' ? hivebriteUser.postal_work.address_1.trim() : null,
          DB_Creation_Date: hivebriteUser.created_at ? hivebriteUser.created_at.replace('Z', '+01:00') : null,
          Tender_last_connexion_date: user.connexionTender ? moment(user.connexionTender).format() : null,
        }

        if (computed.DB_LinkedIn_URL && !computed.DB_LinkedIn_URL.startsWith('http')) {
          computed.DB_LinkedIn_URL = null
        }

        if (hivebriteUser.experiences && hivebriteUser.experiences.length) {
          const experience = hivebriteUser.experiences[0]
          computed.DB_Company_Position = experience.position && experience.position.trim() !== '' ? experience.position.trim() : null
          computed.DB_Industry = []
          if (experience.industry) {
            computed.DB_Industry.push(experience.industry.name)
          }
          if (experience.custom_attributes) {
            computed.DB_Company_last_job_desc = experience.custom_attributes.find(a => a.name === '_Description') && experience.custom_attributes.find(a => a.name === '_Description').value ? experience.custom_attributes.find(a => a.name === '_Description').value.substring(0, 250).trim().replace(/\s\s+/g, ' ') : null
            computed.DB_Organization_type = experience.custom_attributes.find(a => a.name === '_Company_Type') && experience.custom_attributes.find(a => a.name === '_Company_Type').value ? experience.custom_attributes.find(a => a.name === '_Company_Type').value : []
            computed.DB_Company_regional_area_of_acty = experience.custom_attributes.find(a => a.name === '_Regional_area_of_activity') && experience.custom_attributes.find(a => a.name === '_Regional_area_of_activity').value ? experience.custom_attributes.find(a => a.name === '_Regional_area_of_activity').value : []
          }
        }

        computed.DB_Membership_Type = []
        if (hivebriteUser.memberships && hivebriteUser.memberships.length) {
          const membership = hivebriteUser.memberships[0]
          computed.Live_Membership = "NO"
          if (membership.expires_at) {
            computed.DB_Membership_expiry_date = membership.expires_at.replace('Z', '+01:00')
            let expiryDate = new Date(membership.expires_at)
            if (expiryDate > new Date()) {
              computed.Live_Membership = "YES"
            }
          } else {
            computed.DB_Membership_expiry_date = null
          }
          computed.DB_Membership_Type.push(membership.type_name)
        }

        if (!contact) {
          if (computed.Last_Name && computed.Last_Name.trim() !== '') {
            userAdds.push(computed)
          }
          continue
        }

        let update = false
        for (const entrie in computed) {
          try {
            if (Array.isArray(contact[entrie])) {
              if (!contact[entrie] || !computed[entrie]) {
                update = true
              } else if (!contact[entrie] || contact[entrie].sort().join() !== computed[entrie].sort().join()) {
                update = true
              }
            } else if (
              contact[entrie]
              && computed[entrie]
              && typeof computed[entrie] === 'string'
              && contact[entrie].charAt(4) === '-'
              && contact[entrie].charAt(7) === '-'
              && contact[entrie].charAt(10) === 'T'
            ) {
              if (computed[entrie].substring(11, 13) > "20") {
                if (contact[entrie].substring(0, 7) !== computed[entrie].substring(0, 7)) {
                  update = true
                }
              } else if (contact[entrie].substring(0, 10) !== computed[entrie].substring(0, 10)) {
                update = true
              }
            } else if (
              contact[entrie]
              && computed[entrie]
              && typeof computed[entrie] === 'string'
            ) {
              if (contact[entrie].substring(0, 250).trim().replace(/\s\s+/g, ' ') !== computed[entrie].substring(0, 250).trim().replace(/\s\s+/g, ' ')) {
                update = true
              }
            } else if (contact[entrie] !== computed[entrie]) {
              update = true
            }
          } catch (err) { }
        }
        if (update) {
          userUpdates.push({
            user,
            contact,
            hivebriteUser,
            computed,
          })
        }
      }

      // Add zoho contacts
      let addCount = userAdds.length
      let chunks = []
      while (userAdds.length > 0) {
        chunks.push(userAdds.splice(0, 50))
      }
      for (const chunk of chunks) {
        const data = {
          data: chunk
        }
        let response = await require('axios').post(`${config.zohoUrl}crm/v2/Contacts`, data, { headers: zohoHeaders })
        if (
          response
          && response.data
          && response.data.data
          && response.data.data[0].code !== 'SUCCESS'
        ) {
          for (const index in response.data.data) {
            const data = response.data.data[index]
            const computed = chunk[index]
            let error = `${computed.DB_ID}|${data.code}|${data.details.api_name}|${data.details.expected_data_type}`
            console.log(error)
          }          
        }
      }

      // Update zoho contacts
      for (const userUpdate of userUpdates) {
        const contactId = userUpdate.contact.id
        const data = {
          data: [userUpdate.computed],
          trigger: [
            "approval"
          ]
        }
        let response = await require('axios').put(`${config.zohoUrl}crm/v2/Contacts/${contactId}`, data, { headers: zohoHeaders })
        if (response.data.data[0].code !== 'SUCCESS') {
          let returnData = response.data.data[0]
          console.log(returnData)
        }
      }

      resolve({
        addCount,
        updateCount: userUpdates.length,
        deleteCount: userDeletes.length,
      })
    } catch (err) { reject(err) }
  })
}
