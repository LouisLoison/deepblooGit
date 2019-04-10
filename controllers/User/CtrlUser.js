exports.Login = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').Login(req.body.username, req.body.password).then((data) => {
        res.end(JSON.stringify({ success: true, user: data.Utilisateur, token: data.Token }, null, 3))
    }).catch((err) => {
        require(process.cwd() + '/controllers/CtrlTool').onError(err, res)
    })
}

exports.List = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').List(req.body.filter).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.user = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').user(req.body.userId).then((data) => {
        res.end(JSON.stringify({ success: true, Utilisateur: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.AddUpdate = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').AddUpdate(req.body.user).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Synchro = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').Synchro().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.SetPremium = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').SetPremium(req.body.userId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
