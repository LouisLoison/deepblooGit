exports.OpportunityAdd = (opportunity) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (opportunity.algoliaId && opportunity.algoliaId > 0 && !opportunity.id) {
        let query = `
          SELECT      opportunityId AS "opportunityId" 
          FROM        opportunity 
          WHERE       algoliaId = ${BddTool.NumericFormater(opportunity.algoliaId, BddEnvironnement, BddId)} 
        `
        let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
        for (var record of recordset) {
          opportunity.opportunityId = record.opportunityId
        }
      }

      let submissionDeadlineDateText = `${opportunity.submissionDeadlineDate.substring(0, 4)}-${opportunity.submissionDeadlineDate.substring(4, 6)}-${opportunity.submissionDeadlineDate.substring(6, 8)}`
      let termDate = new Date(submissionDeadlineDateText)
      if (isNaN(termDate)) {
        throw new Error('Submission deadline invalide !')
      }

      opportunity.opportunityId = 0
      opportunity.userId = config.user.userId
      opportunity.status = 0
      opportunity.creationDate = new Date()
      opportunity.updateDate = opportunity.creationDate
      let data = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'opportunity', opportunity)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').OpportunitysImport()
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

exports.OpportunityGet = (id, algoliaId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      id AS "id",
                    opportunityId AS "opportunityId",
                    procurementId AS "procurementId",
                    title AS "title",
                    description AS "description",
                    lang AS "lang",
                    contactFirstName AS "contactFirstName",
                    contactLastName AS "contactLastName",
                    contactAddress AS "contactAddress",
                    contactCity AS "contactCity",
                    contactState AS "contactState",
                    contactCountry AS "contactCountry",
                    contactEmail AS "contactEmail",
                    contactPhone AS "contactPhone",
                    buyerName AS "buyerName",
                    buyerCountry AS "buyerCountry",
                    procurementMethod AS "procurementMethod",
                    noticeType AS "noticeType",
                    country AS "country",
                    estimatedCost AS "estimatedCost",
                    currency AS "currency",
                    publicationDate AS "publicationDate",
                    cpvs AS "cpvs",
                    cpvDescriptions AS "cpvDescriptions",
                    words AS "words",
                    submissionDeadlineDate AS "submissionDeadlineDate",
                    sourceUrl AS "sourceUrl",
                    termDate AS "termDate",
                    fileSource AS "fileSource",
                    userId AS "userId",
                    algoliaId AS "algoliaId",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        opportunity 
      `
      let where = ``
      if (id && id !== '' && id > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `id = ${BddTool.NumericFormater(id, BddEnvironnement, BddId)} \n`
      }
      if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let opportunity = {}
      for (var record of recordset) {
        opportunity = {
          id: record.id,
          opportunityId: record.opportunityId,
          procurementId: record.procurementId,
          title: record.title,
          description: record.description,
          lang: record.lang,
          contactFirstName: record.contactFirstName,
          contactLastName: record.contactLastName,
          contactAddress: record.contactAddress,
          contactCity: record.contactCity,
          contactState: record.contactState,
          contactCountry: record.contactCountry,
          contactEmail: record.contactEmail,
          contactPhone: record.contactPhone,
          buyerName: record.buyerName,
          buyerCountry: record.buyerCountry,
          procurementMethod: record.procurementMethod,
          noticeType: record.noticeType,
          country: record.country,
          estimatedCost: record.estimatedCost,
          currency: record.currency,
          publicationDate: record.publicationDate,
          cpvs: record.cpvs,
          cpvDescriptions: record.cpvDescriptions,
          words: record.words,
          submissionDeadlineDate: record.submissionDeadlineDate,
          sourceUrl: record.sourceUrl,
          termDate: record.termDate,
          fileSource: record.fileSource,
          userId: record.userId,
          algoliaId: record.algoliaId,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        }
      }

      resolve(opportunity)
    } catch (err) {
      reject(err)
    }
  })
}

exports.OpportunityList = (opportunityId, algoliaId, creationDateMin, creationDateMax, termDateMin, termDateMax, cpvLabels, regions, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      opportunityId AS "opportunityId",
                    category AS "category",
                    title AS "title",
                    size AS "size",
                    description AS "description",
                    information AS "information",
                    requestForProposal AS "requestForProposal",
                    projectDevelopmentStatus AS "projectDevelopmentStatus",
                    projectAttractiveness AS "projectAttractiveness",
                    region AS "region",
                    projectLocation AS "projectLocation",
                    projectImplementationPeriod AS "projectImplementationPeriod",
                    requiredInvestments AS "requiredInvestments",
                    publicationDate AS "publicationDate",
                    submissionDeadlineDate AS "submissionDeadlineDate",
                    organizationName AS "organizationName",
                    organizationType AS "organizationType",
                    projectOverallCost AS "projectOverallCost",
                    capitalCosts AS "capitalCosts",
                    internalFundsInvested AS "internalFundsInvested",
                    internalRateReturn AS "internalRateReturn",
                    availableFunds AS "availableFunds",
                    requiredInvestments AS "requiredInvestments",
                    tariff AS "tariff",
                    requiredAmountOfInvestments AS "requiredAmountOfInvestments",
                    investorParticipationFrom AS "investorParticipationFrom",
                    investmentReturn AS "investmentReturn",
                    privateDeals AS "privateDeals",
                    contactName AS "contactName",
                    contactEmail AS "contactEmail",
                    contactPhone AS "contactPhone",
                    userId AS "userId",
                    algoliaId AS "algoliaId",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        opportunity 
      `
      let where = ``
      if (opportunityId && opportunityId !== '' && opportunityId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `opportunityId = ${BddTool.NumericFormater(opportunityId, BddEnvironnement, BddId)} \n`
      }
      if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') { where += 'AND ' }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (creationDateMin && creationDateMin !== '') {
        if (where !== '') { where += 'AND '}
        where += `creationDate >= ${BddTool.DateFormater(creationDateMin, BddEnvironnement, BddId)} `
      }
      if (creationDateMax && creationDateMax !== '') {
        if (where !== '') { where += 'AND '}
        where += `creationDate <= ${BddTool.DateFormater(creationDateMax, BddEnvironnement, BddId)} `
      }
      if (termDateMin && termDateMin !== '') {
        if (where !== '') { where += 'AND '}
        where += `termDate >= ${BddTool.DateFormater(termDateMin, BddEnvironnement, BddId)} `
      }
      if (termDateMax && termDateMax !== '') {
        if (where !== '') { where += 'AND '}
        where += `termDate <= ${BddTool.DateFormater(termDateMax, BddEnvironnement, BddId)} `
      }
      if (cpvLabels && cpvLabels.length) {
        if (where !== '') { where += 'AND '}
        let orCondition = ''
        for (let cpvLabel of cpvLabels) {
          if (orCondition !== '') { orCondition += 'OR '}
          orCondition += `REPLACE(cpvDescriptions, '-', ' ') LIKE '%${BddTool.ChaineFormater(cpvLabel, BddEnvironnement, BddId)}%' `
        }
        where += `(${orCondition}) `
      }
      if (status && status !== '' && status > 0) {
        if (where !== '') { where += 'AND ' }
        where += `status = ${BddTool.NumericFormater(status, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      let opportunitys = []
      for (var record of recordset) {
        opportunitys.push({
          opportunityId: record.opportunityId,
          category: record.category,
          title: record.title,
          size: record.size,
          description: record.description,
          information: record.information,
          requestForProposal: record.requestForProposal,
          projectDevelopmentStatus: record.projectDevelopmentStatus,
          projectAttractiveness: record.projectAttractiveness,
          region: record.region,
          projectLocation: record.projectLocation,
          projectImplementationPeriod: record.projectImplementationPeriod,
          requiredInvestments: record.requiredInvestments,
          publicationDate: record.publicationDate,
          submissionDeadlineDate: record.submissionDeadlineDate,
          organizationName: record.organizationName,
          organizationType: record.organizationType,
          projectOverallCost: record.projectOverallCost,
          capitalCosts: record.capitalCosts,
          internalFundsInvested: record.internalFundsInvested,
          internalRateReturn: record.internalRateReturn,
          availableFunds: record.availableFunds,
          requiredInvestments: record.requiredInvestments,
          tariff: record.tariff,
          requiredAmountOfInvestments: record.requiredAmountOfInvestments,
          investorParticipationFrom: record.investorParticipationFrom,
          investmentReturn: record.investmentReturn,
          privateDeals: record.privateDeals,
          contactName: record.contactName,
          contactEmail: record.contactEmail,
          contactPhone: record.contactPhone,
          userId: record.userId,
          algoliaId: record.algoliaId,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate,
        })
      }

      resolve(opportunitys)
    } catch (err) {
      reject(err)
    }
  })
}

exports.OpportunityRemove = (id, algoliaId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      
      if (!id && !algoliaId) {
        throw new Error("No available id !")
      }

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        UPDATE      opportunity 
        SET         status = -1 
      `
      let where = ``
      if (id && id !== '' && id > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `id = ${BddTool.NumericFormater(id, BddEnvironnement, BddId)} \n`
      }
      if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += '  WHERE ' + where }
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').OpportunitysPurge()

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
