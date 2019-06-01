exports.SchemaCheck = (Environnement) => {
  return new Promise((resolve, reject) => {
    try {
      const Config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddSchema = require(process.cwd() + '/global/BddSchema')
      
      var CheckResult = { }
      var Schema = BddSchema.getSchema()
      CheckResult.BddList = []
      var TableNbr = 0
      for(var Bdd in Schema) {
        CheckResult.BddList.push({ Name: Bdd, TableList: [], ErrorFlg: false })
        TableNbr += Object.keys(Schema[Bdd]).length
      }

      function getTableConfig(Bdd, Environnement, TableName) {
        BddSchema.getTableConfig(Bdd, Environnement, TableName).then((TableConfig) => {
          var TableName = TableConfig.TableName
          var TableBdd = { TableName: TableName }
          var ErrorFlg = false
          if (TableConfig.Column === undefined) {
            TableBdd.Error = 'Table manquante'
            ErrorFlg = true
          } else {
            TableBdd.ColumnList = []
            for(var ColumnName in Schema[Bdd][TableName]) {
              if (Config.bdd[Bdd][Environnement].config.type === 'Oracle') {
                if (!TableConfig.ColumnList.map((a) => { return a.toUpperCase() }).includes(ColumnName.toUpperCase())) {
                  TableBdd.ColumnList.push({ ColumnName: ColumnName, Error: 'Colonne manquante' })
                  ErrorFlg = true
                }
              } else {
                if (!TableConfig.ColumnList.includes(ColumnName)) {
                  TableBdd.ColumnList.push({ ColumnName: ColumnName, Error: 'Colonne manquante' })
                  ErrorFlg = true
                }
              }
            }
          }
          var BddList = CheckResult.BddList.filter(a => a.Name === Bdd)
          if (BddList.length > 0) {
            BddList[0].TableList.push(TableBdd)
            if (ErrorFlg) { BddList[0].ErrorFlg = ErrorFlg }
          }
          TableTreated++
          if (TableTreated === TableNbr) { resolve(CheckResult) }
        }).catch((err) => {
          var BddList = CheckResult.BddList.filter(a => a.Name === Bdd)
          if (BddList.length > 0) {
            BddList[0].Error = err
            BddList[0].ErrorFlg = true
          }
          TableTreated++
          if (TableTreated === TableNbr) { resolve(CheckResult) }
        })
      }
      for(var Bdd in Schema) {
        var TableTreated = 0
        for(var TableName in Schema[Bdd]) {
          getTableConfig(Bdd, Environnement, TableName)
        }
      }
    } catch (err) { reject(err) }
  })
}

exports.ColumnAddBdd = (Environnement, BddName, TableName, ColumnName) => {
  return new Promise((resolve, reject) => {
    try {
      this.ColumnScriptSql(Environnement, BddName, TableName, ColumnName).then((ScriptSql) => {
        var BddTool = require(process.cwd() + '/global/BddTool')
        let BddId = BddName
        let BddEnvironnement = Environnement
        BddTool.QueryExecBdd(BddId, BddEnvironnement, ScriptSql, reject, (recordset) => { 
          resolve()
        })
      }).catch((err) => { reject(err) })
    } catch (err) { reject(err) }
  })
}

exports.ColumnScriptSql = (Environnement, BddName, TableName, ColumnName) => {
  return new Promise((resolve, reject) => {
    try {
      var BddTool = require(process.cwd() + '/global/BddTool')
      var BddSchema = require(process.cwd() + '/global/BddSchema')
      var Schema = BddSchema.getSchema()
      let Column = Schema[BddName][TableName][ColumnName]
      var ScriptSql = `
      ALTER TABLE ${TableName}
      ADD ${ColumnName} ${BddTool.BddColumnType(Column.type, Environnement, BddName)} NULL 
      `
      resolve(ScriptSql)
    } catch (err) { reject(err) }
  })
}

exports.TableAddBdd = (Environnement, BddName, TableName) => {
  return new Promise((resolve, reject) => {
    try {
      this.TableScriptSql(Environnement, BddName, TableName).then((ScriptSql) => {
        var BddTool = require(process.cwd() + '/global/BddTool')
        let BddId = BddName
        let BddEnvironnement = Environnement
        BddTool.QueryExecBdd(BddId, BddEnvironnement, ScriptSql, reject, (recordset) => { 
          resolve()
        })
      }).catch((err) => { reject(err) })
    } catch (err) { reject(err) }
  })
}

exports.TableScriptSql = (Environnement, BddName, TableName) => {
  return new Promise((resolve, reject) => {
    try {
      var Config = require(process.cwd() + '/config')
      var BddTool = require(process.cwd() + '/global/BddTool')
      var BddSchema = require(process.cwd() + '/global/BddSchema')

      var Schema = BddSchema.getSchema()
      var ColumnKeyName = null
      var ColumnSql = ''
      for(let ColumnName in Schema[BddName][TableName]) {
        let Column = Schema[BddName][TableName][ColumnName]
        if (ColumnSql !== '') { ColumnSql += ', \n    ' }
        else { ColumnSql += '    ' }
        if (Column.key) {
          ColumnKeyName = ColumnName
          if (Config.bdd[BddName][Environnement].config.type === 'MsSql') {
            ColumnSql += `${ColumnName} [int] IDENTITY(1,1) NOT NULL`
          } else if (Config.bdd[BddName][Environnement].config.type === 'MySql') {
            ColumnSql += `${ColumnName} int NOT NULL AUTO_INCREMENT`
          } else if (Config.bdd[BddName][Environnement].config.type === 'Oracle') {
            ColumnSql += `${ColumnName} NUMBER(10,0) NOT NULL ENABLE`
          }
        } else {
          ColumnSql += `${ColumnName} ${BddTool.BddColumnType(Column.type, Environnement, BddName)}`
        }
      }
      var ScriptSql = `CREATE TABLE ${TableName} (` + '\n'
      ScriptSql += `${ColumnSql}`
      if (ColumnKeyName) {
        ScriptSql += ', \n'
        let toto = Schema[BddName]
        if (Config.bdd[BddName][Environnement].config.type === 'MsSql') {
          ScriptSql += `  PRIMARY KEY CLUSTERED ` + '\n'
          ScriptSql += `  ([${ColumnKeyName}] ASC)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY] `
        } else if (Config.bdd[BddName][Environnement].config.type === 'MySql') {
          ScriptSql += `PRIMARY KEY (${ColumnKeyName})`
        } else if (Config.bdd[BddName][Environnement].config.type === 'Oracle') {
          ScriptSql += `CONSTRAINT ${TableName.toUpperCase()}_PK PRIMARY KEY (${ColumnKeyName})`
        }
      }
      ScriptSql += '\n)'
      resolve(ScriptSql)
    } catch (err) { reject(err) }
  })
}
