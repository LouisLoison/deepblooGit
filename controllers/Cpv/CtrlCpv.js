exports.CpvAddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvAddUpdate(req.body.cpv).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.cpvDelete = (req, res) => {
  require(process.cwd() + '/controllers/Cpv/MdlCpv').cpvDelete(req.body.cpvId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.CpvList = (req, res) => {
  require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvList(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.CpvSynchro = (req, res) => {
  require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvSynchro().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.CpvWordAddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Cpv/MdlCpv').CpvWordAddUpdate(req.body.cpvWord).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.cpvWordDelete = (req, res) => {
  require(process.cwd() + '/controllers/Cpv/MdlCpv').cpvWordDelete(req.body.cpvWordId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
