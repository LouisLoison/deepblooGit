exports.FichierAjouter = (req, res) => {
    require(process.cwd() + '/controllers/Document/MdlDocument').FichierAjouter(
        req.body.Projet,
        req.body.Sequenceur,
        req.body.FichierNom
    ).then((data) => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.List = (req, res) => {
    require(process.cwd() + '/controllers/Document/MdlDocument').List( req.body.Projet, req.body.Sequenceur).then(function(data) {
        res.end(JSON.stringify({ success: true, DocumentList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
