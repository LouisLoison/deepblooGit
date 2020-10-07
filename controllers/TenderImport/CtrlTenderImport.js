exports.ImportTenderInfo = (req, res) => {
  require(process.cwd() + '/controllers/TenderImport/TenderInfo/MdlTenderInfo').ImportTenderInfo().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.mergeTenderInfo = (req, res) => {
  require(process.cwd() + '/controllers/TenderImport/TenderInfo/MdlTenderInfo').mergeTender().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
