exports.documentList = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').documentList(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.documentMessageAddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').documentMessageAddUpdate(req.body.documentMessage).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.tenderFileImport = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').tenderFileImport(req.body.tenderId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
