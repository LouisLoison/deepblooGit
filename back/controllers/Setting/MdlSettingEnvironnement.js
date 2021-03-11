 exports.EnvironnementList = (FiltreEnvActif, FiltreEnvDefaut) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')
        var CodeEnvironnementDefaut = Config.EnvironnementDefaut
        var filtreActif = '' 
        var filtreDefaut = ''
        
        if (!CodeEnvironnementDefaut) { CodeEnvironnementDefaut= 'PRD' }

        if (FiltreEnvActif === undefined || FiltreEnvActif === false ) {
            filtreActif = ' 1 = 1 '
        } else {
            filtreActif = ' Statut = 1 '
        }

        if (FiltreEnvDefaut === undefined || FiltreEnvDefaut === false ) {
            filtreDefaut=' 1 = 1 '
        } else {
            filtreDefaut = ` Code = '` + CodeEnvironnementDefaut + `'`
        }

        var EnvironnementList = []
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var query = `
            SELECT      EnvironnementID AS "EnvironnementID", 
                        Code AS "Code", 
                        Nom AS "Nom", 
                        Statut AS "Statut", 
                        CreationDate AS "CreationDate", 
                        ModificationDate AS "ModificationDate", 
                        Responsable AS "Responsable" 
            FROM        Environnement 
            WHERE       ${filtreActif} 
            AND         ${filtreDefaut} 
            ORDER BY    EnvironnementID 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement,query, reject, (recordset) => { 
            for (var record of recordset) {
                EnvironnementList.push({
                    EnvironnementID: record.EnvironnementID,
                    Code: record.Code,
                    Nom: record.Nom,
                    Statut: record.Statut,
                    CreationDate: record.CreationDate,
                    ModificationDate: record.ModificationDate,
                    Responsable: record.Responsable
                })
            }
            resolve(EnvironnementList)
        })
    })
}
