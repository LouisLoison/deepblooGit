exports.PrivateDealAdd = (privateDeal) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      if (privateDeal.algoliaId && privateDeal.algoliaId > 0 && !privateDeal.privateDealId) {
        let query = `
          SELECT      privateDealId AS "privateDealId" 
          FROM        privateDeal 
          WHERE       algoliaId = ${BddTool.NumericFormater(privateDeal.algoliaId, BddEnvironnement, BddId)} 
        `
        let recordset = await BddTool.QueryExecBdd2(query)
        for (var record of recordset) {
          privateDeal.privateDealId = record.privateDealId
        }
      }

      if (privateDeal.submissionDeadlineDate && privateDeal.submissionDeadlineDate !== null) {
        let submissionDeadlineDateText = `${privateDeal.submissionDeadlineDate.substring(0, 4)}-${privateDeal.submissionDeadlineDate.substring(4, 6)}-${privateDeal.submissionDeadlineDate.substring(6, 8)}`
        let termDate = new Date(submissionDeadlineDateText)
        if (isNaN(termDate)) {
          throw new Error('Submission deadline invalide !')
        }
      }

      privateDeal.userId = config.user.userId
      privateDeal.status = 0
      if (!privateDeal.privateDealId) {
        privateDeal.creationDate = new Date()
      }
      privateDeal.updateDate = new Date()
      let data = await BddTool.RecordAddUpdate('privateDeal', privateDeal)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').PrivateDealsImport()
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

exports.PrivateDealGet = (privateDealId, algoliaId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      privateDealId AS "privateDealId",
                    category AS "category",
                    title AS "title",
                    size AS "size",
                    description AS "description",
                    lookingFor AS "lookingFor",
                    information AS "information",
                    requestForProposal AS "requestForProposal",
                    projectDevelopmentStatus AS "projectDevelopmentStatus",
                    projectAttractiveness AS "projectAttractiveness",
                    region AS "region",
                    projectLocation AS "projectLocation",
                    projectImplementationPeriod AS "projectImplementationPeriod",
                    projectGlobalAmount AS "projectGlobalAmount",
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
                    opportunity AS "opportunity",
                    contactName AS "contactName",
                    contactEmail AS "contactEmail",
                    contactPhone AS "contactPhone",
                    userId AS "userId",
                    algoliaId AS "algoliaId",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        privateDeal 
      `
      let where = ``
      if (privateDealId && privateDealId !== '' && privateDealId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `privateDealId = ${BddTool.NumericFormater(privateDealId, BddEnvironnement, BddId)} \n`
      }
      if (algoliaId && algoliaId !== '' && algoliaId > 0) {
        if (where !== '') {
          where += 'AND '
        }
        where += `algoliaId = ${BddTool.NumericFormater(algoliaId, BddEnvironnement, BddId)} \n`
      }
      if (where !== '') { query += 'WHERE ' + where }
      let recordset = await BddTool.QueryExecBdd2(query)
      let privateDeal = {}
      for (var record of recordset) {
        privateDeal = {
          privateDealId: record.privateDealId,
          category: record.category,
          title: record.title,
          size: record.size,
          description: record.description,
          lookingFor: record.lookingFor,
          information: record.information,
          requestForProposal: record.requestForProposal,
          projectDevelopmentStatus: record.projectDevelopmentStatus,
          projectAttractiveness: record.projectAttractiveness,
          region: record.region,
          projectLocation: record.projectLocation,
          projectImplementationPeriod: record.projectImplementationPeriod,
          projectGlobalAmount: record.projectGlobalAmount,
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
          opportunity: record.opportunity,
          contactName: record.contactName,
          contactEmail: record.contactEmail,
          contactPhone: record.contactPhone,
          userId: record.userId,
          algoliaId: record.algoliaId,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate
        }
      }

      resolve(privateDeal)
    } catch (err) {
      reject(err)
    }
  })
}

exports.PrivateDealList = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      let query = `
        SELECT      privateDealId AS "privateDealId",
                    category AS "category",
                    title AS "title",
                    size AS "size",
                    description AS "description",
                    lookingFor AS "lookingFor",
                    information AS "information",
                    requestForProposal AS "requestForProposal",
                    projectDevelopmentStatus AS "projectDevelopmentStatus",
                    projectAttractiveness AS "projectAttractiveness",
                    region AS "region",
                    projectLocation AS "projectLocation",
                    projectImplementationPeriod AS "projectImplementationPeriod",
                    projectGlobalAmount AS "projectGlobalAmount",
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
                    opportunity AS "opportunity",
                    contactName AS "contactName",
                    contactEmail AS "contactEmail",
                    contactPhone AS "contactPhone",
                    userId AS "userId",
                    algoliaId AS "algoliaId",
                    status AS "status",
                    creationDate AS "creationDate",
                    updateDate AS "updateDate"
        FROM        privateDeal 
      `
      if (filter) {
        let where = ``
        if (filter.privateDealId && filter.privateDealId !== '' && privateDealId > 0) {
          if (where !== '') { where += 'AND ' }
          where += `privateDealId = ${BddTool.NumericFormater(filter.privateDealId, BddEnvironnement, BddId)} \n`
        }
        if (filter.algoliaId && filter.algoliaId !== '' && filter.algoliaId > 0) {
          if (where !== '') { where += 'AND ' }
          where += `algoliaId = ${BddTool.NumericFormater(filter.algoliaId, BddEnvironnement, BddId)} \n`
        }
        if (filter.creationDateMin && filter.creationDateMin !== '') {
          if (where !== '') { where += 'AND '}
          where += `creationDate >= ${BddTool.DateFormater(filter.creationDateMin, BddEnvironnement, BddId)} `
        }
        if (filter.creationDateMax && filter.creationDateMax !== '') {
          if (where !== '') { where += 'AND '}
          where += `creationDate <= ${BddTool.DateFormater(filter.creationDateMax, BddEnvironnement, BddId)} `
        }
        if (filter.termDateMin && filter.termDateMin !== '') {
          if (where !== '') { where += 'AND '}
          where += `termDate >= ${BddTool.DateFormater(filter.termDateMin, BddEnvironnement, BddId)} `
        }
        if (filter.termDateMax && filter.termDateMax !== '') {
          if (where !== '') { where += 'AND '}
          where += `termDate <= ${BddTool.DateFormater(filter.termDateMax, BddEnvironnement, BddId)} `
        }
        if (filter.status !== undefined && filter.status !== null && filter.status !== '') {
          if (where !== '') { where += 'AND ' }
          where += `status = ${BddTool.NumericFormater(filter.status, BddEnvironnement, BddId)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      let recordset = await BddTool.QueryExecBdd2(query)
      let privateDeals = []
      for (var record of recordset) {
        privateDeals.push({
          privateDealId: record.privateDealId,
          category: record.category,
          title: record.title,
          size: record.size,
          description: record.description,
          lookingFor: record.lookingFor,
          information: record.information,
          requestForProposal: record.requestForProposal,
          projectDevelopmentStatus: record.projectDevelopmentStatus,
          projectAttractiveness: record.projectAttractiveness,
          region: record.region,
          projectLocation: record.projectLocation,
          projectImplementationPeriod: record.projectImplementationPeriod,
          projectGlobalAmount: record.projectGlobalAmount,
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
          opportunity: record.opportunity,
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

      resolve(privateDeals)
    } catch (err) {
      reject(err)
    }
  })
}

exports.PrivateDealRemove = (id, algoliaId) => {
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
        UPDATE      privateDeal 
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
      await BddTool.QueryExecBdd2(query)
      await require(process.cwd() + '/controllers/Algolia/MdlAlgolia').PrivateDealsPurge()

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
