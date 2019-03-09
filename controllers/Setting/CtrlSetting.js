exports.ArchiveData = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSetting').ArchiveData().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => {
        require(process.cwd() + '/controllers/CtrlTool').onError(err, res)
    })
}

exports.BackConfig = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSetting').BackConfig().then((data) => {
        res.end(JSON.stringify({ success: true, BackConfig: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.BackConfigUpdate = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSetting').BackConfigUpdate(req.body.BackConfig,req.body.EnvActif).then((data) => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ColumnScriptSql = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingCheck').ColumnScriptSql(
        req.body.Environnement, req.body.BddName, req.body.TableName, req.body.ColumnName
    ).then((data) => {
        res.end(JSON.stringify({ success: true, ScriptSql: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ColumnAddBdd = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingCheck').ColumnAddBdd(
        req.body.Environnement, req.body.BddName, req.body.TableName, req.body.ColumnName
    ).then((data) => {
        res.end(JSON.stringify({ success: true, CheckResult: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.EnvironnementList = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingEnvironnement').EnvironnementList(req.body.FiltreEnvActif, req.body.FiltreEnvDefaut).then((data) => {
        res.end(JSON.stringify({ success: true, EnvironnementList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.FrontConfig = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSetting').FrontConfig().then((data) => {
        res.end(JSON.stringify({ success: true, FrontConfig: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.FrontConfigFieldUpdate = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSetting').FrontConfigFieldUpdate(req.body.Field, req.body.Value).then(() => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PlateformeList = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingPlateforme').PlateformeList().then((data) => {
        res.end(JSON.stringify({ success: true, PlateformeList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ServerAddUpdate = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingServer').ServerAddUpdate(req.body.Server).then((data) => {
        res.end(JSON.stringify({ success: true, Server: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ServerList = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingServer').ServerList().then((data) => {
        res.end(JSON.stringify({ success: true, ServerList: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.SchemaCheck = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingCheck').SchemaCheck(req.body.Environnement).then((data) => {
        res.end(JSON.stringify({ success: true, CheckResult: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TableAddBdd = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingCheck').TableAddBdd(req.body.Environnement, req.body.BddName, req.body.TableName).then((data) => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.TableScriptSql = (req, res) => {
    require(process.cwd() + '/controllers/Setting/MdlSettingCheck').TableScriptSql(
        req.body.Environnement, req.body.BddName, req.body.TableName
    ).then((data) => {
        res.end(JSON.stringify({ success: true, ScriptSql: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}
