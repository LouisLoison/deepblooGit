exports.ServerAddUpdate = (Server) => {
    return new Promise(async (resolve, reject) => {
        const BddTool = require(process.cwd() + '/global/BddTool')
        const BddId = 'EtlTool'
        const BddEnvironnement = 'PRD'
        Server.Nom = Server.Nom.trim()
        let ServerNomOld = null

        // Si le server change de nom
        if (Server.ServerID && Server.ServerID !== 0 && Server.Nom !== '') {
            try {
                // Recherche de l'ancien nom
                let recordset = await BddTool.QueryExecBdd2(`
                    SELECT     Server.Nom AS "Nom"
                    FROM       Server 
                    WHERE      Server.ServerID = ${BddTool.NumericFormater(Server.ServerID, BddEnvironnement, BddId)} 
                `)
                ServerNomOld = null
                for (let record of recordset) {
                    ServerNomOld = record.Nom
                }

                // Renomage du server sur l'ensemble de la BDD
                if (ServerNomOld !== '' && ServerNomOld !== Server.Nom) {
                    try {
                        await BddTool.QueryExecBdd2(`
                            UPDATE     Flux
                            SET        Server = '${BddTool.ChaineFormater(Server.Nom, BddEnvironnement, BddId)}' 
                            WHERE      Server = '${BddTool.ChaineFormater(ServerNomOld, BddEnvironnement, BddId)}' 
                        `)
                    } catch (err) { }

                    try {
                        await BddTool.QueryExecBdd2(`
                            UPDATE     Interface
                            SET        Server = '${BddTool.ChaineFormater(Server.Nom, BddEnvironnement, BddId)}' 
                            WHERE      Server = '${BddTool.ChaineFormater(ServerNomOld, BddEnvironnement, BddId)}' 
                        `)
                    } catch (err) { }

                    try {
                        await BddTool.QueryExecBdd2(`
                            UPDATE     DeployItem
                            SET        Server = '${BddTool.ChaineFormater(Server.Nom, BddEnvironnement, BddId)}' 
                            WHERE      Server = '${BddTool.ChaineFormater(ServerNomOld, BddEnvironnement, BddId)}' 
                        `)
                    } catch (err) { }

                    try {
                        await BddTool.QueryExecBdd2(`
                            UPDATE     PlanExec
                            SET        Server = '${BddTool.ChaineFormater(Server.Nom, BddEnvironnement, BddId)}' 
                            WHERE      Server = '${BddTool.ChaineFormater(ServerNomOld, BddEnvironnement, BddId)}' 
                        `)
                    } catch (err) { }

                    try {
                        await BddTool.QueryExecBdd2(`
                            UPDATE     PlanTache
                            SET        Server = '${BddTool.ChaineFormater(Server.Nom, BddEnvironnement, BddId)}' 
                            WHERE      Server = '${BddTool.ChaineFormater(ServerNomOld, BddEnvironnement, BddId)}' 
                        `)
                    } catch (err) { }
                }
            } catch (err) { }
        }

        // Mise à jour des info du server
        let data = await BddTool.RecordAddUpdate('Server', Server)
        resolve(data)
    })
}

exports.ServerGet = (Nom) => {
    return new Promise((resolve, reject) => {
        const BddTool = require(process.cwd() + '/global/BddTool')
        const BddId = 'EtlTool'
        const BddEnvironnement = 'PRD'
        let Query = `
            SELECT      ServerID AS "ServerID", 
                        Nom AS "Nom", 
                        AgentStatutDEV AS "AgentStatutDEV", 
                        AgentLocationDEV AS "AgentLocationDEV", 
                        EmplacementDEV AS "EmplacementDEV", 
                        AgentStatutINT AS "AgentStatutINT", 
                        AgentLocationINT AS "AgentLocationINT", 
                        EmplacementINT AS "EmplacementINT", 
                        AgentStatutRCT AS "AgentStatutRCT", 
                        AgentLocationRCT AS "AgentLocationRCT", 
                        EmplacementRCT AS "EmplacementRCT", 
                        AgentStatutPPR AS "AgentStatutPPR", 
                        AgentLocationPPR AS "AgentLocationPPR", 
                        EmplacementPPR AS "EmplacementPPR", 
                        AgentStatutPRD AS "AgentStatutPRD", 
                        AgentLocationPRD AS "AgentLocationPRD", 
                        EmplacementPRD AS "EmplacementPRD", 
                        Statut AS "Statut", 
                        CreationDate AS "CreationDate", 
                        ModificationDate AS "ModificationDate", 
                        Responsable AS "Responsable" 
            FROM        Server 
        `
        if (Nom && Nom !== '') {
            Query += `WHERE Nom = '${BddTool.ChaineFormater(Nom, BddEnvironnement, BddId)}' \n`
        }

        BddTool.QueryExecBdd(Query, reject, (recordset) => {
            let ServerFind = null
            for (var record of recordset) {
                ServerFind = {
                    ServerID: record.ServerID,
                    Nom: record.Nom,
                    AgentStatutDEV: record.AgentStatutDEV,
                    AgentLocationDEV: record.AgentLocationDEV,
                    EmplacementDEV: record.EmplacementDEV,
                    AgentStatutINT: record.AgentStatutINT,
                    AgentLocationINT: record.AgentLocationINT,
                    EmplacementINT: record.EmplacementINT,
                    AgentStatutRCT: record.AgentStatutRCT,
                    AgentLocationRCT: record.AgentLocationRCT,
                    EmplacementRCT: record.EmplacementRCT,
                    AgentStatutPPR: record.AgentStatutPPR,
                    AgentLocationPPR: record.AgentLocationPPR,
                    EmplacementPPR: record.EmplacementPPR,
                    AgentStatutPRD: record.AgentStatutPRD,
                    AgentLocationPRD: record.AgentLocationPRD,
                    EmplacementPRD: record.EmplacementPRD,
                    Statut: record.Statut,
                    CreationDate: record.CreationDate,
                    ModificationDate: record.ModificationDate,
                    Responsable: record.Responsable
                }
                break
            }
            resolve(ServerFind)
        })
    })
}

exports.ServerList = (Nom) => {
    return new Promise((resolve, reject) => {
        const Config = require(process.cwd() + '/config')
        const BddTool = require(process.cwd() + '/global/BddTool')
        const ServerList = []
        const BddId = 'EtlTool'
        const BddEnvironnement = 'PRD'
        let Query = `
            SELECT      ServerID AS "ServerID", 
                        Nom AS "Nom", 
                        Statut AS "Statut"
            FROM        Server 
        `
        if (Nom && Nom !== '') {
            Query += `WHERE Nom = '${BddTool.ChaineFormater(Nom, BddEnvironnement, BddId)}' \n`
        }
        Query += `ORDER BY   Nom `

        BddTool.QueryExecBdd(Query, reject, (recordset) => { 
            for (var record of recordset) {
                ServerList.push({
                    ServerID: record.ServerID,
                    Nom: record.Nom,
                    Statut: record.Statut
                })
            }
            resolve(ServerList)
        })
    })
}
