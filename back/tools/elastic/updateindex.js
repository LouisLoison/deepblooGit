const { FtpGet, BddImport } = require('./controllers/DgMarket/MdlDgMarket.js');
const { connectToElasticsearch, tendersImport } = require('./controllers/Elasticsearch/MdlElasticsearch.js')

const config = require(process.cwd() + '/config')
/*
if (process.env.NODE_ENV !== 'test') {
  throw new Error(`Testing in NODE_ENV ${process.env.NODE_ENV}, should be 'test' `)
}
*/

try {
  // FtpGet()
  //BddImport().catch(err => console.log(err))
  tendersImport(1000000).catch(err => console.log(err))
} catch(err) {
  console.log(err)
}


