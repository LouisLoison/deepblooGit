exports.BddImport = (req, res) => {
  require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').BddImport().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.FileParse = (req, res) => {
  require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').FileParse().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.FtpGet = (req, res) => {
  require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').FtpGet().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.CpvList = (req, res) => {
  require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').CpvList().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ExportUrlFromFile = (req, res) => {
  require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').ExportUrlFromFile().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
