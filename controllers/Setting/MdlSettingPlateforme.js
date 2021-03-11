exports.PlateformeList = () => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')
        var PlateformeList = []
        var BddId = 'EtlTool'
        var Environnement = 'PRD'
        BddTool.QueryExecBdd(BddId, Environnement, `
            SELECT     PlateformeID AS "PlateformeID", 
                       Code AS "Code", 
                       Nom AS "Nom", 
                       Statut AS "Statut", 
                       CreationDate AS "CreationDate", 
                       ModificationDate AS "ModificationDate", 
                       Responsable AS "Responsable" 
            FROM       Plateforme 
            ORDER BY   Nom 
        `, reject, (recordset) => { 
            for (var record of recordset) {
                PlateformeList.push({
                    PlateformeID: record.PlateformeID,
                    Code: record.Code,
                    Nom: record.Nom,
                    Statut: record.Statut,
                    CreationDate: record.CreationDate,
                    ModificationDate: record.ModificationDate,
                    Responsable: record.Responsable
                })
            }
            resolve(PlateformeList)
        })
    })
}
