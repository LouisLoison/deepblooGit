exports.TendersImport = (req, res) => {
    require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TendersImport().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TendersAdd = (req, res) => {
    require(process.cwd() + '/controllers/Algolia/MdlAlgolia').TendersAdd().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Test = (req, res) => {
    require(process.cwd() + '/controllers/Algolia/MdlAlgolia').Test().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
