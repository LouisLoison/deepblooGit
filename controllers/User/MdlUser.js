exports.EquipeList = () => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get ticket list
        var EquipeList = []
        var BddId = 'EtlTool'
        var Environnement = 'PRD'
        BddTool.QueryExecBdd(BddId, Environnement, `
            SELECT    EquipeReferenteID AS "EquipeReferenteID", 
                      Code AS "Code", 
                      Nom AS "Nom", 
                      CreationDate AS "CreationDate", 
                      ModificationDate AS "ModificationDate", 
                      Responsable AS "Responsable" 
            FROM      EquipeReferente 
            ORDER BY  Nom ASC 
        `, reject, (recordset) => { 
            for (var record of recordset) {
                EquipeList.push({ 
                    EquipeReferenteID: record.EquipeReferenteID,
                    Code: record.Code,
                    Nom: record.Nom,
                    CreationDate: record.CreationDate,
                    ModificationDate: record.ModificationDate,
                    Responsable: record.Responsable
                })
            }
            resolve(EquipeList)
        })
    })
}

exports.Login = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const jwt = require('jsonwebtoken')
      const BddTool = require(process.cwd() + '/global/BddTool')

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let Query = `
        SELECT    userId AS "userId", 
                  hivebriteId AS "hivebriteId", 
                  type AS "type", 
                  email AS "email", 
                  username AS "username", 
                  password AS "password" 
        FROM      user 
        WHERE     username = '${BddTool.ChaineFormater(username, BddEnvironnement, BddId)}' 
        AND       password = '${BddTool.ChaineFormater(password, BddEnvironnement, BddId)}' 
      `
      let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, Query)
      let user = {}
      for (let record of recordset) {
        user = { 
          userId: record.userId,
          hivebriteId: record.hivebriteId,
          type: record.type,
          email: record.email,
          username: record.username
        }
      }

      if (!user.userId) {
        throw new Error('User unknown !')
      }

      // Creat user token
      let certText = 'certTest'
      let token = jwt.sign({ userId: user.userId, hivebriteId: user.hivebriteId, type: user.type, email: user.email, username: user.username }, certText, { algorithm: 'HS256'})
      
      resolve({
        Utilisateur: user,
        Token: token
      })
    } catch (err) { reject(err) }
  })
}

exports.List = () => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get ticket list
        var UtilisateurList = []
        var BddId = 'EtlTool'
        var Environnement = 'PRD'
        BddTool.QueryExecBdd(BddId, Environnement, `
            SELECT    UtilisateurID AS "UtilisateurID", 
                      Identifiant AS "Identifiant", 
                      Pseudo AS "Pseudo", 
                      Email AS "Email", 
                      DroitGroupeID AS "DroitGroupeID", 
                      EquipeReferenteID AS "EquipeReferenteID", 
                      Statut AS "Statut", 
                      CreationDate AS "CreationDate", 
                      ModificationDate AS "ModificationDate", 
                      Responsable AS "Responsable" 
            FROM      Utilisateur 
            ORDER BY  Identifiant ASC 
        `, reject, (recordset) => { 
            for (var record of recordset) {
                UtilisateurList.push({
                    UtilisateurID: record.UtilisateurID,
                    Identifiant: record.Identifiant,
                    Pseudo: record.Pseudo,
                    Email: record.Email,
                    DroitGroupeID: record.DroitGroupeID,
                    EquipeReferenteID: record.EquipeReferenteID,
                    Statut: record.Statut,
                    CreationDate: record.CreationDate,
                    ModificationDate: record.ModificationDate,
                    Responsable: record.Responsable
                })
            }
            resolve(UtilisateurList);
        })
    })
}

exports.Utilisateur = (UtilisateurID) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get Flux list
        var Utilisateur = {}
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var Query = `
            SELECT      Utilisateur.UtilisateurID AS "UtilisateurID", 
                        Utilisateur.Identifiant AS "Identifiant", 
                        Utilisateur.MotDePasse AS "MotDePasse", 
                        Utilisateur.Pseudo AS "Pseudo", 
                        Utilisateur.Email AS "Email", 
                        Utilisateur.DroitGroupeID AS "DroitGroupeID", 
                        Utilisateur.EquipeReferenteID AS "EquipeReferenteID", 
                        EquipeReferente.Nom AS "EquipeReferenteNom",
                        Utilisateur.Statut AS "Statut", 
                        Utilisateur.CreationDate AS "CreationDate", 
                        Utilisateur.ModificationDate AS "ModificationDate", 
                        Utilisateur.Responsable AS "Responsable" 
            FROM        Utilisateur
            LEFT JOIN   EquipeReferente ON EquipeReferente.EquipeReferenteID = Utilisateur.EquipeReferenteID  
            WHERE       Utilisateur.UtilisateurID = ${BddTool.NumericFormater(UtilisateurID, BddEnvironnement, BddId)} 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                Utilisateur = { 
                    UtilisateurID: record.UtilisateurID, 
                    Identifiant: record.Identifiant, 
                    MotDePasse: record.MotDePasse, 
                    Pseudo: record.Pseudo, 
                    Email: record.Email, 
                    DroitGroupeID: record.DroitGroupeID, 
                    EquipeReferenteID: record.EquipeReferenteID, 
                    EquipeReferenteNom: record.EquipeReferenteNom, 
                    Statut: record.Statut, 
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                }
            }
            resolve(Utilisateur)
        })
    })
}

exports.UtilisateurAddUpdate = (Utilisateur, ProjetList) => {
    return new Promise((resolve, reject) => {
        let UserData = {Utilisateur: Utilisateur, ProjetList: ProjetList}
        UserRecordAddUpdate(UserData)
        .then(UserProjetListDelete)
        .then(UserProjetListAdd)
        .then((data) => {
            resolve(data)
        }).catch((err) => {
            reject(err)
        })
    })
}

var UserRecordAddUpdate = (UserData) => {
    return new Promise((resolve, reject) => {
        var BddTool = require(process.cwd() + '/global/BddTool')
        BddTool.RecordAddUpdate('EtlTool', 'PRD', 'Utilisateur', UserData.Utilisateur).then((data) => {
            UserData.Utilisateur = data
            resolve(UserData)
        }).catch((err) => { reject(err) })
    })
}

var UserProjetListDelete = (UserData) => {
    return new Promise((resolve, reject) => {
        var BddTool = require(process.cwd() + '/global/BddTool')
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        BddTool.QueryExecBdd(BddId, BddEnvironnement, `
            DELETE FROM UtilisateurProjet 
            WHERE       UtilisateurID = ${BddTool.NumericFormater(UserData.Utilisateur.UtilisateurID, BddEnvironnement, BddId)} 
        `, reject, (recordset) => { 
            resolve(UserData)
        })
    })
}

var UserProjetListAdd = (UserData) => {
    return new Promise((resolve, reject) => {

        if (!UserData.ProjetList || UserData.ProjetList.length === 0) {
            resolve(UserData)
            return
        }
        
        var ResultList = []
        for (var Projet of UserData.ProjetList) {
            ResultList.push({ Projet: Projet, status: -1 })
        }
        
        ResultList.forEach((Result) => {
            var BddTool = require(process.cwd() + '/global/BddTool')
            var BddId = 'EtlTool'
            var BddEnvironnement = 'PRD'
            BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'UtilisateurProjet', {
                UtilisateurID: UserData.Utilisateur.UtilisateurID,
                Projet: Result.Projet
            }).then((data) => {
                Result.data = data
                Result.status = 1
            }).catch((err) => {
                Result.status = 0
                Result.err = err
            }).then(() => { ResultUpdate() })
        })

        var ResultUpdate = () => {
            var NotFinishNbr = ResultList.filter(a => a.status === -1).length
            if (NotFinishNbr > 0) { return }
            resolve(UserData)
        }
    })
}

exports.UtilisateurProjetList = (UtilisateurID) => {
    return new Promise((resolve, reject) => {
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get utilisateur projet list
        var UtilisateurProjetList = []
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var Query = `
            SELECT      UtilisateurProjet.UtilisateurProjetID AS "UtilisateurProjetID", 
                        UtilisateurProjet.UtilisateurID AS "UtilisateurID", 
                        UtilisateurProjet.Projet AS "Projet", 
                        UtilisateurProjet.CreationDate AS "CreationDate", 
                        UtilisateurProjet.ModificationDate AS "ModificationDate", 
                        UtilisateurProjet.Responsable AS "Responsable" 
            FROM        UtilisateurProjet
            WHERE       UtilisateurProjet.UtilisateurID = ${BddTool.NumericFormater(UtilisateurID, BddEnvironnement, BddId)} 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
            for (var record of recordset) {
                UtilisateurProjetList.push({ 
                    UtilisateurProjetID: record.UtilisateurProjetID,
                    UtilisateurID: record.UtilisateurID,
                    Projet: record.Projet,
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                })
            }
            resolve(UtilisateurProjetList)
        })
    })
}

exports.UtilisateurProjetNomListSync = async (UtilisateurID) => {
    let ProjetList = null
    try {
        ProjetList = await this.UtilisateurProjetList(UtilisateurID)
        ProjetList = ProjetList.map(a => a.Projet)
    } catch (err) { }
    return ProjetList
}
