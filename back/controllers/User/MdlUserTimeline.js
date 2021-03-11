exports.Timeline = (Identifiant) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        var Result = []
        var TreatedList = {
            DeploiementFlg: false,
            SequenceurFlg: false,
            InterfaceFlg: false,
            DocumentFlg: false,
            TicketFlg: false,
            VariablesFlg: false
        }

        function checkTreated()
        {
            var TreatedFlg = true
            for(var Treated in TreatedList) {
                if (!TreatedList[Treated]) { TreatedFlg = false }
            }
            if (TreatedFlg) {
                Result.sort((a, b) => {
                    return a.ActionDate < b.ActionDate ? 1 : -1
                })
                resolve(Result)
            }
        }

        // region Recherche des actions de Déploiement
        function actionDeploiementList()
        {
            var BddId = 'EtlTool'
            var Environnement = 'PRD'
            BddTool.QueryExecBdd(BddId, Environnement, `
                SELECT     DeploiementID AS "DeploiementID", 
                           Plateforme AS "Plateforme", 
                           Environnement AS "Environnement", 
                           JobType AS "JobType", 
                           Projet AS "Projet", 
                           Interface AS "Interface", 
                           Sequenceur AS "Sequenceur", 
                           Version AS "Version", 
                           OrigineType AS "OrigineType", 
                           OrigineID AS "OrigineID", 
                           CreationDate AS "CreationDate", 
                           ModificationDate AS "ModificationDate", 
                           Responsable AS "Responsable" 
                FROM       Deploiement 
                WHERE      Responsable = '${BddTool.ChaineFormater(Identifiant, Environnement, BddId)}' 
            `, reject, (recordset) => { 
                for (var record of recordset) {
                    if (record.Environnement === 'ref_PRD') { continue }
                    var Type = 'Deploiement'
                    if (['ref_DEV', 'ref_MCO'].includes(record.Environnement)) {
                        Type = 'DeploiementRef'
                    }
                    Result.push({
                        Type: Type,
                        Plateforme: record.Plateforme,
                        Environnement: record.Environnement,
                        JobType: record.JobType,
                        Interface: record.Interface,
                        OrigineType: record.OrigineType,
                        OrigineID: record.OrigineID,
                        Version: record.Version,
                        Responsable: record.Responsable,
                        ActionDate: record.CreationDate
                    })
                }
                TreatedList.DeploiementFlg = true
                checkTreated()
            })
        }

        // region Recherche des informations du séquenceur
        function actionSequenceurList()
        {
            var BddId = 'EtlTool'
            var Environnement = 'PRD'
            BddTool.QueryExecBdd(BddId, Environnement, `
                SELECT     JobLockDEVStatut AS "JobLockDEVStatut", 
                           JobLockDEVDate AS "JobLockDEVDate", 
                           JobLockDEVVersionOrigine AS "JobLockDEVVersionOrigine", 
                           JobLockDEVVersionDestination AS "JobLockDEVVersionDestination", 
                           JobLockDEVResponsable AS "JobLockDEVResponsable", 
                           JobLockDEVProjetCode AS "JobLockDEVProjetCode", 
                           JobLockDEVTicketID AS "JobLockDEVTicketID", 
                           JobLockMCOStatut AS "JobLockMCOStatut", 
                           JobLockMCODate AS "JobLockMCODate", 
                           JobLockMCOVersionOrigine AS "JobLockMCOVersionOrigine", 
                           JobLockMCOVersionDestination AS "JobLockMCOVersionDestination", 
                           JobLockMCOResponsable AS "JobLockMCOResponsable", 
                           JobLockMCOProjetCode AS "JobLockMCOProjetCode", 
                           JobLockMCOTicketID AS "JobLockMCOTicketID" 
                FROM       Job 
                WHERE      JobLockDEVResponsable = '${BddTool.ChaineFormater(Identifiant, Environnement, BddId)}' 
                OR         JobLockMCOResponsable = '${BddTool.ChaineFormater(Identifiant, Environnement, BddId)}' 
            `, reject, (recordset) => { 
                for (var record of recordset) {
                    var JobLockDEVDate = record.JobLockDEVDate
                    if (JobLockDEVDate != '')
                    {
                        Result.push({
                            Type: 'JobLockDEV',
                            JobLockDEVProjetCode: record.JobLockDEVProjetCode,
                            JobLockDEVTicketID: record.JobLockDEVTicketID,
                            Version: record.JobLockDEVVersionOrigine,
                            Responsable: record.JobLockDEVResponsable,
                            ActionDate: record.JobLockDEVDate
                        })
                    }
                    var JobLockMCODate = record.JobLockMCODate
                    if (JobLockMCODate != '')
                    {
                        Result.push({
                            Type: 'JobLockMCO',
                            JobLockMCOProjetCode: record.JobLockMCOProjetCode,
                            JobLockMCOTicketID: record.JobLockMCOTicketID,
                            Version: record.JobLockMCOVersionOrigine,
                            Responsable: record.JobLockMCOResponsable,
                            ActionDate: record.JobLockMCODate
                        })
                    }
                }
                TreatedList.SequenceurFlg = true
                checkTreated()
            })
        }

        // region Recherche des informations d'interface
        function actionInterfaceList()
        {
            var BddId = 'EtlTool'
            var Environnement = 'PRD'
            BddTool.QueryExecBdd(BddId, Environnement, `
                SELECT     Interface.InterfaceID AS "InterfaceID", 
                           Interface.FluxID AS "FluxID", 
                           Flux.Nom AS "FluxNom", 
                           Interface.Plateforme AS "Plateforme", 
                           Interface.Server AS "Server", 
                           Interface.Projet AS "Projet", 
                           Interface.Nom AS "Nom", 
                           Interface.CreationDate AS "CreationDate", 
                           Interface.Responsable AS "Responsable" 
                FROM       Interface 
                LEFT JOIN  Flux ON Flux.FluxID = Interface.FluxID 
                WHERE      Interface.Responsable = '${BddTool.ChaineFormater(Identifiant, Environnement, BddId)}' 
            `, reject, (recordset) => { 
                for (var record of recordset) {
                    Result.push({
                        Type: 'Interface',
                        Flux: record.FluxNom,
                        InterfaceID: record.InterfaceID,
                        Projet: record.Projet,
                        Interface: record.Nom,
                        Plateforme: record.Plateforme,
                        Server: record.Server,
                        Responsable: record.Responsable,
                        ActionDate: record.CreationDate
                    })
                }
                TreatedList.InterfaceFlg = true
                checkTreated()
            })
        }

        // region Recherche des informations de Document
        function actionDocumentList()
        {
            var BddId = 'EtlTool'
            var Environnement = 'PRD'
            BddTool.QueryExecBdd(BddId, Environnement, `
                SELECT     DocumentID AS "DocumentID", 
                           Environnement AS "Environnement", 
                           Type AS "Type", 
                           Lien AS "Lien", 
                           FichierNom AS "FichierNom", 
                           CreationDate AS "CreationDate", 
                           Responsable AS "Responsable" 
                FROM       Document 
                WHERE      Responsable = '${BddTool.ChaineFormater(Identifiant, Environnement, BddId)}' 
            `, reject, (recordset) => { 
                for (var record of recordset) {
                    Result.push({
                        Type: 'Document',
                        DocumentID: record.DocumentID,
                        Environnement: record.Environnement,
                        DocumentType: record.Type,
                        Lien: record.Lien,
                        FichierNom: record.FichierNom,
                        Responsable: record.Responsable,
                        ActionDate: record.CreationDate
                    })
                }
                TreatedList.DocumentFlg = true
                checkTreated()
            })
        }

        // region Recherche des informations de ticket
        function actionTicketList()
        {
            var BddId = 'EtlTool'
            var Environnement = 'PRD'
            BddTool.QueryExecBdd(BddId, Environnement, `
                SELECT     TicketID AS "TicketID", 
                           Environnement AS "Environnement", 
                           CreationDate AS "CreationDate", 
                           Responsable AS "Responsable" 
                FROM       TicketJob 
                WHERE      Responsable = '${BddTool.ChaineFormater(Identifiant, Environnement, BddId)}' 
            `, reject, (recordset) => { 
                for (var record of recordset) {
                    Result.push({
                        Type: 'Ticket',
                        TicketID: record.TicketID,
                        Environnement: record.Environnement,
                        Responsable: record.Responsable,
                        ActionDate: record.CreationDate
                    })
                }
                TreatedList.TicketFlg = true
                checkTreated()
            })
        }

        // region Recherche des informations des variables
        function actionVariablesList()
        {
            TreatedList.VariablesFlg = true
            checkTreated()
        }
        actionDeploiementList()
        actionSequenceurList()
        actionInterfaceList()
        actionDocumentList()
        actionTicketList()
        actionVariablesList()

    });
}
