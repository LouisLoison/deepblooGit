var Config = require(process.cwd() + '/config')

var Schema = {
  deepbloo: {
    annonce: {
      annonceId: { type: "Int", key: true },
      title: { type: "String" },
      description: { type: "String" },
      image: { type: "String" },
      url: { type: "String" },
      priority: { type: "Int" },
      userId: { type: "Int" },
      organizationId: { type: "Int" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    annonceClick: {
      annonceClickId: { type: "Int", key: true },
      annonceId: { type: "Int" },
      userId: { type: "Int" },
      screen: { type: "String" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    cpv: {
      cpvId: { type: "Int", key: true },
      code: { type: "Int" },
      label: { type: "String" },
      active: { type: "Int" },
      logo: { type: "String" },
      picture: { type: "String" },
      category: { type: "String" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    cpvWord: {
      cpvWordId: { type: "Int", key: true },
      cpvId: { type: "Int" },
      word: { type: "String" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    document: {
      documentId: { type: "Int", key: true },
      tenderId: { type: "Int" },
      cpvs: { type: "String" },
      filename: { type: "String" },
      size: { type: "Int" },
      sourceUrl: { type: "String" },
      s3Url: { type: "String" },
      boxFolderId: { type: "String" },
      boxFileId: { type: "String" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    documentMessage: {
      documentMessageId: { type: "Int", key: true },
      documentId: { type: "Int" },
      organizationId: { type: "Int" },
      userId: { type: "Int" },
      message: { type: "String" },
      status: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
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
      bidManagerId: { type: "Int" },
      amoutOffer: { type: "String" },
      status: { type: "Int", description: '-1 = Delete | -2 = Archive' },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
    },
    privateDeal: {
      privateDealId: { type: "Int", key: true },
      category: { type: "String" },
      title: { type: "String" },
      size: { type: "String" },
      description: { type: "String" },
      lookingFor: { type: "String" },
      information: { type: "String" },
      requestForProposal: { type: "String" },
      projectDevelopmentStatus: { type: "String" },
      projectAttractiveness: { type: "String" },
      region: { type: "String" },
      projectLocation: { type: "String" },
      projectImplementationPeriod: { type: "String" },
      projectGlobalAmount: { type: "String" },
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
      opportunity: { type: "String" },
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
      type: { type: "Int", description: '1 = Admin | 2 = Premium | 3 = Public | 4 = Business | 5 = Free' },
      email: { type: "String" },
      username: { type: "String" },
      password: { type: "String" },
      membershipFree: { type: "Int" },
      organizationId: { type: "Int" },
      country: { type: "String" },
      countryCode: { type: "String" },
      regions: { type: "String" },
      photo: { type: "String" },
      doNotContact: { type: "Int" },
      notifPostEmail: { type: "Int" },
      notifTripEmail: { type: "Int" },
      notifEventEmail: { type: "Int" },
      notifDigestEmail: { type: "Int" },
      notifCommentEmail: { type: "Int" },
      notifVentureEmail: { type: "Int" },
      notifBusinessRequest: { type: "Int" },
      notifCurrentLocationEmail: { type: "Int" },
      notifEmailingComEmail: { type: "Int" },
      notifForumPostEmail: { type: "Int" },
      notifContactByPhone: { type: "Int" },
      notifContactBySms: { type: "Int" },
      notifContactByPost: { type: "Int" },
      connexionTender: { type: "DateTime" },
      connexionBusiness: { type: "DateTime" },
      dashboardUrl: { type: "String" },
      status: { type: "Int" },
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
    userNotify: {
      userNotifyId: { type: "Int", key: true },
      userId: { type: "Int" },
      recipientId: { type: "Int" },
      recipientEmail: { type: "String" },
      tenderId: { type: "Int" },
      creationDate: { type: "DateTime" },
      updateDate: { type: "DateTime" }
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
    },
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
