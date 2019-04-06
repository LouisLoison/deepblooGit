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
