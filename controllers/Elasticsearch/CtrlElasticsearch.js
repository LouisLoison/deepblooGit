/*
exports.test = (req, res) => {
  require(process.cwd() + '/controllers/Elasticsearch/MdlElasticsearch').test().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
*/

exports.tendersImport = (req, res) => {
  require(process.cwd() + '/controllers/Elasticsearch/MdlElasticsearch').tendersImport().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
