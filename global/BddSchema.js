var Config = require(process.cwd() + '/config')

var Schema = {
    EtlTool: {
        CodeReviewRule: {
            CodeReviewRuleID: { type: "Int", key: true },
            JobType: { type: "String" },
            Code: { type: "String" },
            Titre: { type: "String" },
            Type: { type: "Int" },
            Xpath: { type: "Text" },
            Parametre: { type: "String" },
            Resultat: { type: "Int" },
            Url: { type: "String" },
            Description: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Deploiement: {
            DeploiementID: { type: "Int", key: true },
            Plateforme: { type: "String" },
            Environnement: { type: "String" },
            JobType: { type: "String" },
            Projet: { type: "String" },
            Interface: { type: "String" },
            Sequenceur: { type: "String" },
            Version: { type: "String" },
            OrigineType: { type: "String" },
            OrigineID: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        DeployItem: {
            DeployItemID: { type: "Int", key: true },
            LivraisonID: { type: "Int" },
            Type: { type: "String" },
            Titre: { type: "String" },
            OrigineType: { type: "String" },
            OrigineId: { type: "String" },
            Plateforme: { type: "String" },
            Server: { type: "String" },
            JobType: { type: "String" },
            Projet: { type: "String" },
            Interface: { type: "String" },
            Sequenceur: { type: "String" },
            DEVStatut: { type: "Int", description: '0 = A faire | 20 = Livré | 30 = Livraison ko' },
            DEVDate: { type: "DateTime" },
            INTStatut: { type: "Int", description: '0 = A faire | 20 = Livré | 30 = Livraison ko' },
            INTDate: { type: "DateTime" },
            RCTStatut: { type: "Int", description: '0 = A faire | 20 = Livré | 30 = Livraison ko' },
            RCTDate: { type: "DateTime" },
            PPRStatut: { type: "Int", description: '0 = A faire | 20 = Livré | 30 = Livraison ko' },
            PPRDate: { type: "DateTime" },
            PRDStatut: { type: "Int", description: '0 = A faire | 20 = Livré | 30 = Livraison ko' },
            PRDDate: { type: "DateTime" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Document: {
            DocumentID: { type: "Int", key: true },
            Environnement: { type: "String" },
            Projet: { type: "String" },
            Sequenceur: { type: "String" },
            Type: { type: "String" },
            Lien: { type: "String" },
            FichierNom: { type: "String" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Evolution: {
            EvolutionID: { type: "Int", key: true },
            Environnement: { type: "String" },
            Projet: { type: "String" },
            Sequenceur: { type: "String" },
            JobNom: { type: "String" },
            ProjetCode: { type: "String" },
            Composant: { type: "String" },
            JobVersion: { type: "String" },
            TicketID: { type: "Int" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Environnement: {
            EnvironnementID: { type: "Int", key: true },
            Code: { type: "String" },
            Nom: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        EquipeReferente: {
            EquipeReferenteID: { type: "Int", key: true },
            Code: { type: "String" },
            Nom: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Flux: {
            FluxID: { type: "Int", key: true },
            Plateforme: { type: "String" },
            Server: { type: "String" },
            Nom: { type: "String" },
            Description: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        FluxComposant: {
            FluxComposantID: { type: "Int", key: true },
            FluxID: { type: "Int" },
            FluxComposantPereID: { type: "Int" },
            OrdreNum: { type: "Int" },
            Type: { type: "String" },
            Titre: { type: "String" },
            LienType: { type: "Int" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        FluxComposantParametre: {
            FluxComposantParametreID: { type: "Int", key: true },
            FluxComposantID: { type: "Int" },
            Nom: { type: "String" },
            Valeur: { type: "String" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Interface: {
            InterfaceID: { type: "Int", key: true },
            FluxID: { type: "Int" },
            Plateforme: { type: "String" },
            Server: { type: "String" },
            Projet: { type: "String" },
            Nom: { type: "String" },
            Sequenceur: { type: "String" },
            Type: { type: "String" },
            OrdreNum: { type: "Int" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Job: {
            JobID: { type: "Int", key: true },
            FluxID: { type: "Int" },
            Projet: { type: "String" },
            Sequenceur: { type: "String" },
            ProjetMetierID: { type: "Int" },
            EquipeReferenteID: { type: "Int" },
            Description: { type: "String" },
            JobLockDEVStatut: { type: "Int" },
            JobLockDEVDate: { type: "DateTime" },
            JobLockDEVVersionOrigine: { type: "String" },
            JobLockDEVVersionDestination: { type: "String" },
            JobLockDEVResponsable: { type: "String" },
            JobLockDEVProjetCode: { type: "String" },
            JobLockDEVTicketID: { type: "Int" },
            JobLockMCOStatut: { type: "Int" },
            JobLockMCODate: { type: "DateTime" },
            JobLockMCOVersionOrigine: { type: "String" },
            JobLockMCOVersionDestination: { type: "String" },
            JobLockMCOResponsable: { type: "String" },
            JobLockMCOProjetCode: { type: "String" },
            JobLockMCOTicketID: { type: "Int" },
            TagListe: { type: "String" },
            Type: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        JobProjet: {
            JobProjetID: { type: "Int", key: true },
            Projet: { type: "String" },
            FichierNom: { type: "String" },
            Version: { type: "Int" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        JobTest: {
            JobTestID: { type: "Int", key: true },
            Projet: { type: "String" },
            Sequenceur: { type: "String" },
            ATraiterNbr: { type: "Int" },
            TesteNbr: { type: "Int" },
            IgnoreNbr: { type: "Int" },
            ObsoleteNbr: { type: "Int" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Livraison: {
            LivraisonID: { type: "Int", key: true },
            Titre: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Utilisateur: {
            UtilisateurID: { type: "Int", key: true },
            Identifiant: { type: "String" },
            MotDePasse: { type: "String" },
            Pseudo: { type: "String" },
            Email: { type: "String" },
            DroitGroupeID: { type: "Int", description: '1 = Administrateur | 2 = Développeur | 3 = Visiteur'  },
            EquipeReferenteID: { type: "Int" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        UtilisateurProjet: {
            UtilisateurProjetID: { type: "Int", key: true },
            UtilisateurID: { type: "Int" },
            Projet: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        PlanAction: {
            PlanActionID: { type: "Int", key: true },
            Environnement: { type: "String" },
            Server: { type: "String" },
            Type: { type: "Int", description: '1 = Flux start | 2 = Exec stop | 3 = Interface start' },
            Parametre: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        PlanExec: {
            PlanExecID: { type: "Int", key: true },
            PlanActionID: { type: "Int" },
            Environnement: { type: "String" },
            Server: { type: "String" },
            Flux: { type: "String" },
            Interface: { type: "String" },
            Sequenceur: { type: "String" },
            PID: { type: "String" },
            PID2: { type: "String" },
            DateDebut: { type: "DateTime" },
            DateFin: { type: "DateTime" },
            Statut: { type: "Int", description: '2 = Ok | 1 = En cours | -1 = Erreur | -2 = Purge' },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        PlanJobParam: {
            PlanJobParamID: { type: "Int", key: true },
            Environnement: { type: "String" },
            Regroupement: { type: "String" },
            Nom: { type: "String" },
            Valeur: { type: "String" },
            Description: { type: "String" },
            Masque: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        PlanParam: {
            PlanParamID: { type: "Int", key: true },
            Titre: { type: "String" },
            LogRepertoire: { type: "String" },
            FichierBatRepertoire: { type: "String" },
            JavaRepertoire: { type: "String" },
            ProcessUser: { type: "String" },
            ProcessPassword: { type: "String" },
            Frequence: { type: "Int" },
            Description: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        PlanParamServer: {
            PlanParamServerID: { type: "Int", key: true },
            PlanParamID: { type: "Int" },
            Environnement: { type: "String" },
            Server: { type: "String" },
            MapLabel: { type: "String" },
            MapLetter: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        PlanTache: {
            PlanTacheID: { type: "Int", key: true },
            Environnement: { type: "String" },
            Server: { type: "String" },
            Flux: { type: "String" },
            Nom: { type: "String" },
            Statut: { type: "Int" },
            Mois1: { type: "Int" },
            Mois2: { type: "Int" },
            Mois3: { type: "Int" },
            Mois4: { type: "Int" },
            Mois5: { type: "Int" },
            Mois6: { type: "Int" },
            Mois7: { type: "Int" },
            Mois8: { type: "Int" },
            Mois9: { type: "Int" },
            Mois10: { type: "Int" },
            Mois11: { type: "Int" },
            Mois12: { type: "Int" },
            JourNum1: { type: "Int" },
            JourNum2: { type: "Int" },
            JourNum3: { type: "Int" },
            JourNum4: { type: "Int" },
            JourNum5: { type: "Int" },
            JourNum6: { type: "Int" },
            JourNum7: { type: "Int" },
            Jour1: { type: "Int" },
            Jour2: { type: "Int" },
            Jour3: { type: "Int" },
            Jour4: { type: "Int" },
            Jour5: { type: "Int" },
            Jour6: { type: "Int" },
            Jour7: { type: "Int" },
            Jour8: { type: "Int" },
            Jour9: { type: "Int" },
            Jour10: { type: "Int" },
            Jour11: { type: "Int" },
            Jour12: { type: "Int" },
            Jour13: { type: "Int" },
            Jour14: { type: "Int" },
            Jour15: { type: "Int" },
            Jour16: { type: "Int" },
            Jour17: { type: "Int" },
            Jour18: { type: "Int" },
            Jour19: { type: "Int" },
            Jour20: { type: "Int" },
            Jour21: { type: "Int" },
            Jour22: { type: "Int" },
            Jour23: { type: "Int" },
            Jour24: { type: "Int" },
            Jour25: { type: "Int" },
            Jour26: { type: "Int" },
            Jour27: { type: "Int" },
            Jour28: { type: "Int" },
            Jour29: { type: "Int" },
            Jour30: { type: "Int" },
            Jour31: { type: "Int" },
            JourDernier: { type: "Int" },
            FrequenceType: { type: "Int" },
            FrequenceVal: { type: "Int" },
            PlageDebut: { type: "Time" },
            PlageFin: { type: "Time" },
            AttenteMax: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Plateforme: {
            PlateformeID: { type: "Int", key: true },
            Code: { type: "String" },
            Nom: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        ProjetMetier: {
            ProjetMetierID: { type: "Int", key: true },
            Code: { type: "String" },
            Nom: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Server: {
            ServerID: { type: "Int", key: true },
            Nom: { type: "String" },
            AgentStatutDEV: { type: "Int" },
            AgentLocationDEV: { type: "String" },
            EmplacementDEV: { type: "String" },
            AgentStatutINT: { type: "Int" },
            AgentLocationINT: { type: "String" },
            EmplacementINT: { type: "String" },
            AgentStatutRCT: { type: "Int" },
            AgentLocationRCT: { type: "String" },
            EmplacementRCT: { type: "String" },
            AgentStatutPPR: { type: "Int" },
            AgentLocationPPR: { type: "String" },
            EmplacementPPR: { type: "String" },
            AgentStatutPRD: { type: "Int" },
            AgentLocationPRD: { type: "String" },
            EmplacementPRD: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        Ticket: {
            TicketID: { type: "Int", key: true },
            Environnement: { type: "String" },
            Priorite: { type: "Int" },
            Titre: { type: "String" },
            Description: { type: "String" },
            Statut: { type: "Int", description: '0 = Nouveau | 1 = En cours | 2 = Fermé' },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        TicketDocument: {
            TicketDocumentID: { type: "Int", key: true },
            TicketID: { type: "Int" },
            FichierNom: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        TicketJob: {
            TicketJobID: { type: "Int", key: true },
            TicketID: { type: "Int" },
            Environnement: { type: "String" },
            Projet: { type: "String" },
            Sequenceur: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        TicketNote: {
            TicketNoteID: { type: "Int", key: true },
            TicketID: { type: "Int" },
            Description: { type: "String" },
            Type: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        TicketHistory: {
            TicketHistoryID: { type: "Int", key: true },
            TicketID: { type: "Int" },
            StatutOld: { type: "Int" },
            StatutNew: { type: "Int" },
            Type: { type: "Int" },
            Parametre: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        TicketStatut: {
            TicketStatutID: { type: "Int", key: true },
            Nom: { type: "String" },
            Couleur: { type: "String" }
        },
        ToDo: {
            ToDoID: { type: "Int", key: true },
            OrdreNum: { type: "Int" },
            Nom: { type: "String" },
            Projet: { type: "String" },
            Sequenceur: { type: "String" },
            Description: { type: "String" },
            Statut: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        }
    },
    EtlToolVar: {
        Interface: {
            InterfaceID: { type: "Int", key: true },
            Type: { type: "String" },
            Projet: { type: "String" },
            Nom: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        InterfaceVariable: {
            InterfaceVariableID: { type: "Int", key: true },
            InterfaceID: { type: "Int" },
            Nom: { type: "String" },
            Valeur: { type: "String" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        },
        InterfaceVariableBackup: {
            InterfaceVariableBackupID: { type: "Int", key: true },
            InterfaceVariableID: { type: "Int" },
            InterfaceID: { type: "Int" },
            Nom: { type: "String" },
            Valeur: { type: "String" },
            Description: { type: "String" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" },
            BackupDate: { type: "DateTime" },
            BackupResponsable: { type: "String" }
        },
        VariableGlobale: {
            VariableGlobaleID: { type: "Int", key: true },
            Regroupement: { type: "String" },
            Nom: { type: "String" },
            Valeur: { type: "String" },
            Description: { type: "String" },
            Masque: { type: "Int" },
            CreationDate: { type: "DateTime" },
            ModificationDate: { type: "DateTime" },
            Responsable: { type: "String" }
        }
    },
    TalendLog: {
        TCH_TALEND_LOGS: {
            moment: { type: "DateTime" },
            pid: { type: "String" },
            root_pid: { type: "String" },
            father_pid: { type: "String" },
            project: { type: "String" },
            job: { type: "String" },
            context: { type: "String" },
            priority: { type: "Int" },
            type: { type: "String" },
            origin: { type: "String" },
            message: { type: "String" },
            code: { type: "Int" }
        },
        TCH_TALEND_MESURES: {
            moment: { type: "DateTime" },
            pid: { type: "String" },
            father_pid: { type: "String" },
            root_pid: { type: "String" },
            system_pid: { type: "BigInt" },
            project: { type: "String" },
            job: { type: "String" },
            job_repository_id: { type: "String" },
            job_version: { type: "String" },
            context: { type: "String" },
            origin: { type: "String" },
            label: { type: "String" },
            count: { type: "Int" },
            reference: { type: "Int" },
            thresholds: { type: "String" }
        },
        TCH_TALEND_STATS: {
            moment: { type: "DateTime" },
            pid: { type: "String" },
            father_pid: { type: "String" },
            root_pid: { type: "String" },
            system_pid: { type: "BigInt" },
            project: { type: "String" },
            job: { type: "String" },
            job_repository_id: { type: "String" },
            job_version: { type: "String" },
            context: { type: "String" },
            origin: { type: "String" },
            message_type: { type: "String" },
            message: { type: "String" },
            duration: { type: "BigInt" }
        }
    }
}

exports.getSchema = function() {
    return Schema
}

exports.getTableConfig = function(Bdd, Environnement, TableName) {
    return new Promise(async (resolve, reject) => {
        const BddTool = require(process.cwd() + '/global/BddTool')
        const TableConfig = { TableName: TableName }
        let Query = ''
        if (Config.bdd[Bdd][Environnement].config.type === 'MsSql') {
            Query = `Exec SP_Columns ${TableName}`
        } else if (Config.bdd[Bdd][Environnement].config.type === 'MySql') {
            Query = `SELECT * FROM information_schema.COLUMNS WHERE TABLE_NAME = '${TableName}' AND TABLE_SCHEMA = '${Config.bdd[Bdd][Environnement].config.database}' `
        } else if (Config.bdd[Bdd][Environnement].config.type === 'Oracle') {
            Query = `SELECT * FROM SYS.USER_TAB_COLUMNS WHERE TABLE_NAME= '${TableName.toUpperCase()}'`
        }
        BddTool.QueryExecBdd(Bdd, Environnement, Query, (err) => { reject(err) }, (recordset) => { 
            if (TableName === 'Job') {
                let toto = null
            }
            if (!recordset || recordset.length === 0) {
                TableConfig.Error = 'Table manquante'
            } else {
                TableConfig.ColumnList = []
                TableConfig.Column = []
                for(var Column of recordset) {
                    if (Config.bdd[Bdd][Environnement].config.type === 'MsSql') {
                        TableConfig.ColumnList.push(Column.COLUMN_NAME)
                        TableConfig.Column.push({ name: Column.COLUMN_NAME, type: Column.TYPE_NAME })
                    } else if (Config.bdd[Bdd][Environnement].config.type === 'MySql') {
                        TableConfig.ColumnList.push(Column.COLUMN_NAME)
                        TableConfig.Column.push({ name: Column.COLUMN_NAME, type: Column.DATA_TYPE })
                    } else if (Config.bdd[Bdd][Environnement].config.type === 'Oracle') {
                        TableConfig.ColumnList.push(Column.COLUMN_NAME)
                        TableConfig.Column.push({ name: Column.COLUMN_NAME, type: Column.DATA_TYPE })
                    }
                }
            }
            resolve(TableConfig)
        })
    })
}
