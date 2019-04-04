exports.EquipeList = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').EquipeList().then(function(EquipeList) {
        res.end(JSON.stringify({ success: true, EquipeList: EquipeList }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Login = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').Login(req.body.username, req.body.password).then((data) => {
        res.end(JSON.stringify({ success: true, user: data.Utilisateur, token: data.Token }, null, 3))
    }).catch((err) => {
        require(process.cwd() + '/controllers/CtrlTool').onError(err, res)
    })
}

exports.List = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').List().then((data) => {
        res.end(JSON.stringify({ success: true, UtilisateurList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Timeline = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUserTimeline').Timeline(req.body.Identifiant).then((data) => {
        res.end(JSON.stringify({ success: true, Timeline: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Utilisateur = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').Utilisateur(req.body.UtilisateurID).then((data) => {
        res.end(JSON.stringify({ success: true, Utilisateur: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.UtilisateurAddUpdate = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').UtilisateurAddUpdate(req.body.Utilisateur, req.body.ProjetList).then((data) => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.UtilisateurProjetList = (req, res) => {
    require(process.cwd() + '/controllers/User/MdlUser').UtilisateurProjetList(req.body.UtilisateurID).then((data) => {
        res.end(JSON.stringify({ success: true, UtilisateurProjetList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
