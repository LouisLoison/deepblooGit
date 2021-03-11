exports.documentDelete = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').documentDelete(req.body.documentUuid).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.documentList = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').documentList(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.documentMessageList = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').documentMessageList(req.body.filter, req.body.userData).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.documentMessageAddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').documentMessageAddUpdate(req.body.documentMessage).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.documentMessageDelete = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').documentMessageDelete(req.body.documentMessageId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.tenderFileImport = (req, res) => {
  require(process.cwd() + '/controllers/Document/MdlDocument').tenderFileImport(req.body.tenderId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
