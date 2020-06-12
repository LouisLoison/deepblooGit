var Config = require(process.cwd() + '/config')

var QueryExecMsSql = async function(onError, onSuccess, Query, BddId, Environnement) {
    var sql = require('mssql')

    var configBdd = null
    if (BddId === 'Interface') {
        configBdd = Config.bdd['EtlToolVar'][Environnement].config
    } else if (BddId === 'EtlTool' || BddId === 'EtlToolVar' || BddId === 'TalendLog') {
        configBdd = Config.bdd[BddId][Environnement].config
    } else {
        configBdd = Config.AppBdd.config
    }
    const pool = new sql.ConnectionPool(configBdd)
    pool.on('error', err => {
        onError(err)
    })
  
    try {
        await pool.connect()
        let result = await pool.request().query(Query)
        onSuccess(result.recordset)
    } catch (err) {
        onError(err)
    } finally {
        pool.close()
    }
}

var QueryExecMySql = (onError, onSuccess, Query, BddId, Environnement, rowsCount) => {
  const mysql = require('mysql')
  const configBdd = Config.bdd[BddId][Environnement].config

  try {
    let connection = null
    /*
    try {
      connection = mysql.createConnection({
        host: configBdd.server,
        user: configBdd.user,
        password: configBdd.password,
        database: configBdd.database
      })
      connection.destroy()
    } catch (err) {
      err.Query = Query
      onError(err)
    }
    */
    connection = mysql.createConnection({
      host: configBdd.server,
      user: configBdd.user,
      password: configBdd.password,
      database: configBdd.database
    })
    connection.query(Query, (err, results, fields) => {
      /*
      connection.end((err) => {
        err.Query = Query
        onError(err)
        return false
      })
      */
      if (err) {
        err.Query = Query
        onError(err)
        return false
      }
      /*
        connection.destroy()
      } catch (err) {
        console.log('[QueryExecMySql]')
        console.log(err)
      }
      */
      // connection.end()
      if (!rowsCount) {
        setTimeout(() => {
          connection.destroy()
        }, 800)
        onSuccess(results)
      } else {
        connection.query('SELECT FOUND_ROWS()', (err2, results2, fields) => {
          if (err2) {
            err2.Query = Query
            onError(err2)
            return false
          }
          setTimeout(() => {
            connection.destroy()
          }, 800)
          onSuccess({
            results,
            total: results2[0]['FOUND_ROWS()']
          })
        })
    
      }
    })
    /*
    SET GLOBAL wait_timeout=28800
    SET GLOBAL interactive_timeout=28800
    */
  } catch (err) {
    err.Query = Query
    onError(err)
  }
}

var QueryExecOracle = async function(onError, onSuccess, Query, BddId, Environnement) {
    var oracledb = require('oracledb')
    var configBdd = Config.bdd[BddId][Environnement].config

    oracledb.getConnection( {
        user: configBdd.user,
        password: configBdd.password,
        connectString: configBdd.server
    })
    .then((connection) => {
        return connection.execute(Query, {}, { outFormat: oracledb.OBJECT }).then((result) => {
            onSuccess(result.rows)
            return connection.close()
        }).catch((err) => {
            onError(err)
            return connection.close()
        })
    })
    .catch((err) => { onError(err) })
}

var QueryExecBdd = (BddId, Environnement, Query, onError, onSuccess, rowsCount) => {
  if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
    QueryExecMsSql(onError, onSuccess, Query, BddId, Environnement)
  } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
    QueryExecMySql(onError, onSuccess, Query, BddId, Environnement, rowsCount)
  } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
    QueryExecOracle(onError, onSuccess, Query, BddId, Environnement)
  }
}
exports.QueryExecBdd = QueryExecBdd

exports.QueryExecBdd2 = (BddId, Environnement, Query, rowsCount) => {
  return new Promise((resolve, reject) => {
    this.QueryExecBdd(BddId, Environnement, Query, reject, resolve, rowsCount)
  })
}

exports.RecordAddUpdate = (BddId, Environnement, TableName, Record) => {
  return new Promise((resolve, reject) => {
    try
    {
      const BddSchema = require(process.cwd() + '/global/BddSchema')

      let ColumnKey = ''
      let ColumnList = []
      let Schema = BddSchema.getSchema()
      let Table = Schema[BddId][TableName]
      for(let ColumnName in Table) {
        if (ColumnName === 'creationDate') { continue }
        if (ColumnName === 'updateDate') { continue }
        if (ColumnName === 'owner') { continue }
        let Column = Table[ColumnName]
        if (Column.key) {
          ColumnKey = ColumnName
        } else {
          if (Record[ColumnName] !== undefined && Record[ColumnName] !== null) {
            ColumnList.push(ColumnName)
          }
        }
      }

      let Query = ''
      if (Record[ColumnKey] && Record[ColumnKey] !== 0 && Record[ColumnKey] !== '') {
        let UpdateListText = ''
        for(let ColumnName of ColumnList) {
          if (UpdateListText !== '') { UpdateListText += `, ` }
          UpdateListText += `${ColumnName} = `
          if (Table[ColumnName].type === 'String') {
            UpdateListText += `'${ChaineFormater(Record[ColumnName], Environnement, BddId)}' `
          } else if (Table[ColumnName].type === 'Text') {
            UpdateListText += `'${ChaineFormater(Record[ColumnName], Environnement, BddId)}' `
          } else if (Table[ColumnName].type === 'Time') {
            UpdateListText += `'${ChaineFormater(Record[ColumnName], Environnement, BddId)}' `
          } else if (Table[ColumnName].type === 'Int') {
            UpdateListText += `${NumericFormater(Record[ColumnName], Environnement, BddId)} `
          } else if (Table[ColumnName].type === 'DateTime') {
            UpdateListText += `${this.DateFormater(Record[ColumnName], Environnement, BddId)} `
          } else {
            UpdateListText += `${Record[ColumnName]} `
          }
        }
        if (Table['updateDate'] !== undefined) { UpdateListText += `, updateDate = ${DateNow(Environnement, BddId)}` }
        if (Table['owner'] !== undefined && Config.user.Identifiant) { UpdateListText += `, owner = '${ChaineFormater(Config.user.Identifiant, Environnement, BddId)}'` }
        
        Query = `
          UPDATE ${TableName} 
          SET ${UpdateListText} 
          WHERE ${ColumnKey} = ${Record[ColumnKey]} 
        `
        QueryExecBdd(BddId, Environnement, Query, (err) => { err.Query = Query; reject(err); }, (recordset) => { 
          resolve(Record)
        })
      } else {
        let ColumnListText = ''
        let ValueListText = ''
        for(let ColumnName of ColumnList) {
          if (ColumnListText !== '') { ColumnListText += `, ` }
          ColumnListText += `"${ColumnName}"`
          if (ValueListText !== '') { ValueListText += `, ` }
          if (Table[ColumnName].type === 'String') {
              ValueListText += `'${ChaineFormater(Record[ColumnName], Environnement, BddId)}' `
          } else if (Table[ColumnName].type === 'Text') {
              ValueListText += `'${ChaineFormater(Record[ColumnName], Environnement, BddId)}' `
          } else if (Table[ColumnName].type === 'Time') {
              ValueListText += `'${ChaineFormater(Record[ColumnName], Environnement, BddId)}' `
          } else if (Table[ColumnName].type === 'Int') {
              ValueListText += `${NumericFormater(Record[ColumnName], Environnement, BddId)} `
          } else if (Table[ColumnName].type === 'DateTime') {
              ValueListText += `${this.DateFormater(Record[ColumnName], Environnement, BddId)} `
          } else {
              ValueListText += `'${Record[ColumnName]}'`
          }
        }
        if (Table['updateDate'] !== undefined) {
          if (ColumnListText !== '') { ColumnListText += `, ` }
          ColumnListText += `"updateDate"`
          if (ValueListText !== '') { ValueListText += `, ` }
          ValueListText += `${DateNow(Environnement, BddId)} `
        }
        if (Table['creationDate'] !== undefined) {
          if (ColumnListText !== '') { ColumnListText += `, ` }
          ColumnListText += `"creationDate"`
          if (ValueListText !== '') { ValueListText += `, ` }
          ValueListText += `${DateNow(Environnement, BddId)} `
        }
        if (Table['owner'] !== undefined && Config.user.Identifiant) {
          if (ColumnListText !== '') { ColumnListText += `, ` }
          ColumnListText += `"owner"`
          if (ValueListText !== '') { ValueListText += `, ` }
          ValueListText += `'${ChaineFormater(Config.user.Identifiant, Environnement, BddId)}' `
        }

        if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
          ColumnListText = ColumnListText.replace(/"/g, '')
        }
        Query = `
          INSERT INTO ${TableName} (${ColumnListText}) 
          VALUES (${ValueListText}) `
        if (ColumnKey != '') {
          if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
            Query += `; 
              SELECT @@IDENTITY AS \'identity\';`
          } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
            Query += ``
          } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
            Query += ''
          }
        }
        QueryExecBdd(BddId, Environnement, Query, (err) => { err.Query = Query; reject(err); }, (recordset) => {
          if (ColumnKey != '' && recordset) {
            if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
              if (recordset.length > 0) {
                Record[ColumnKey] = recordset[0].identity
              }
            } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
              Record[ColumnKey] = recordset.insertId
            } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
            }
          }
          resolve(Record)
        })
      }
    } catch (err) {
      reject(err)
    }
  })
}

exports.bulkInsert = (BddId, Environnement, TableName, records) => {
  return new Promise((resolve, reject) => {
    try
    {
      const mysql = require('mysql')
      const configBdd = Config.bdd[BddId][Environnement].config
      const BddSchema = require(process.cwd() + '/global/BddSchema')

      let Schema = BddSchema.getSchema()
      let Table = Schema[BddId][TableName]

      const columns = []
      for (const column in records[0]) {
        if (Table[column] === undefined) {
          continue
        }
        columns.push(column)
      }

      const values = []
      for (const record of records) {
        const value = []
        for (const column of columns) {
          value.push(record[column])
        }
        values.push(value)
      }

      const conn = mysql.createConnection({
        host: configBdd.server,
        user: configBdd.user,
        password: configBdd.password,
        database: configBdd.database
      })
      
      const Query = `INSERT INTO ${TableName} (${columns.join(',')}) VALUES ?`
      conn.query(Query, [values], (err) => {
        if (err) {
          err.Query = Query
          reject(err)
          return false
        }
        setTimeout(() => {
          conn.destroy()
        }, 800)
        resolve()
      })
    } catch (err) {
      reject(err)
    }
  })
}

exports.RecordGet = (BddId, Environnement, TableName, RecordId) => {
    return new Promise((resolve, reject) => {
        var BddSchema = require(process.cwd() + '/global/BddSchema')

        var Record = {}
        var ColumnKey = ''
        var ColumnListTexte = ''
        var Schema = BddSchema.getSchema()
        var Table = Schema[BddId][TableName]
        for(var ColumnName in Table) {
            var Column = Table[ColumnName]
            if (Column.key) {
                ColumnKey = ColumnName
            }
            if (ColumnListTexte !== '') { ColumnListTexte += `, ` }
            ColumnListTexte += `${ColumnName} AS "${ColumnName}"`
        }

        var Query = ''
        Query = `
            SELECT ${ColumnListTexte} 
            FROM ${TableName} 
            WHERE ${ColumnKey} = ${RecordId} 
        `
        QueryExecBdd(BddId, Environnement, Query, reject, (recordset) => { 
            for (var recordItem of recordset) {
                for(var ColumnName in Table) {
                    Record[ColumnName] = recordItem[ColumnName]
                }
            }
            resolve(Record)
        })
    })
}

exports.RecordDelete = (BddId, Environnement, TableName, RecordId) => {
    return new Promise((resolve, reject) => {
        var BddSchema = require(process.cwd() + '/global/BddSchema')

        var ColumnKey = ''
        var Schema = BddSchema.getSchema()
        var Table = Schema[BddId][TableName]
        for(var ColumnName in Table) {
            var Column = Table[ColumnName]
            if (Column.key) {
                ColumnKey = ColumnName
            }
        }

        var Query = ''
        Query = `
            DELETE FROM ${TableName} 
            WHERE ${ColumnKey} = ${RecordId} 
        `
        QueryExecBdd(BddId, Environnement, Query, reject, () => {
            resolve()
        })
    })
}

var BddColumnType = (Type, Environnement, BddId) => {
    var TypeTexte = '';
    if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
        if (Type === 'String') {
            TypeTexte = `varchar(255)`
        } else if (Type === 'Text') {
            TypeTexte = `varchar(MAX)`
        } else if (Type === 'Int') {
            TypeTexte = `int`
        } else if (Type === 'BigInt') {
            TypeTexte = `int`
        } else if (Type === 'DateTime') {
            TypeTexte = `datetime`
        } else if (Type === 'Time') {
            TypeTexte = `time`
        }
    } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
        if (Type === 'String') {
            TypeTexte = `varchar(255)`
        } else if (Type === 'Text') {
            TypeTexte = `text`
        } else if (Type === 'Int') {
            TypeTexte = `int`
        } else if (Type === 'BigInt') {
            TypeTexte = `int`
        } else if (Type === 'DateTime') {
            TypeTexte = `datetime`
        } else if (Type === 'Time') {
            TypeTexte = `time`
        }
    } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
        if (Type === 'String') {
            TypeTexte = `NVARCHAR2(255)`
        } else if (Type === 'Text') {
            TypeTexte = `NCLOB`
        } else if (Type === 'Int') {
            TypeTexte = `NUMBER(*,0)`
        } else if (Type === 'BigInt') {
            TypeTexte = `NUMBER(*,0)`
        } else if (Type === 'DateTime') {
            TypeTexte = `TIMESTAMP (3)`
        } else if (Type === 'Time') {
            TypeTexte = `TIMESTAMP (3)`
        }
    }
    return TypeTexte
}
exports.BddColumnType = BddColumnType

var DateNow = (Environnement, BddId) => {
    var DateTexte = ''
    if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
        DateTexte = 'GETDATE()'
    } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
        DateTexte = 'NOW()'
    } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
        DateTexte = 'SYSTIMESTAMP'
    }
    return DateTexte
}
exports.DateNow = DateNow

var ChaineFormater = (Texte, Environnement, BddId) => {
    if (!Texte) { return '' }
    Texte += ''
    if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
        Texte = Texte
    } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
        Texte = Texte.replace(/\\/gi, '\\\\')
    } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
        Texte = Texte
    }
    //Texte = Texte.replace(new RegExp(`'`), '\\\'')
    Texte = Texte.replace(/'/g, `''`)
    return Texte
}
exports.ChaineFormater = ChaineFormater

var ChaineListeFormater = (Texte, Separateur, Environnement, BddId) => {
    if (Texte.trim() !== '')
    {
        var ItemList = Texte.split(Separateur)
        var Texte = this.ArrayStringFormat(ItemList, Environnement, BddId)
    }
    return Texte
}
exports.ChaineListeFormater = ChaineListeFormater

exports.ArrayStringFormat = (ItemList, Environnement, BddId) => {
  var Texte = ''
  for (var Item of ItemList)
  {
    if (Texte !== '') { Texte += `','` }
    Texte += ChaineFormater(Item.trim(), Environnement, BddId)
  }
  Texte = `'${Texte}'`
  return Texte
}

var NumericFormater = (Texte, Environnement, BddId) => {
  var value = 0
  try {
      value = Number(Texte)
  }
  catch(err) {
  }
  if (isNaN(value)) { value = 0 }
  return value
}
exports.NumericFormater = NumericFormater

exports.ArrayNumericFormater = (ItemList, Environnement, BddId) => {
  var Texte = ''
  for (var Item of ItemList)
  {
    if (Texte !== '') { Texte += `,` }
    Texte += NumericFormater(Item, Environnement, BddId)
  }
  Texte = `${Texte}`
  return Texte
}

exports.DateFormater = (Texte, Environnement, BddId) => {
    var moment = require('moment')
    if (Texte instanceof Date) {
        let DateTemp = moment(Texte).utcOffset(Texte.getUTCDate())
        if (DateTemp) {
            Texte = DateTemp.format('YYYYMMDD HH:mm:ss:SSS')
        }
    }
    Texte = Texte.replace(/-/g, '')
    Texte = Texte.replace(/T/g, ' ')
    if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
        Texte = moment(Texte, "YYYYMMDD HH:mm:ss:SSS").format('YYYY-MM-DDTHH:mm:ss')
    } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
        Texte = moment(Texte, "YYYYMMDD HH:mm:ss:SSS").format('YYYY-MM-DD HH:mm:ss')
    } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
        Texte = `to_date(${Texte},'yyyymmdd hh24:mi:ss')`
    }
    return `'${Texte}'`
}

exports.DatePartHour = (Field, Environnement, BddId) => {
    let Texte = ''
    if (Config.bdd[BddId][Environnement].config.type === 'MsSql') {
        Texte = `DATEPART(HOUR, ${Field})`
    } else if (Config.bdd[BddId][Environnement].config.type === 'MySql') {
        Texte = `DATE_FORMAT(${Field}, "%H")`
    } else if (Config.bdd[BddId][Environnement].config.type === 'Oracle') {
        Texte = `DATE_FORMAT(${Field}, "%H")`
    }
    return Texte
}

var ListeFormater = (TexteList, Environnement, BddId) => {
    var Texte = ''
    if (TexteList.length > 0)
    {
        for (var Item of TexteList)
        {
            if (Texte !== '') { Texte += `','` }
            Texte += ChaineFormater(Item.trim(), Environnement, BddId)
        }
        Texte = `'${Texte}'`
    }
    return Texte
}
exports.ListeFormater = ListeFormater
