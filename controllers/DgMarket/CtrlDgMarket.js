exports.FtpGet = (req, res) => {
    require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').FtpGet().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
