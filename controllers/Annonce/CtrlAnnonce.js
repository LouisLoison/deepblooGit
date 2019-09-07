
exports.AddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Annonce/MdlAnnonce').AddUpdate(req.body.annonce).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.List = (req, res) => {
  require(process.cwd() + '/controllers/Annonce/MdlAnnonce').List(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Remove = (req, res) => {
  require(process.cwd() + '/controllers/Annonce/MdlAnnonce').Remove(req.body.annonceId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Click = (req, res) => {
  require(process.cwd() + '/controllers/Annonce/MdlAnnonce').Click(req.body.annonceId, req.body.userId, req.body.screen).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.AnnonceClickList = (req, res) => {
  require(process.cwd() + '/controllers/Annonce/MdlAnnonce').AnnonceClickList(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
