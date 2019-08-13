var Config = require(process.cwd() + '/config')

var Schema = {
  deepbloo: {
    dgmarket: {
      id: { type: "Int", key: true },
      dgmarketId: { type: "Int" },
      procurementId: { type: "String" },
      title: { type: "String" },
      description: { type: "String" },
      lang: { type: "String" },
      contactFirstName: { type: "String" },
      contactLastName: { type: "String" },
      contactAddress: { type: "String" },
      contactCity: { type: "String" },
      contactState: { type: "String" },
      contactCountry: { type: "String" },
      contactEmail: { type: "String" },
      contactPhone: { type: "String" },
      buyerName: { type: "String" },
      buyerCountry: { type: "String" },
      procurementMethod: { type: "String" },
      noticeType: { type: "String" },
      country: { type: "String" },
      estimatedCost: { type: "String" },
      currency: { type: "String" },
      publicationDate: { type: "String" },
      cpvsOrigine:  { type: "String" },
      cpvs: { type: "String" },
      cpvDescriptions: { type: "String" },
      words: { type: "String" },
      bidDeadlineDate: { type: "String" },
      sourceUrl: { type: "String" },
      termDate: { type: "DateTime" },
      fileSource: { type: "String" },
      userId: { type: "Int" },
      algoliaId: { type: "Int" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    tenderGroup: {
      tenderGroupId: { type: "Int", key: true },
      userId: { type: "Int" },
      label: { type: "String" },
      color: { type: "String" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    tenderGroupLink: {
      tenderGroupLinkId: { type: "Int", key: true },
      userId: { type: "Int" },
      tenderGroupId: { type: "Int" },
      tenderId: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    tenderDetail: {
      tenderDetailId: { type: "Int", key: true },
      userId: { type: "Int" },
      tenderId: { type: "Int" },
      comment: { type: "String" },
      salesManagerId: { type: "Int" },
      captureTeamId: { type: "Int" },
      amoutOffer: { type: "String" },
      status: { type: "Int", description: '-1 = Delete | -2 = Archive' },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    opportunity: {
      opportunityId: { type: "Int", key: true },
      category: { type: "String" },
      title: { type: "String" },
      size: { type: "String" },
      description: { type: "String" },
      information: { type: "String" },
      requestForProposal: { type: "String" },
      projectDevelopmentStatus: { type: "String" },
      projectAttractiveness: { type: "String" },
      region: { type: "String" },
      projectLocation: { type: "String" },
      projectImplementationPeriod: { type: "String" },
      requiredInvestments: { type: "String" },
      publicationDate: { type: "String" },
      submissionDeadlineDate: { type: "String" },
      organizationName: { type: "String" },
      organizationType: { type: "String" },
      projectOverallCost: { type: "String" },
      capitalCosts: { type: "String" },
      internalFundsInvested: { type: "String" },
      internalRateReturn: { type: "String" },
      availableFunds: { type: "String" },
      requiredInvestments: { type: "String" },
      tariff: { type: "String" },
      requiredAmountOfInvestments: { type: "String" },
      investorParticipationFrom: { type: "String" },
      investmentReturn: { type: "String" },
      privateDeals: { type: "String" },
      contactName: { type: "String" },
      contactEmail: { type: "String" },
      contactPhone: { type: "String" },
      userId: { type: "Int" },
      algoliaId: { type: "Int" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    user: {
      userId: { type: "Int", key: true },
      hivebriteId: { type: "Int" },
      type: { type: "Int", description: '1 = Admin | 2 = Premium | 3 = Public | 4 = Business' },
      email: { type: "String" },
      username: { type: "String" },
      password: { type: "String" },
      membershipFree: { type: "Int" },
      organizationId: { type: "Int" },
      country: { type: "String" },
      countryCode: { type: "String" },
      regions: { type: "String" },
      photo: { type: "String" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    userCpv: {
      userCpvId: { type: "Int", key: true },
      userId: { type: "Int" },
      cpvCode: { type: "String" },
      cpvName: { type: "String" },
      origineType: { type: "Int", description: '-1 = delete | 1 = Synchro | 2 = Manuel' },
      rating: { type: "Int" },
    },
    organization: {
      organizationId: { type: "Int", key: true },
      dgmarketId: { type: "Int" },
      name: { type: "String" },
      countrys: { type: "String" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    organizationCpv: {
      organizationCpvId: { type: "Int", key: true },
      organizationId: { type: "Int" },
      cpvCode: { type: "String" },
      cpvName: { type: "String" },
      origineType: { type: "Int", description: '-1 = delete | 1 = Synchro | 2 = Manuel' },
      rating: { type: "Int" },
    }
  }
}

exports.getSchema = function() {
  return Schema
}

exports.getTableConfig = function(Bdd, Environnement, TableName) {
  return new Promise(async (resolve, reject) => {
    try {
      const BddTool = require(process.cwd() + '/global/BddTool')
      const TableConfig = { TableName: TableName }
      let Query = ''
      if (Config.bdd[Bdd][Environnement].config.type === 'MsSql') {
        Query = `Exec SP_Columns ${TableName}`
      } else if (Config.bdd[Bdd][Environnement].config.type === 'MySql') {
        Query = `SELECT * FROM information_schema.COLUMNS WHERE TABLE_NAME = '${TableName}' AND TABLE_SCHEMA = '${Config.bdd[Bdd][Environnement].config.database}' `
      } else if (Config.bdd[Bdd][Environnement].config.type === 'Oracle') {
        Query = `SELECT * FROM SYS.USER_TAB_COLUMNS WHERE TABLE_NAME= '${TableName.toUpperCase()}'`
      }
      let recordset = await BddTool.QueryExecBdd2(Bdd, Environnement, Query)
      if (!recordset || recordset.length === 0) {
        TableConfig.Error = 'Table manquante'
      } else {
        TableConfig.ColumnList = []
        TableConfig.Column = []
        for(var Column of recordset) {
          if (Config.bdd[Bdd][Environnement].config.type === 'MsSql') {
            TableConfig.ColumnList.push(Column.COLUMN_NAME)
            TableConfig.Column.push({ name: Column.COLUMN_NAME, type: Column.TYPE_NAME })
          } else if (Config.bdd[Bdd][Environnement].config.type === 'MySql') {
            TableConfig.ColumnList.push(Column.COLUMN_NAME)
            TableConfig.Column.push({ name: Column.COLUMN_NAME, type: Column.DATA_TYPE })
          } else if (Config.bdd[Bdd][Environnement].config.type === 'Oracle') {
            TableConfig.ColumnList.push(Column.COLUMN_NAME)
            TableConfig.Column.push({ name: Column.COLUMN_NAME, type: Column.DATA_TYPE })
          }
        }
      }
      resolve(TableConfig)
    } catch (err) { reject(err) }
  })
}
