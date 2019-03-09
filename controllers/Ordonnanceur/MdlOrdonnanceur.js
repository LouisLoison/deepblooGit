exports.AgentTest = (Environnement, Server, AgentLocation) => {
    return new Promise((resolve, reject) => {
        require('axios').post(`${AgentLocation}/api/Test/AgentStatut`, {
            Environnement: Environnement,
            Server: Server
        }).then(response => {
            resolve(true)
        }).catch(err => { resolve(err) })
    })
}

exports.ExecutionList = (FiltreDateMin, FiltreDateMax, FiltreServer, FiltreFlux, FiltreInterface, FiltrePlanExecID, Environnement, Flux, Interface, Sequenceur, Server, StatutIDList) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var ActionStopList = []
        var ExecutionList = []
        var Query = ''
        var Where = ''

        // Get action list
        Query = `
            SELECT       PlanActionID AS "PlanActionID", 
                         Environnement AS "Environnement",
                         Server AS "Server",
                         Type AS "Type",
                         Parametre AS "Parametre",
                         Statut AS "Statut", 
                         CreationDate AS "CreationDate", 
                         ModificationDate AS "ModificationDate", 
                         Responsable AS "Responsable" 
            FROM         PlanAction 
        `
        Where = ``
        if (Server && Server !== '') { if (Where !== '') { Where += 'AND '} Where += `Server = '${BddTool.ChaineFormater(FiltreServer, BddEnvironnement, BddId)}' ` + '\n' }
        if (FiltreDateMin && FiltreDateMin !== '') { if (Where !== '') { Where += 'AND '} Where += `CreationDate >= ${BddTool.DateFormater(FiltreDateMin, BddEnvironnement, BddId)} ` + '\n' }
        if (FiltreDateMax && FiltreDateMax !== '') { if (Where !== '') { Where += 'AND '} Where += `CreationDate <= ${BddTool.DateFormater(FiltreDateMax, BddEnvironnement, BddId)} ` + '\n' }
        if (FiltreServer && FiltreServer !== '') { if (Where !== '') { Where += 'AND '} Where += `Server LIKE '%${BddTool.ChaineFormater(FiltreServer, BddEnvironnement, BddId)}%' ` + '\n' }
        let WhereType = ''
        if (FiltreFlux && FiltreFlux !== '') {
            if (WhereType !== '') { WhereType += 'AND ' }
            WhereType += `(` + '\n'
            WhereType += `(Type = 1 AND Parametre LIKE '%${BddTool.ChaineFormater(FiltreFlux, BddEnvironnement, BddId)}%') ` + '\n'
            WhereType += `OR ` + '\n'
            WhereType += `(Type = 3 AND Parametre LIKE '%${BddTool.ChaineFormater(FiltreFlux, BddEnvironnement, BddId)}%|%') ` + '\n'
            WhereType += `)` + '\n'
        }
        if (FiltreInterface && FiltreInterface !== '') {
            if (WhereType !== '') { WhereType += 'AND ' }
            WhereType += `Type = 3 ` + '\n'
            WhereType += `AND Parametre LIKE '%|%${BddTool.ChaineFormater(FiltreInterface, BddEnvironnement, BddId)}%|%' ` + '\n'
        }
        if (Environnement && Environnement !== '') { if (Where !== '') { Where += 'AND '} Where += `Environnement = '${BddTool.ChaineFormater(Environnement, BddEnvironnement, BddId)}' ` + '\n' }
        if (Flux && Flux !== '') {
            if (WhereType !== '') { WhereType += 'AND ' }
            WhereType += `(` + '\n'
            WhereType += `(Type = 1 AND Parametre = '${BddTool.ChaineFormater(Flux, BddEnvironnement, BddId)}') ` + '\n'
            WhereType += `OR ` + '\n'
            WhereType += `(Type = 3 AND Parametre LIKE '${BddTool.ChaineFormater(Flux, BddEnvironnement, BddId)}|%') ` + '\n'
            WhereType += `)` + '\n'
        }
        if (Interface && Interface !== '') {
            if (WhereType !== '') { WhereType += 'AND '}
            WhereType += `Type = 3 ` + '\n'
            WhereType += `AND Parametre LIKE '%|${BddTool.ChaineFormater(Interface, BddEnvironnement, BddId)}|%' ` + '\n'
        }
        if (Sequenceur && Sequenceur !== '') {
            if (WhereType !== '') { WhereType += 'AND '}
            WhereType += `Type = 3 ` + '\n'
            WhereType += `AND Parametre LIKE '%|%|${BddTool.ChaineFormater(Sequenceur, BddEnvironnement, BddId)}' ` + '\n'
        }
        if (WhereType !== '') {
            if (Where !== '') { Where += 'AND '}
            Where += `(${WhereType} OR Type = 2) ` + '\n'
        }
        // if (StatutIDList && StatutIDList !== '') { if (Where !== '') { Where += 'AND '} Where += `Statut IN (${BddTool.ChaineFormater(StatutIDList, BddEnvironnement, BddId)}) ` }
        if (Where !== '') { Query += 'WHERE ' + Where }
        Query += `ORDER BY     CreationDate DESC `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                let Execution = {
                    ExecutionType: 'PlanAction',
                    PlanActionID: record.PlanActionID, 
                    Environnement: record.Environnement, 
                    Server: record.Server, 
                    Type: record.Type,
                    Parametre: record.Parametre,
                    Statut: record.Statut, 
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                }
                if (Execution.Type === 2) {
                    ActionStopList.push(Execution)
                } else {
                    ExecutionList.push(Execution)
                }
            }
            getPlanExec()
        })

        // Get execution list
        function getPlanExec()
        {
            Query = `
                SELECT      PlanExecID AS "PlanExecID", 
                            Flux AS "Flux", 
                            Interface AS "Interface", 
                            Sequenceur AS "Sequenceur", 
                            PID AS "PID", 
                            PID2 AS "PID2", 
                            DateDebut AS "DateDebut", 
                            DateFin AS "DateFin", 
                            Server AS "Server", 
                            Environnement AS "Environnement", 
                            PlanActionID AS "PlanActionID", 
                            Statut AS "Statut", 
                            CreationDate AS "CreationDate", 
                            ModificationDate AS "ModificationDate", 
                            Responsable AS "Responsable" 
                FROM        PlanExec 
            `
            Where = ``
            if (FiltreDateMin && FiltreDateMin !== '') { if (Where !== '') { Where += 'AND '} Where += `CreationDate >= ${BddTool.DateFormater(FiltreDateMin, BddEnvironnement, BddId)} ` }
            if (FiltreDateMax && FiltreDateMax !== '') { if (Where !== '') { Where += 'AND '} Where += `CreationDate <= ${BddTool.DateFormater(FiltreDateMax, BddEnvironnement, BddId)} ` }
            if (FiltreServer && FiltreServer !== '') { if (Where !== '') { Where += 'AND '} Where += `Server LIKE '%${BddTool.ChaineFormater(FiltreServer, BddEnvironnement, BddId)}%' ` }
            if (FiltreFlux && FiltreFlux !== '') { if (Where !== '') { Where += 'AND '} Where += `Flux LIKE '%${BddTool.ChaineFormater(FiltreFlux, BddEnvironnement, BddId)}%' ` }
            if (FiltreInterface && FiltreInterface !== '') { if (Where !== '') { Where += 'AND '} Where += `Interface LIKE '%${BddTool.ChaineFormater(FiltreInterface, BddEnvironnement, BddId)}%' ` }
            if (FiltrePlanExecID && FiltrePlanExecID !== '') { if (Where !== '') { Where += 'AND '} Where += `PlanExecID LIKE '%${BddTool.ChaineFormater(FiltrePlanExecID, BddEnvironnement, BddId)}%' ` + '\n' }
            if (Environnement && Environnement !== '') { if (Where !== '') { Where += 'AND '} Where += `Environnement = '${BddTool.ChaineFormater(Environnement, BddEnvironnement, BddId)}' ` }
            if (Flux && Flux !== '') { if (Where !== '') { Where += 'AND '} Where += `Flux = '${BddTool.ChaineFormater(Flux, BddEnvironnement, BddId)}' ` }
            if (Interface && Interface !== '') { if (Where !== '') { Where += 'AND '} Where += `Interface = '${BddTool.ChaineFormater(Interface, BddEnvironnement, BddId)}' ` }
            if (Sequenceur && Sequenceur !== '') { if (Where !== '') { Where += 'AND '} Where += `Sequenceur = '${BddTool.ChaineFormater(Sequenceur, BddEnvironnement, BddId)}' ` }
            if (Server && Server !== '') { if (Where !== '') { Where += 'AND '} Where += `Server = '${BddTool.ChaineFormater(Server, BddEnvironnement, BddId)}' ` + '\n' }
            if (StatutIDList && StatutIDList !== '') { if (Where !== '') { Where += 'AND '} Where += `Statut IN (${BddTool.ChaineFormater(StatutIDList, BddEnvironnement, BddId)}) ` }
            if (Where !== '') { Query += 'WHERE ' + Where }
            Query += `
                ORDER BY     DateDebut DESC  
            `
            BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
                for (var record of recordset) {
                    ExecutionList.push({
                        ExecutionType: 'PlanExec',
                        PlanExecID: record.PlanExecID, 
                        Flux: record.Flux, 
                        Interface: record.Interface, 
                        Sequenceur: record.Sequenceur, 
                        PID: record.PID, 
                        PID2: record.PID2, 
                        DateDebut: record.DateDebut, 
                        DateFin: record.DateFin, 
                        Server: record.Server, 
                        Environnement: record.Environnement, 
                        PlanActionID: record.PlanActionID, 
                        Statut: record.Statut, 
                        CreationDate: record.CreationDate, 
                        ModificationDate: record.ModificationDate, 
                        Responsable: record.Responsable,
                    })
                }

                for (let ActionStop of ActionStopList) {
                    let Execution = ExecutionList.find(a => a.PlanExecID === parseInt(ActionStop.Parametre))
                    if (!Execution) { continue }
                    if (!Execution.ActionStopList) { Execution.ActionStopList = [] }
                    Execution.ActionStopList.push(ActionStop)
                }
                resolve(ExecutionList)
            })
        }
    })
}

exports.ExecLog = (Environnement, Server, PlanExecID) => {
    return new Promise(async (resolve, reject) => {
        const Config = require(process.cwd() + '/config')
        const fs = require('fs-extra')
        const path = require('path')

        // Get server information
        let AgentStatut = null
        let AgentLocation = null
        try {
            let ServerFind = await require(process.cwd() + '/controllers/Setting/MdlSettingServer').ServerGet(Server)
            if (ServerFind && ServerFind[`AgentStatut${Environnement}`]) {
                AgentStatut = ServerFind[`AgentStatut${Environnement}`]
                AgentLocation = ServerFind[`AgentLocation${Environnement}`]
            }
        } catch (err) { }

        // Si le server n'utilise pas d'agent
        if (!AgentStatut || AgentStatut !== 1) {
            let LogFolder = path.join(Config.WorkSpaceFolder, 'Planhelp/Log/')
            let LogFile = `[LOG][${PlanExecID}].log`
            let LogLocation = path.join(LogFolder, LogFile)
            fs.readFile(LogLocation, 'utf8', (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(data)
            })
        } else {
            try {
                let response = await require('axios').post(`${AgentLocation}/api/Ordonnanceur/ExecLog`, {
                    Environnement: Environnement,
                    Server: Server,
                    PlanExecID: PlanExecID
                })
                resolve(response.data.Log)
            } catch (err) { reject(err); return }
        }
    })
}

exports.JobEnd = (PlanExecID, Environnement, Flux, Interface, Sequenceur, Server, code, pid, pid2, Responsable) => {
    return new Promise((resolve, reject) => {
        const moment = require('moment')
        const Config = require(process.cwd() + '/config')
        const BddTool = require(process.cwd() + '/global/BddTool')
        if (!PlanExecID || PlanExecID === '' || PlanExecID === 0) { throw new Error('No PlanExecID !') }
        let Statut = 2
        if (parseInt(code) != 0) { Statut = -1 }
        const BddId = 'EtlTool'
        const BddEnvironnement = 'PRD'
        BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'PlanExec', {
            PlanExecID: PlanExecID,
            DateFin: moment().format('YYYY-MM-DD HH:mm:ss'),
            PID2: pid2 ? pid2 : undefined,
            Statut: Statut
        }).then((data) => {
            resolve(data)
        }).catch((err) => { reject(err) })
    })
}

exports.LogGet = (Environnement, Server, PlanExecID) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var fs = require('fs-extra')
        var path = require('path')

        var DownloadFolder = path.join(Config.WorkSpaceFolder, `/Download/`)
        if (!fs.existsSync(DownloadFolder)) { fs.mkdirSync(DownloadFolder) }
        let LogFile = `[LOG][${PlanExecID}].log`
        var LogLocation = path.join('C:/Ethelp/Planhelp/Log/', LogFile)
        fs.copySync(LogLocation, path.join(DownloadFolder, LogFile))

        resolve({Path: `Download/${LogFile}`})
    })
}

exports.PlanActionLaunch = (Environnement, Flux, Interface, Sequenceur, Option) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')
        if (!Environnement) { Environnement = '' }
        if (!Flux) { Flux = '' }
        if (!Interface) { Interface = '' }
        if (!Option) { Option = '' }
        var PlanAction = {
            Environnement: Environnement,
            Server: '',
            Type: 1,
            Parametre: `${Flux}`,
            Statut: 1,
            Interface: Interface
        }

        if (Option === 'Interface')
        {
            PlanAction.Type = 3
            PlanAction.Parametre = `${Flux}|${Interface}|${Sequenceur}`
        }

        function getInterface()
        {
            var BddId = 'EtlTool'
            var BddEnvironnement = 'PRD'
            var Query = `
                SELECT       Server AS "Server" 
                FROM         Interface 
                WHERE        Interface.Nom = '${BddTool.ChaineFormater(Interface, BddEnvironnement, BddId)}' 
                AND          Interface.Sequenceur = '${BddTool.ChaineFormater(Sequenceur, BddEnvironnement, BddId)}' 
            `
            BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
                for (var record of recordset) {
                    PlanAction.Server = record.Server
                }
                addPlanAction()
            })
        }

        function getFlux()
        {
            var BddId = 'EtlTool'
            var BddEnvironnement = 'PRD'
            var Query = `
                SELECT       Server AS "Server" 
                FROM         Flux 
                WHERE        Flux.Nom = '${BddTool.ChaineFormater(Flux, BddEnvironnement, BddId)}'
            `
            BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
                for (var record of recordset) {
                    PlanAction.Server = record.Server
                }
                addPlanAction()
            })
        }

        function addPlanAction()
        {
            BddTool.RecordAddUpdate('EtlTool', 'PRD', 'PlanAction', PlanAction).then((data) => {
                resolve(PlanAction)
            }).catch((err) => { reject(err) })
        }

        if (Flux && Flux != '') {
            getFlux()
        } else {
            getInterface()
        }
    })
}

exports.PlanActionStop = (Environnement, Server, Flux, PlanExecID) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')
        if (!Environnement) { Environnement = '' }
        if (!Flux) { Flux = '' }
        if (!PlanExecID) { PlanExecID = '' }
        var PlanAction = {
            Environnement: Environnement,
            Server: Server,
            Type: 2,
            Parametre: PlanExecID,
            Statut: 1
        }

        function getFlux()
        {
            var BddId = 'EtlTool'
            var BddEnvironnement = 'PRD'
            var Query = `
                SELECT       Server AS "Server" 
                FROM         Flux 
                WHERE        Flux.Nom = '${BddTool.ChaineFormater(Flux, BddEnvironnement, BddId)}'
            `
            BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
                for (var record of recordset) {
                    PlanAction.Server = record.Server
                }
                addPlanAction()
            })
        }

        function addPlanAction()
        {
            BddTool.RecordAddUpdate('EtlTool', 'PRD', 'PlanAction', PlanAction).then((data) => {
                resolve(PlanAction)
            }).catch((err) => { reject(err) })
        }

        getFlux()
    })
}

exports.PlanificationList = (Server, filtreFlux) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get Ordonnanceur list
        var PlanificationList = []
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var Query = `
            SELECT       PlanTache.PlanTacheID AS "PlanTacheID", 
                         PlanTache.Server AS "Server", 
                         PlanTache.Environnement AS "Environnement", 
                         PlanTache.Flux AS "Flux", 
                         PlanTache.Nom AS "PlanTacheNom", 
                         Interface.InterfaceID AS "InterfaceID", 
                         Interface.Projet AS "Projet", 
                         Interface.Sequenceur AS "Sequenceur", 
                         Interface.Nom AS "Interface", 
                         PlanTache.Statut AS "Statut", 
                         Interface.OrdreNum AS "OrdreNum", 
                         PlanTache.ModificationDate AS "ModificationDate" 
            FROM         PlanTache 
            LEFT JOIN    Flux ON Flux.Nom = Flux 
            LEFT JOIN    Interface ON Interface.FluxID = Flux.FluxID 
        `
        Where = ``
        if (filtreFlux && filtreFlux !== '') { if (Where !== '') { Where += 'AND '} Where += `PlanTache.Flux LIKE '%${BddTool.ChaineFormater(filtreFlux, BddEnvironnement, BddId)}%' ` }
        if (Server && Server !== '') { if (Where !== '') { Where += 'AND '} Where += `PlanTache.Server = '${BddTool.ChaineFormater(Server, BddEnvironnement, BddId)}' ` }
        if (Where !== '') { Query += 'WHERE ' + Where }
        Query += `
            ORDER BY     PlanTache.PlanTacheID, PlanTache.Nom, PlanTache.Server, PlanTache.Flux, Interface.OrdreNum 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => {
            let actualPlanTache = null
            let actualInterface = null
            for (var record of recordset) {
                if (!actualPlanTache || actualPlanTache.PlanTacheID !== record.PlanTacheID) {
                    actualPlanTache = {
                        PlanTacheID: record.PlanTacheID,
                        Server: record.Server,
                        Environnement: record.Environnement,
                        Flux: record.Flux,
                        Nom: record.PlanTacheNom,
                        Statut: record.Statut,
                        ModificationDate: record.ModificationDate,
                        InterfaceList: []
                    }
                    actualInterface = null
                    PlanificationList.push(actualPlanTache)
                }
                actualPlanTache.InterfaceList.push({
                    InterfaceID: record.InterfaceID,
                    Projet: record.Projet,
                    Sequenceur: record.Sequenceur,
                    Nom: record.Interface,
                    OrdreNum: record.OrdreNum
                })
            }
            resolve(PlanificationList)
        })
    })
}

exports.PlanJobParamImport = (Environnement, FileName) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')
        var path = require('path')
        var fs = require('fs-extra')
        var parse = require('csv-parse')
        var MdlInterface = require(process.cwd() + '/controllers/Interface/MdlInterface')

        var FileFolder = path.join(Config.WorkSpaceFolder, "/Upload/Temp/")
        var FileLocation = path.join(FileFolder, FileName)
        var csvDataList = []
        var ResultList = []

        fs.createReadStream(FileLocation)
        .pipe(parse({delimiter: ';'}))
        .on('data', function(csvrow) {
            if (csvrow[0] !== 'Regroupement') {
                csvDataList.push(csvrow)
            }
        })
        .on('end',function() {
            for (let csvData of csvDataList) {
                ResultList.push({ csvData: csvData, status: -1, data: null })
            }

            /*
            ResultList.forEach((Result) => {
                MdlInterface.VariableGlobaleAddUpdate(Environnement, {
                    Regroupement: Result.csvData[0],
                    Nom: Result.csvData[1],
                    Valeur: Result.csvData[2]
                }).then((data) => {
                    Result.status = 1
                    Result.data = data
                }).catch((err) => {
                    Result.status = 0
                    Result.err = err
                }).then(() => { ResultUpdate() })
            })
            */
            
        })
        
        var ResultUpdate = () => {
            let NotFinishNbr = ResultList.filter(a => a.status === -1).length
            if (NotFinishNbr > 0) { return }
            resolve()
        }
    })
}

exports.PlanJobParamList = (Environnement) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get Ordonnanceur variable list
        var PlanJobParamList = []
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var Query = `
            SELECT       PlanJobParam.PlanJobParamID AS "PlanJobParamID", 
                         PlanJobParam.Environnement AS "Environnement", 
                         PlanJobParam.Regroupement AS "Regroupement", 
                         PlanJobParam.Nom AS "Nom", 
                         PlanJobParam.Valeur AS "Valeur", 
                         PlanJobParam.Description AS "Description", 
                         PlanJobParam.Masque AS "Masque", 
                         PlanJobParam.CreationDate AS "CreationDate", 
                         PlanJobParam.ModificationDate AS "ModificationDate", 
                         PlanJobParam.Responsable AS "Responsable" 
            FROM         PlanJobParam 
            WHERE        1=1 `
        if (Environnement && Environnement !== '') {
            Query += `AND         PlanJobParam.Environnement = '${BddTool.ChaineFormater(Environnement, BddEnvironnement, BddId)}' `
        }
        Query += `
            ORDER BY     PlanJobParam.Regroupement, PlanJobParam.Nom 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                PlanJobParamList.push({ 
                    PlanJobParamID: record.PlanJobParamID, 
                    Environnement: record.Environnement, 
                    Regroupement: record.Regroupement, 
                    Nom: record.Nom, 
                    Valeur: record.Valeur, 
                    Description: record.Description, 
                    Masque: record.Masque, 
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                })
            }
            resolve(PlanJobParamList)
        })
    })
}

exports.PlanParamList = () => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get Ordonnanceur list
        var PlanParamEnCour = null
        var PlanParamList = []
        var BddId = 'EtlTool'
        var Environnement = 'PRD'
        var Query = `
            SELECT       PlanParam.PlanParamID AS "PlanParamID",
                         PlanParam.Titre AS "Titre", 
                         PlanParam.Frequence AS "Frequence", 
                         PlanParam.Description AS "Description", 
                         PlanParam.Statut AS "Statut", 
                         PlanParam.CreationDate AS "CreationDate", 
                         PlanParam.ModificationDate AS "ModificationDate", 
                         PlanParam.Responsable AS "Responsable", 
                         PlanParam.LogRepertoire as "LogRepertoire",
                         PlanParamServer.PlanParamServerID AS "PlanParamServerID", 
                         PlanParamServer.Environnement AS "PlanParamServerEnvironnement", 
                         PlanParamServer.Server AS "PlanParamServerServer", 
                         PlanParamServer.MapLabel AS "PlanParamServerMapLabel", 
                         PlanParamServer.MapLetter AS "PlanParamServerMapLetter", 
                         PlanParamServer.Statut AS "PlanParamServerStatut"
            FROM         PlanParam 
            LEFT JOIN    PlanParamServer ON PlanParamServer.PlanParamID = PlanParam.PlanParamID 
            ORDER BY     PlanParam.PlanParamID, PlanParamServer.Server 
        `
        BddTool.QueryExecBdd(BddId, Environnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                if (!PlanParamEnCour || PlanParamEnCour.PlanParamID !== record.PlanParamID) {
                    PlanParamEnCour = { 
                        PlanParamID: record.PlanParamID, 
                        Titre: record.Titre, 
                        Frequence: record.Frequence, 
                        Description: record.Description, 
                        Statut: record.Statut, 
                        CreationDate: record.CreationDate, 
                        ModificationDate: record.ModificationDate, 
                        Responsable: record.Responsable,
                        PlanParamServerList: []
                    }
                    PlanParamList.push(PlanParamEnCour)
                }
                if (record.PlanParamServerServer && record.PlanParamServerServer !== '') {
                    PlanParamEnCour.PlanParamServerList.push({ 
                        PlanParamServerID: record.PlanParamServerID, 
                        Environnement: record.PlanParamServerEnvironnement, 
                        Server: record.PlanParamServerServer, 
                        MapLabel: record.PlanParamServerMapLabel, 
                        MapLetter: record.PlanParamServerMapLetter, 
                        Statut: record.PlanParamServerStatut
                    })
                }
            }
            resolve(PlanParamList)
        })
    })
}

exports.PlanParamServerList = (PlanParamID, Environnement) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        var PlanParamServerList = []
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var Query = `
            SELECT       PlanParamServer.PlanParamServerID AS "PlanParamServerID", 
                         PlanParamServer.PlanParamID AS "PlanParamID", 
                         PlanParamServer.Environnement AS "Environnement", 
                         PlanParamServer.Server AS "Server", 
                         PlanParamServer.MapLabel AS "MapLabel", 
                         PlanParamServer.MapLetter AS "MapLetter", 
                         PlanParamServer.Statut AS "Statut", 
                         PlanParamServer.CreationDate AS "CreationDate", 
                         PlanParamServer.ModificationDate AS "ModificationDate", 
                         PlanParamServer.Responsable AS "Responsable" 
            FROM         PlanParamServer 
            WHERE        1=1 `
        if (PlanParamID && PlanParamID !== '') {
            Query += `AND         PlanParamServer.PlanParamID = ${BddTool.NumericFormater(PlanParamID, BddEnvironnement, BddId)} ` + '\n'
        }
        if (Environnement && Environnement !== '') {
            Query += `AND         PlanParamServer.Environnement = '${BddTool.ChaineFormater(Environnement, BddEnvironnement, BddId)}' ` + '\n'
        }
        Query += `
            ORDER BY     PlanParamServer.Server 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                PlanParamServerList.push({ 
                    PlanParamServerID: record.PlanParamServerID, 
                    PlanParamID: record.PlanParamID, 
                    Environnement: record.Environnement, 
                    Server: record.Server, 
                    MapLabel: record.MapLabel, 
                    MapLetter: record.MapLetter, 
                    Statut: record.Statut, 
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                })
            }
            resolve(PlanParamServerList)
        })
    })
}

exports.PlanTacheList = (Environnement, Flux) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get Ordonnanceur list
        var PlanTacheList = []
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var Query = `
            SELECT       PlanTache.PlanTacheID AS "PlanTacheID", 
                         PlanTache.Environnement AS "Environnement", 
                         PlanTache.Flux AS "Flux", 
                         PlanTache.Nom AS "Nom", 
                         PlanTache.Statut AS "Statut", 
                         PlanTache.CreationDate AS "CreationDate", 
                         PlanTache.ModificationDate AS "ModificationDate", 
                         PlanTache.Responsable AS "Responsable" 
            FROM         PlanTache 
        `
        var Where = ``
        if (Environnement !== '') { if (Where !== '') { Where += 'AND '} Where += `Environnement = '${BddTool.ChaineFormater(Environnement, BddEnvironnement, BddId)}' ` }
        if (Flux !== '') { if (Where !== '') { Where += 'AND '} Where += `Flux = '${BddTool.ChaineFormater(Flux, BddEnvironnement, BddId)}' ` }
        if (Where !== '') { Query += 'WHERE ' + Where }
        Query += `
            ORDER BY     PlanTache.Nom 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                PlanTacheList.push({ 
                    PlanTacheID: record.PlanTacheID, 
                    Environnement: record.Environnement, 
                    Flux: record.Flux, 
                    Nom: record.Nom, 
                    Statut: record.Statut, 
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                })
            }
            resolve(PlanTacheList)
        })
    })
}

exports.Statistique = (FiltreDateMin, FiltreDateMax) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        var PeriodeHashtableList = {}
        var PeriodeList = []
        for (var PeriodeNum = 0; PeriodeNum < 24; PeriodeNum++) {
            var Periode = {}
            Periode.Debut = PeriodeNum + ':00'
            Periode.Fin = PeriodeNum + ':59'
            Periode.ExecNbr = '0'
            Periode.StatutExecNbr = {}
            PeriodeList.push(Periode)
            PeriodeHashtableList[Periode.Debut] = Periode
        }

        var BddId = 'EtlTool'
        var Environnement = 'PRD'
        var Query = `
            SELECT       ${BddTool.DatePartHour('DateDebut', Environnement, BddId)} AS "DebutHeure", 
                         COUNT(*) AS "ExecNbr", 
                         Statut AS "Statut" 
            FROM         PlanExec `
        var Where = ''
        if (FiltreDateMin !== '') { if (Where !== '') { Where += 'AND      ' } Where += `DateDebut >= ${BddTool.DateFormater(FiltreDateMin, Environnement, BddId)} ` }
        if (FiltreDateMax !== '') { if (Where !== '') { Where += 'AND      ' } Where += `DateDebut <= ${BddTool.DateFormater(FiltreDateMax, Environnement, BddId)} ` }
        if (Where !== '') { Query += 'Where ' + Where }
        Query += `
            GROUP BY     ${BddTool.DatePartHour('DateDebut', Environnement, BddId)}, Statut 
            ORDER BY     ${BddTool.DatePartHour('DateDebut', Environnement, BddId)} 
        `
        var TalendLog = null
        var root_pid_EnCour = ''
        BddTool.QueryExecBdd(BddId, Environnement, Query, reject, (recordset) => {
            for (var record of recordset) {
                var Debut = record.DebutHeure + ":00"
                var Periode = PeriodeHashtableList[Debut]
                if (Periode == null) { continue }
                var ExecNbr = Periode.ExecNbr
                ExecNbr += parseInt(record.ExecNbr)
                Periode.ExecNbr = ExecNbr
                var StatutExecNbr = Periode.StatutExecNbr
                StatutExecNbr[record.Statut] = record.ExecNbr
            }
            resolve(PeriodeList)
        })
    })
}

exports.VariableOrdonnanceurList = (Environnement) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get Ordonnanceur list
        var VariableOrdonnanceurList = []
        var BddId = 'EtlTool'
        var Environnement = 'PRD'
        var Query = `
            SELECT      VariableOrdonnanceur.VariableOrdonnanceurID AS "VariableOrdonnanceurID", 
                        VariableOrdonnanceur.Regroupement AS "Regroupement", 
                        VariableOrdonnanceur.Nom AS "Nom", 
                        VariableOrdonnanceur.Valeur AS "Valeur", 
                        VariableOrdonnanceur.CreationDate AS "CreationDate", 
                        VariableOrdonnanceur.ModificationDate AS "ModificationDate", 
                        VariableOrdonnanceur.Responsable AS "Responsable" 
            FROM        VariableOrdonnanceur 
            ORDER BY    VariableOrdonnanceur.Nom ASC 
        `
        BddTool.QueryExecBdd(BddId, Environnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                VariableOrdonnanceurList.push({ 
                    VariableOrdonnanceurID: record.VariableOrdonnanceurID, 
                    Regroupement: record.Regroupement, 
                    Nom: record.Nom, 
                    Valeur: record.Valeur, 
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                })
            }
            resolve(VariableOrdonnanceurList)
        })
    })
}
