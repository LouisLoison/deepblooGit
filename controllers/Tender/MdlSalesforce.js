exports.sendToSalesforce = (userId, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      var FormData = require('form-data')

      const tender = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(tenderId)
      if (!tender) {
        throw new Error(`Unknown tender #${tenderId}`)
      }

      const formData = new FormData()
      formData.append('username', "cau-sap@sediver.com.sediveruat")
      formData.append('password', "cauSAP2019")
      formData.append('grant_type', "password")
      formData.append('client_id', "3MVG9X0_oZyBSzHrpq1LAYOwqAkvdj00C8LzSXgfnqJwMVUHwbYGvHRGQQ0MLmLDCljJhRmQPrxn2YsGrUzC8")
      formData.append('client_secret', "EB6C295AD099E79CDF63A43F90D54EC75870E0B84101C060507CDE804E2D3876")
      let response = await require('axios').post(
        `https://test.salesforce.com/services/oauth2/token`,
        formData,
        { 
          headers: formData.getHeaders()
        }
      )
      let access_token = null
      if (
        response
        && response.data
        && response.data.access_token
      ) {
        access_token = response.data.access_token
      }
      if (!access_token) {
        throw new Error('No access token !')
      }

      let response2 = await require('axios').post(
        `https://sediver--sediveruat.my.salesforce.com/services/data/v50.0/sobjects/Project__c`, {
          Name: tender.title,
          Country__c: "a0A0Y00000Jjv3vUAB",
          Account_Name_DB__c: "TEST ACCOUNT NAME",
          BDD__c: "2020-12-20T14:23:44",
          Tender_Issue_Date__c: "2020-11-20T14:23:44",
          Status__c: "Postponed",
          CurrencyIsoCode: tender.currency,
          Scope__c: "Project scope here",
          Market_Segment__c: "Transmission",
          Application__c: "New Construction",
          Voltage1__c: 33,
          Financing_Note__c: "Name of funding org here",
          AC_DC__c: "AC",
          CircuitLength__c: "100",
          DeliveryDate_Year1__c: "2020-11-20T14:23:44",
          Glass_Share__c: 0,
          Porcelain_Share__c: 0,
          Composite_Share__c: 0,
          Year_1_percent__c: 0,
        }, {
          headers: { 'Authorization': `bearer ${access_token}` }
        }
      )
      if (!response2.success) {
        throw new Error(response2.errors)
      }

      resolve({
        userId,
        tender,
        access_token,
      })
    } catch (err) {
      reject(err)
    }
  })
}