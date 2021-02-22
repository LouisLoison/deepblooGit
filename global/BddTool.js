const crypto = require('crypto')
const { getDbSecret } = require('../config')

var Config = require(process.cwd() + '/config')

const BddSchema = require(process.cwd() + '/global/BddSchema')
let configBdd = Config.bdd.deepbloo[Config.prefixe].config
//console.log(Config)

let BddId
let Environnement

let Schema
let pgPool = false;

exports.bddInit = async () => {
  configBdd = configBdd || await getDbSecret()
  configBdd.type = configBdd.type || configBdd.engine

  Schema = BddSchema.getSchema().deepbloo

  if (configBdd.type === 'postgres') {
    pgInitPool()
  }
}


exports.getClient = async () => {
  await this.bddInit()
  return await pgPool.connect() // Passes the client to enable transaction
}

const pgInitPool = () => {
  if(!pgPool) {
    const pgArgs = {
      host: configBdd.host || configBdd.server,
      user: configBdd.username || configBdd.user,
      password: configBdd.password,
      database: configBdd.dbname || configBdd.database,
      port: configBdd.port || 5432,
    }
    // console.log(`Connection to db ${configBdd.dbname} on ${configBdd.host}` )
    const { Pool } = require('pg')
    pgPool = new Pool(pgArgs)
  }
  return pgPool;
}


var getSHA1ofJSON = function(input){
  return crypto.createHash('sha1').update(JSON.stringify(input)).digest('hex')
}

exports.getSHA1ofJSON = getSHA1ofJSON

var QueryExecMsSql = async function(onError, onSuccess, Query) {
  var sql = require('mssql')

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

var QueryExecMySql = (onError, onSuccess, Query, rowsCount) => {
  const mysql = require('mysql')
  const configBdd = configBdd

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

var QueryExecOracle = async function(onError, onSuccess, Query) {
  var oracledb = require('oracledb')
  var configBdd = configBdd

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


var QueryExecpostgres = (onError, onSuccess, Query, rowsCount) => {
  try {
    pgInitPool()
    console.log(Query)
    pgPool.query(Query, (err, results) => {
      if (err) {
        err.Query = Query
        onError(err)
        return false
      }
      if (rowsCount) {
        onSuccess({
          results: results.rows,
          total: results.rowCount,
        })
      } else {
        onSuccess(results.rows);
      }
    })
  } catch (err) {
    err.Query = Query
    onError(err)
  }
}

exports.QueryExecPrepared = async (client, Query, actualValues, tableName=false) => {
  const preparedQuery = {
    name: getSHA1ofJSON(Query),
    text: Query,
    values: actualValues || [],
    rowMode: 'array',
  }

  console.log(preparedQuery);
  const { rows, fields, rowCount } = await client.query(preparedQuery)

  return tableName ? pgMapResult(rows, fields, tableName) : { rows, fields, rowCount }
}

var QueryExecBdd = (Query, onError, onSuccess, rowsCount) => {
  // console.log(configBdd)
  if (configBdd.type === 'MsSql') {
    QueryExecMsSql(onError, onSuccess, Query)
  } else if (configBdd.type === 'MySql') {
    QueryExecMySql(onError, onSuccess, Query, rowsCount)
  } else if (configBdd.type === 'Oracle') {
    QueryExecOracle(onError, onSuccess, Query)
  } else if (configBdd.type === 'postgres') {
    console.log(Query)
    QueryExecpostgres(onError, onSuccess, Query, rowsCount)
  }
}
exports.QueryExecBdd = QueryExecBdd

exports.QueryExecBdd2 = (Query, rowsCount) => {

  return new Promise((resolve, reject) => {
    this.QueryExecBdd(Query, reject, resolve, rowsCount)
  })
}

// Now using prepared statement for SQL injection prevention
// Also allow to set NULLs (null) and default values (undefined)
// Best of all, uses "UPSERT" in postgres style (INSERT .. ON CONFLICT(..) DO UPDATE ..) for atomic ops
const RecordAddUpdatepostgres = async(TableName, Record, ColumnKey, client = false) => {
  let ColumnList = []
  if(!Schema) {
    this.bddInit()
  }
  let Table = Schema[TableName]
  // console.log(TableName, Record)
  for(let ColumnName in Table) {
    let Column = Table[ColumnName]
    if (Column.key && !ColumnKey) {
    // if (Column.key) {
      ColumnKey = ColumnName
    }
    if (ColumnName in Record) {
      ColumnList.push(ColumnName)
    }
  }
  let Query = ''
  //  if (Record[ColumnKey] && Record[ColumnKey] !== 0 && Record[ColumnKey] !== '') {
  let UpdateColumnsList = []
  let insertColumnList = []
  let insertValuesList = []
  let actualValues = []
  let index = 0
  for(let ColumnName of ColumnList) {
    insertColumnList.push(ColumnName)
    if (ColumnName === 'creationDate') {
      insertValuesList.push('now()')
    } else if (ColumnName === 'updateDate') {
      insertValuesList.push('now()')
      UpdateColumnsList.push('updateDate = now()')
    } else {
      index++;
      insertValuesList.push(`$${index}`)
      UpdateColumnsList.push(`${ColumnName} = $${index}`)
      if (ColumnName === 'owner') {
        actualValues.push(Config.user.Identifiant)
      } else {
        if (Table[ColumnName].type === 'DateTime') {
          actualValues.push(this.DateFormater(Record[ColumnName]))
        } else if (Table[ColumnName].type === 'Json') {
          actualValues.push(JSON.stringify(Record[ColumnName]))
        } else {
          actualValues.push(Record[ColumnName])
        }
      }
    }
  }

  Query = `
    INSERT INTO "${TableName}" (${insertColumnList.join(', ')})
    VALUES (${insertValuesList.join(', ')})
    ON CONFLICT (${ColumnKey}) DO UPDATE SET ${UpdateColumnsList.join(', ')}
    RETURNING *
  `
  console.log(Query)

  const preparedQuery = {
    name: getSHA1ofJSON(Query),
    text: Query,
    values: actualValues,
    rowMode: 'array',
  }

  const { rows, fields } = await (client || pgPool).query(preparedQuery)
  // console.log(rows);
  const [ result ] = pgMapResult(rows, fields, TableName)

  return result
}

const pgMapResult = (rows, fields, TableName) => {

  const higherCols = Object.keys(Schema[TableName]).reduce((acc, val) => {
    return {...acc, [val.toLowerCase()]: val };
  }, {})

  return rows.map(row => {
    const mapedRow = {};
    fields.forEach(({ name }, index) => {
      if (name in higherCols) {
        mapedRow[higherCols[name]] = row[index]
      } else {
        mapedRow[name] = row[index]
      }
    })
    return mapedRow
  })
}

exports.pgMapResult = pgMapResult

const RecordAddUpdateGeneric = (TableName, Record) => {
  return new Promise((resolve, reject) => {
    try {
      let ColumnKey = ''
      let ColumnList = []
      let Table = Schema[TableName]
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
            UpdateListText += `'${ChaineFormater(Record[ColumnName])}' `
          } else if (Table[ColumnName].type === 'Text') {
            UpdateListText += `'${ChaineFormater(Record[ColumnName])}' `
          } else if (Table[ColumnName].type === 'Time') {
            UpdateListText += `'${ChaineFormater(Record[ColumnName])}' `
          } else if (Table[ColumnName].type === 'Int') {
            UpdateListText += `${NumericFormater(Record[ColumnName])} `
          } else if (Table[ColumnName].type === 'DateTime') {
            UpdateListText += `${this.DateFormater(Record[ColumnName])} `
          } else {
            UpdateListText += `${Record[ColumnName]} `
          }
        }
        if (Table['updateDate'] !== undefined) { UpdateListText += `, updateDate = ${DateNow(Environnement, BddId)}` }
        if (Table['owner'] !== undefined && Config.user.Identifiant) { UpdateListText += `, owner = '${ChaineFormater(Config.user.Identifiant)}'` }

        Query = `
          UPDATE ${TableName} 
          SET ${UpdateListText} 
          WHERE ${ColumnKey} = ${Record[ColumnKey]} 
        `
        QueryExecBdd(Query, (err) => { err.Query = Query; reject(err); }, (recordset) => {
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
            ValueListText += `'${ChaineFormater(Record[ColumnName])}' `
          } else if (Table[ColumnName].type === 'Text') {
            ValueListText += `'${ChaineFormater(Record[ColumnName])}' `
          } else if (Table[ColumnName].type === 'Time') {
            ValueListText += `'${ChaineFormater(Record[ColumnName])}' `
          } else if (Table[ColumnName].type === 'Int') {
            ValueListText += `${NumericFormater(Record[ColumnName])} `
          } else if (Table[ColumnName].type === 'DateTime') {
            ValueListText += `${this.DateFormater(Record[ColumnName])} `
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
          ValueListText += `'${ChaineFormater(Config.user.Identifiant)}' `
        }

        if (configBdd.type === 'MySql') {
          ColumnListText = ColumnListText.replace(/"/g, '')
        }
        Query = `
          INSERT INTO ${TableName} (${ColumnListText}) 
          VALUES (${ValueListText}) `
        if (ColumnKey != '') {
          if (configBdd.type === 'MsSql') {
            Query += `; 
              SELECT @@IDENTITY AS \'identity\';`
          } else if (configBdd.type === 'MySql') {
            Query += ``
          } else if (configBdd.type === 'Oracle') {
            Query += ''
          }
        }
        QueryExecBdd(Query, (err) => { err.Query = Query; reject(err); }, (recordset) => {
          if (ColumnKey != '' && recordset) {
            if (configBdd.type === 'MsSql') {
              if (recordset.length > 0) {
                Record[ColumnKey] = recordset[0].identity
              }
            } else if (configBdd.type === 'MySql') {
              Record[ColumnKey] = recordset.insertId
            } else if (configBdd.type === 'Oracle') {
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

exports.RecordAddUpdate = async (TableName, Record, ColumnKey, client=false) => {
  if(!configBdd) { await this.bddInit() }
  if (configBdd.type === 'postgres') {
    return await RecordAddUpdatepostgres(TableName, Record, ColumnKey, client)
  } else {
    return await RecordAddUpdateGeneric(TableName,   Record)
  }
}

exports.bulkInsertpostgres = async (TableName, records, client=false) => {
  let Table = Schema[TableName]

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


  const Query = {
    name: getSHA1ofJSON(TableName + '-' + columns.join('-')),
    text: `INSERT INTO ${TableName} (${columns.join(', ')}) VALUES (${
      columns.map((val, index) => "$" + (index + 1)).join(', ')
    })`,
    rowMode: 'array',
  }

  pgInitPool()
  let errors = 0
  await values.forEach(async value => {
    Query.values = value
    await (client || pgPool) .query(Query)
      .catch(err => {
        err.Query = Query
        err.Values = values
        errors += 1
      })
  })
  return { updated: values.length, errors }
}

const bulkInsertGeneric = (TableName, records) => {
  return new Promise((resolve, reject) => {
    try
    {
      const mysql = require('mysql')
      const configBdd = configBdd

      let Table = Schema[TableName]

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

exports.bulkInsert = async (TableName, records) => {
  if (configBdd.type === 'postgres') {
    return await this.bulkInsertpostgres(TableName, records)
  } else {
    return await bulkInsertGeneric(TableName, records)
  }
}

exports.RecordGet = (TableName, RecordId) => {
  return new Promise((resolve, reject) => {
    var Record = {}
    var ColumnKey = ''
    var ColumnListTexte = ''
    var Table = Schema[TableName]
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
    QueryExecBdd(Query, reject, (recordset) => {
      for (var recordItem of recordset) {
        for(var ColumnName in Table) {
          Record[ColumnName] = recordItem[ColumnName]
        }
      }
      resolve(Record)
    })
  })
}

exports.RecordDelete = (TableName, RecordId) => {
  return new Promise((resolve, reject) => {
    var ColumnKey = ''
    var Table = Schema[TableName]
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
    QueryExecBdd(Query, reject, () => {
      resolve()
    })
  })
}

var BddColumnType = (Type) => {
  var TypeTexte = '';
  if (configBdd.type === 'MsSql') {
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
  } else if (configBdd.type === 'MySql') {
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
  } else if (configBdd.type === 'postgres') {
    if (Type === 'String') {
      TypeTexte = `varchar(255)`
    } else if (Type === 'Text') {
      TypeTexte = `text`
    } else if (Type === 'Int') {
      TypeTexte = `int`
    } else if (Type === 'BigInt') {
      TypeTexte = `int8`
    } else if (Type === 'DateTime') {
      TypeTexte = `timestamptz`
    } else if (Type === 'Time') {
      TypeTexte = `time`
    }
  } else if (configBdd.type === 'Oracle') {
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
  if (configBdd.type === 'MsSql') {
    DateTexte = 'GETDATE()'
  } else if (configBdd.type === 'MySql') {
    DateTexte = 'NOW()'
  } else if (configBdd.type === 'Oracle') {
    DateTexte = 'SYSTIMESTAMP'
  }
  return DateTexte
}
exports.DateNow = DateNow

var ChaineFormater = (Texte) => {
  if (!Texte) { return '' }
  Texte += ''
  if (configBdd.type === 'MsSql') {
    Texte = Texte
  } else if (configBdd.type === 'MySql') {
    Texte = Texte.replace(/\\/gi, '\\\\')
  } else if (configBdd.type === 'postgres') {
    Texte = Texte.replace(/\\/gi, '\\\\')
  } else if (configBdd.type === 'Oracle') {
    Texte = Texte
  }
  //Texte = Texte.replace(new RegExp(`'`), '\\\'')
  Texte = Texte.replace(/'/g, `''`)
  return Texte
}
exports.ChaineFormater = ChaineFormater

var ChaineListeFormater = (Texte, Separateur) => {
  if (Texte.trim() !== '')
  {
    var ItemList = Texte.split(Separateur)
    var Texte = this.ArrayStringFormat(ItemList)
  }
  return Texte
}
exports.ChaineListeFormater = ChaineListeFormater

exports.ArrayStringFormat = (ItemList) => {
  var Texte = ''
  for (var Item of ItemList)
  {
    if (Texte !== '') { Texte += `','` }
    Texte += ChaineFormater(Item.trim())
  }
  Texte = `'${Texte}'`
  return Texte
}

var NumericFormater = (Texte) => {
  var value = 0
  try {
    value = Number(Texte)
  }
  catch(err) {
    throw new Error(`${Texte} is not a Number`)
  }
  if (!isFinite(value)) { value = 0 }
  return value
}
exports.NumericFormater = NumericFormater

exports.ArrayNumericFormater = (ItemList) => {
  var Texte = ''
  for (var Item of ItemList)
  {
    if (Texte !== '') { Texte += `,` }
    Texte += NumericFormater(Item)
  }
  Texte = `${Texte}`
  return Texte
}

exports.DateFormater = (Texte) => {
  var moment = require('moment')
  if (Texte instanceof Date) {
    let DateTemp = moment(Texte).utcOffset(Texte.getUTCDate())
    if (DateTemp) {
      Texte = DateTemp.format('YYYYMMDD HH:mm:ss:SSS')
    }
  }
  Texte = Texte.replace(/-/g, '')
  Texte = Texte.replace(/T/g, ' ')
  if (configBdd.type === 'MsSql') {
    Texte = moment(Texte, "YYYYMMDD HH:mm:ss:SSS").format('YYYY-MM-DDTHH:mm:ss')
  } else if (configBdd.type === 'MySql') {
    Texte = moment(Texte, "YYYYMMDD HH:mm:ss:SSS").format('YYYY-MM-DD HH:mm:ss')
  } else if (configBdd.type === 'postgres') {
    Texte = moment(Texte, "YYYYMMDD HH:mm:ss:SSS").format('YYYY-MM-DD HH:mm:ss')
  } else if (configBdd.type === 'Oracle') {
    Texte = `to_date(${Texte},'yyyymmdd hh24:mi:ss')`
  }
  return `'${Texte}'`
}

exports.DatePartHour = (Field) => {
  let Texte = ''
  if (configBdd.type === 'MsSql') {
    Texte = `DATEPART(HOUR, ${Field})`
  } else if (configBdd.type === 'MySql') {
    Texte = `DATE_FORMAT(${Field}, "%H")`
  } else if (configBdd.type === 'Oracle') {
    Texte = `DATE_FORMAT(${Field}, "%H")`
  }
  return Texte
}

var ListeFormater = (TexteList) => {
  var Texte = ''
  if (TexteList.length > 0)
  {
    for (var Item of TexteList)
    {
      if (Texte !== '') { Texte += `','` }
      Texte += ChaineFormater(Item.trim())
    }
    Texte = `'${Texte}'`
  }
  return Texte
}
exports.ListeFormater = ListeFormater
