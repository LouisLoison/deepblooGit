exports.sendToSalesforce = (userId, tenderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const BddTool = require(process.cwd() + '/global/BddTool')
      const FormData = require('form-data')

      const tender = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(tenderId)
      if (!tender) {
        throw new Error(`Unknown tender #${tenderId}`)
      }

      // Get countryId
      const textParses = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()
      const tenderCriterions = await require(process.cwd() + '/controllers/Tender/MdlTender').tenderCriterions({ tenderId })
      let financialOrganizationTextParses = textParses.filter(a => a.theme === 'Financial Organization')
      let financialOrganizationTenderCriterions = []
      for (const tenderCriterion of tenderCriterions) {
        let textParse = financialOrganizationTextParses.find(a => a.textParseId === tenderCriterion.textParseId)
        if (textParse) {
          tenderCriterion.textParse = textParse
          financialOrganizationTenderCriterions.push(tenderCriterion)
        }
      }
      let mappingFinancialNames = financialOrganizationTenderCriterions.map(a => a.textParse.group.toLowerCase())
      mappingFinancialNames = mappingFinancialNames.filter((v, i, a) => a.indexOf(v) === i)
      let mappingFinancialId = ''
      query = `
        SELECT      mappingFinancial.code AS "code" 
        FROM        mappingFinancial 
        WHERE       LOWER(mappingFinancial.name) IN (${BddTool.ArrayStringFormat(mappingFinancialNames)}) 
      `
      let recordset = await BddTool.QueryExecBdd2(query)
      for (let record of recordset) {
        mappingFinancialId = record.code
      }

      // Get countryId
      let countryId = ''
      query = `
        SELECT      mappingCountry.countryId AS "countryId" 
        FROM        mappingCountry 
        WHERE       LOWER(mappingCountry.name) = '${BddTool.ChaineFormater(tender.country.toLowerCase())}' 
      `
      recordset = await BddTool.QueryExecBdd2(query)
      for (let record of recordset) {
        countryId = record.countryId
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

      let title = tender.title.substring(0, 50)
      let response2 = await require('axios').post(
        `https://sediver--sediveruat.my.salesforce.com/services/data/v50.0/sobjects/Project__c`, {
          Tender_UUID__c: tender.tenderUuid,
          Name: title,
          Country__c: countryId,
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
          Account__c: mappingFinancialId,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          }
        }
      )
      if (!response2.data || !response2.data.success) {
        throw new Error(response2.errors)
      }
      const salesforceId = response2.data.id

      resolve({
        userId,
        salesforceId,
      })
    } catch (err) {
      reject(err)
    }
  })
}
