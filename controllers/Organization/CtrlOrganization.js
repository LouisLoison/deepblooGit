exports.List = (req, res) => {
    require(process.cwd() + '/controllers/Organization/MdlOrganization').List(req.body.filter).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Organization = (req, res) => {
    require(process.cwd() + '/controllers/Organization/MdlOrganization').Organization(req.body.userId).then((data) => {
        res.end(JSON.stringify({ success: true, Utilisateur: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.AddUpdate = (req, res) => {
    require(process.cwd() + '/controllers/Organization/MdlOrganization').AddUpdate(req.body.user).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
