exports.List = (req, res) => {
  require(process.cwd() + '/controllers/Organization/MdlOrganization').List(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Organization = (req, res) => {
  require(process.cwd() + '/controllers/Organization/MdlOrganization').Organization(req.body.organizationId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.AddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Organization/MdlOrganization').AddUpdate(req.body.organization).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ListFromCpvs = (req, res) => {
  require(process.cwd() + '/controllers/Organization/MdlOrganization').ListFromCpvs(req.body.cpvs, req.body.country).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
