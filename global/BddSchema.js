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
    user: {
        userId: { type: "Int", key: true },
        hivebriteId: { type: "Int" },
        type: { type: "Int", description: '1 = Admin | 2 = Premium | 3 = Public' },
        email: { type: "String" },
        username: { type: "String" },
        password: { type: "String" },
        membershipFree: { type: "Int" },
        creationDate: { type: "DateTime" },
        updateDate: { type: "DateTime" }
    }
  }
}

exports.getSchema = function() {
  return Schema
}

exports.getTableConfig = function(Bdd, Environnement, TableName) {
    return new Promise(async (resolve, reject) => {
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
        BddTool.QueryExecBdd(Bdd, Environnement, Query, (err) => { reject(err) }, (recordset) => { 
            if (TableName === 'Job') {
                let toto = null
            }
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
        })
    })
}
