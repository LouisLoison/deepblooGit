exports.RecordAddUpdate = (req, res) => {
    require(process.cwd() + '/global/BddTool').RecordAddUpdate(
        req.body.BddId, req.body.Environnement, req.body.TableName, req.body.Record
    ).then((data) => {
        res.end(JSON.stringify({ success: true, Record: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.RecordDelete = (req, res) => {
    require(process.cwd() + '/global/BddTool').RecordDelete(
        req.body.BddId, req.body.Environnement, req.body.TableName, req.body.RecordId
    ).then(() => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.RecordGet = (req, res) => {
    require(process.cwd() + '/global/BddTool').RecordGet(
        req.body.BddId, req.body.Environnement, req.body.TableName, req.body.RecordId
    ).then((data) => {
        res.end(JSON.stringify({ success: true, Record: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
