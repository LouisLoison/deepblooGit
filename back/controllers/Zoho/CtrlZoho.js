exports.synchro = (req, res) => {
  require(process.cwd() + '/controllers/Zoho/MdlZoho').synchro().then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
