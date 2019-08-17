exports.PrivateDealAdd = (req, res) => {
    require(process.cwd() + '/controllers/PrivateDeal/MdlPrivateDeal').PrivateDealAdd(req.body.privateDeal).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PrivateDealGet = (req, res) => {
    require(process.cwd() + '/controllers/PrivateDeal/MdlPrivateDeal').PrivateDealGet(req.body.id, req.body.algoliaId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PrivateDealList = (req, res) => {
    require(process.cwd() + '/controllers/PrivateDeal/MdlPrivateDeal').PrivateDealList(req.body.id, req.body.algoliaId, req.body.creationDateMin, req.body.creationDateMax, req.body.termDateMin, req.body.termDateMax, req.body.cpvLabels, req.body.regions).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PrivateDealRemove = (req, res) => {
    require(process.cwd() + '/controllers/PrivateDeal/MdlPrivateDeal').PrivateDealRemove(req.body.id, req.body.algoliaId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}