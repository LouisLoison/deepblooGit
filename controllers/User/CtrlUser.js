exports.Login = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').Login(req.body.username, req.body.password).then((data) => {
        res.end(JSON.stringify({ success: true, user: data.user, token: data.token }, null, 3))
    }).catch((err) => {
        require(process.cwd() + '/controllers/CtrlTool').onError(err, res)
    })
}

exports.List = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').List(req.body.filter).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.User = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').User(req.body.userId).then((data) => {
        res.end(JSON.stringify({ success: true, Utilisateur: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Memberships = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').Memberships(req.body.userId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
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

exports.SynchroFull = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').SynchroFull().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.SetPremium = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').SetPremium(req.body.userId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Opportunity = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').Opportunity(req.body.userId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
