exports.Test = (req, res) => {
  require(process.cwd() + '/controllers/Test/MdlTest').Test(req.body.data1, req.body.data2).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Test2 = (req, res) => {
  require(process.cwd() + '/controllers/Test/MdlTest').Test2().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Test3 = (req, res) => {
  require(process.cwd() + '/controllers/Test/MdlTest').Test3().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Test5 = (req, res) => {
  require(process.cwd() + '/controllers/Test/MdlTest').Test5().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.importDgmarket = (req, res) => {
  require(process.cwd() + '/controllers/Test/MdlTest').importDgmarket().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.CpvCreateJson = (req, res) => {
  require(process.cwd() + '/controllers/Test/MdlTest').CpvCreateJson().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.CountryCreateCsv = (req, res) => {
  require(process.cwd() + '/controllers/Test/MdlTest').CountryCreateCsv().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
