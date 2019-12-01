exports.Test = (req, res) => {
    require(process.cwd() + '/controllers/Test/MdlTest').Test(req.body.data1, req.body.data2).then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Test2 = (req, res) => {
    require(process.cwd() + '/controllers/Test/MdlTest').Test2().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.Test3 = (req, res) => {
    require(process.cwd() + '/controllers/Test/MdlTest').Test3().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.ArchiveTest = (req, res) => {
    require(process.cwd() + '/controllers/Test/MdlTest').ArchiveTest().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => {
        require(process.cwd() + '/controllers/CtrlTool').onError(err, res)
    })
}

exports.CpvCreateJson = (req, res) => {
    require(process.cwd() + '/controllers/Test/MdlTest').CpvCreateJson().then((data) => {
        res.end(JSON.stringify({ success: true, data: data }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.OracleTest = (req, res) => {
    require(process.cwd() + '/controllers/Test/MdlTest').OracleTest().then(() => {
        res.end(JSON.stringify({ success: true }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.PromiseTest = (req, res) => {
    var JobInterfaceID = req.body.JobInterfaceID;
    require(process.cwd() + '/controllers/Test/MdlTest').PromiseTest(JobInterfaceID).then((recordset) => {
        res.end(JSON.stringify({ success: true, recordset: recordset }, null, 3))
    }).catch((err) => { require(process.cwd() + '/controllers/CtrlTool').onError(err, res) })
}

exports.SoketIoTest = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    function onError(err) {
        var ToolCtrl = require(process.cwd() + '/controllers/CtrlTool')
        ToolCtrl.onError(err, res)
    }
    function onSuccess() {
        res.end(JSON.stringify({ success: true }, null, 3))
    }

    var io = require('socket.io-client')
    var socket = io.connect('http://localhost:3001')
    socket.on('connect', () => {
      socket.emit('server custom event', { my: 'TestJc' })
      onSuccess()
    })
}

exports.XmlToJs = (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    function onError(err) {
        var ToolCtrl = require(process.cwd() + '/controllers/CtrlTool')
        ToolCtrl.onError(err, res)
    }
    function onSuccess() {
        res.end(JSON.stringify({ success: true }, null, 3))
    }

    var fs = require('fs')
    var xml2js = require('xml2js')
    var parser = new xml2js.Parser()
    var FileLocation = "C:/Ethelp/ref_DEV/CLIENT/EXPCLI_000_Master/EXPCLI_000_Master/items/client/process/EXPCLI_000_Source1/EXPCLI_000_Master_0.9.item"
    fs.readFile(FileLocation, (err, data) => {
        parser.parseString(data, (err, result) => {
            for (var ContextNum = 0; ContextNum < result["talendfile:ProcessType"].context.length; ContextNum++) {
                var Context = result["talendfile:ProcessType"].context[ContextNum]
                var confirmationNeeded = Context.$["confirmationNeeded"]
                var name = Context.$["name"]
                for (var ContextParameterNum = 0; ContextParameterNum < Context.contextParameter.length; ContextParameterNum++) {
                    var contextParameter = Context.contextParameter[ContextParameterNum]
                    var type = contextParameter.$["type"]
                    var value = contextParameter.$["value"]
                }
            }
            onSuccess()
        })
    })
}

exports.ParamJson = (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    function onError(err) {
        var ToolCtrl = require(process.cwd() + '/controllers/CtrlTool')
        ToolCtrl.onError(err, res)
    }
    function onSuccess() {
        res.end(JSON.stringify({ success: true }, null, 3))
    }

    console.log(req)
    onSuccess()
}
