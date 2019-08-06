exports.OpportunityAdd = (req, res) => {
    require(process.cwd() + '/controllers/Opportunity/MdlOpportunity').OpportunityAdd(req.body.Opportunity).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.OpportunityGet = (req, res) => {
    require(process.cwd() + '/controllers/Opportunity/MdlOpportunity').OpportunityGet(req.body.id, req.body.algoliaId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.OpportunityList = (req, res) => {
    require(process.cwd() + '/controllers/Opportunity/MdlOpportunity').OpportunityList(req.body.id, req.body.algoliaId, req.body.creationDateMin, req.body.creationDateMax, req.body.termDateMin, req.body.termDateMax, req.body.cpvLabels, req.body.regions).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.OpportunityRemove = (req, res) => {
    require(process.cwd() + '/controllers/Opportunity/MdlOpportunity').OpportunityRemove(req.body.id, req.body.algoliaId).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}