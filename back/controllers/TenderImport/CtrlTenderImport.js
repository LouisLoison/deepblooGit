exports.ImportTenderInfo = (req, res) => {
  require(process.cwd() + '/controllers/TenderImport/TenderInfo/MdlTenderInfo').ImportTenderInfo().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.importTenderInfos = (req, res) => {
  require(process.cwd() + '/controllers/TenderImport/TenderInfo/MdlTenderInfo').importTenderInfos(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.importTenderInfoFacets = (req, res) => {
  require(process.cwd() + '/controllers/TenderImport/TenderInfo/MdlTenderInfo').importTenderInfoFacets(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.mergeTenderInfo = (req, res) => {
  require(process.cwd() + '/controllers/TenderImport/TenderInfo/MdlTenderInfo').mergeTender().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.statistics = (req, res) => {
  require(process.cwd() + '/controllers/TenderImport/MdlTenderImport').statistics(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
