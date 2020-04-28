exports.textParseList = (req, res) => {
  require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseList(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
