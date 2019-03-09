exports.AgentTest = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').AgentTest(req.body.Environnement, req.body.Server, req.body.AgentLocation).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ExecutionList = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').ExecutionList(
        req.body.FiltreDateMin,
        req.body.FiltreDateMax,
        req.body.FiltreServer,
        req.body.FiltreFlux,
        req.body.FiltreInterface,
        req.body.FiltrePlanExecID,
        req.body.Environnement,
        req.body.Flux,
        req.body.Interface,
        req.body.Sequenceur,
        req.body.Server,
        req.body.StatutIDList
    ).then((data) => {
        res.end(JSON.stringify({ success: true, ExecutionList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ExecLog = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').ExecLog(req.body.Environnement, req.body.Server, req.body.PlanExecID).then((data) => {
        res.end(JSON.stringify({ success: true, Log: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.JobEnd = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').JobEnd(
        req.body.PlanExecID,
        req.body.Environnement,
        req.body.Flux,
        req.body.Interface,
        req.body.Sequenceur,
        req.body.Sequenceur,
        req.body.code,
        req.body.pid,
        req.body.pid2,
        req.body.Responsable
    ).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.LogGet = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').LogGet(req.body.Environnement, req.body.Server, req.body.PlanExecID).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanActionLaunch = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanActionLaunch(
        req.body.Environnement,
        req.body.Flux,
        req.body.Interface,
        req.body.Sequenceur,
        req.body.Option
    ).then((data) => {
        res.end(JSON.stringify({ success: true, PlanAction: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanActionStop = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanActionStop(
        req.body.Environnement,
        req.body.Server,
        req.body.Flux,
        req.body.PlanExecID
    ).then((data) => {
        res.end(JSON.stringify({ success: true, PlanAction: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanificationList = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanificationList(req.body.Server, req.body.filtreFlux).then((data) => {
        res.end(JSON.stringify({ success: true, PlanificationList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanJobParamImport = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanJobParamImport(req.body.Environnement, req.body.FileName).then((data) => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanJobParamList = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanJobParamList(req.body.Environnement, req.body.PlanParamID).then((data) => {
        res.end(JSON.stringify({ success: true, PlanJobParamList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanParamList = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanParamList().then((data) => {
        res.end(JSON.stringify({ success: true, PlanParamList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanParamServerList = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanParamServerList(req.body.PlanParamID, req.body.Environnement).then((data) => {
        res.end(JSON.stringify({ success: true, PlanParamServerList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlanTacheList = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').PlanTacheList(req.body.Environnement, req.body.Flux).then((data) => {
        res.end(JSON.stringify({ success: true, PlanTacheList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Statistique = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').Statistique(req.body.FiltreDateMin, req.body.FiltreDateMax).then((data) => {
        res.end(JSON.stringify({ success: true, PeriodeList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.VariableOrdonnanceurList = (req, res) => {
    require(process.cwd() + '/controllers/Ordonnanceur/MdlOrdonnanceur').VariableOrdonnanceurList(req.body.Environnement).then((data) => {
        res.end(JSON.stringify({ success: true, VariableOrdonnanceurList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
