exports.TenderAdd = (req, res) => {
    require(process.cwd() + '/controllers/Tender/MdlTender').TenderAdd(req.body.tender).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderGet = (req, res) => {
    require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(req.body.id, req.body.algoliaId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderList = (req, res) => {
    require(process.cwd() + '/controllers/Tender/MdlTender').TenderList(req.body.id, req.body.algoliaId, req.body.creationDateMin, req.body.creationDateMax, req.body.termDateMin, req.body.termDateMax).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderRemove = (req, res) => {
    require(process.cwd() + '/controllers/Tender/MdlTender').TenderRemove(req.body.id, req.body.algoliaId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderStatistic = (req, res) => {
    require(process.cwd() + '/controllers/Tender/MdlTender').TenderStatistic(req.body.year, req.body.month).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
