exports.TenderAdd = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderAdd(req.body.tender).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.tenderCount = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').tenderCount().then((data) => {
    res.end(JSON.stringify({ success: true, data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderGet = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGet(req.body.id, req.body.algoliaId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.tenders = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').tenders(req.body.filter, req.body.orderBy, req.body.limit, req.body.page, req.body.pageLimit).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderList = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderList(req.body.id, req.body.algoliaId, req.body.creationDateMin, req.body.creationDateMax, req.body.termDateMin, req.body.termDateMax, req.body.cpvLabels, req.body.regions, req.body.limit, req.body.noticeType, req.body.country, req.body.orderBy).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderRemove = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderRemove(req.body.id, req.body.algoliaId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderStatistic = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderStatistic(req.body.year, req.body.month, req.body.user).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderGroupAddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGroupAddUpdate(req.body.tenderGroup).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderGroupDelete = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGroupDelete(req.body.tenderGroupId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderGroupList = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGroupList(req.body.tenderGroupId, req.body.userId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderGroupMove = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGroupMove(req.body.userId, req.body.tenderGroupId, req.body.tenderId, req.body.algoliaId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderArchiveMove = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderArchiveMove(req.body.userId, req.body.tenderId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderDeleteMove = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderDeleteMove(req.body.userId, req.body.tenderId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderGroupLinkList = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderGroupLinkList(req.body.userId, req.body.tenderId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderDetailAddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderDetailAddUpdate(req.body.tenderDetail).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TenderDetailList = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').TenderDetailList(req.body.userId, req.body.tenderId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.UserNotify = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').UserNotify(req.body.userIds, req.body.tenderId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.tenderFilterAddUpdate = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').tenderFilterAddUpdate(req.body.tenderFilter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.tenderFilterDelete = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').tenderFilterDelete(req.body.tenderFilterId).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.tenderFilterList = (req, res) => {
  require(process.cwd() + '/controllers/Tender/MdlTender').tenderFilterList(req.body.filter).then((data) => {
    res.end(JSON.stringify({ success: true, data: data }, null, 3))
  }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
