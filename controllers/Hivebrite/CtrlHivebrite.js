exports.TokenGet = (req, res) => {
    require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').TokenGet().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.VenturesGet = (req, res) => {
    require(process.cwd() + '/controllers/Hivebrite/MdlHivebrite').VenturesGet().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
