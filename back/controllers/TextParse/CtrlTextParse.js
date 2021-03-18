exports.textParseList = (req, res) => {
  const data = require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList()
  res.end(JSON.stringify({ success: true, data }, null, 3))
}

exports.downloadCsv = (req, res) => {
  require(process.cwd() + '/controllers/TextParse/MdlTextParse').downloadCsv().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
