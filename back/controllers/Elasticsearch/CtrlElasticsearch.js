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

exports.search = (req, res) => {
  require(process.cwd() + '/controllers/Elasticsearch/MdlElasticsearch').search(req.body.searchRequest).then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.multiSearch = (req, res) => {
  require(process.cwd() + '/controllers/Elasticsearch/MdlElasticsearch').multiSearch(req.body.searchRequests).then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.searchFacet = (req, res) => {
  require(process.cwd() + '/controllers/Elasticsearch/MdlElasticsearch').searchFacet(req.body.query, req.body.facet).then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
