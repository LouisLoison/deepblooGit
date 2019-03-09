exports.FichierAjouter = (Projet, Sequenceur, FichierNom) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')
        var path = require('path')
        var fs = require('fs-extra')

        var FileFolder = path.join(Config.WorkSpaceFolder, "/Upload/Temp/")
        var FileLocation = path.join(FileFolder, FichierNom)
        var DestinationFolder = path.join(Config.WorkSpaceFolder, 'Document')
        try { if (!fs.existsSync(DestinationFolder)) { fs.mkdirSync(DestinationFolder) } }
        catch (err) { reject(err); return false }
        DestinationFolder = path.join(DestinationFolder, Projet)
        try { if (!fs.existsSync(DestinationFolder)) { fs.mkdirSync(DestinationFolder) } }
        catch (err) { reject(err); return false }
        DestinationFolder = path.join(DestinationFolder, Sequenceur)
        try { if (!fs.existsSync(DestinationFolder)) { fs.mkdirSync(DestinationFolder) } }
        catch (err) { reject(err); return false }
        var DestinationLocation = path.join(DestinationFolder, FichierNom)
        try { if (!fs.existsSync(DestinationFolder)) { fs.mkdirSync(DestinationFolder) } }
        catch (err) { reject(err); return false }
        fs.rename(FileLocation, DestinationLocation)
        
        BddTool.RecordAddUpdate('EtlTool', 'PRD', 'Document', {
            Projet: Projet,
            Sequenceur: Sequenceur,
            FichierNom: FichierNom,
            Type: 'Fichier'
        }).then((data) => {
            resolve(data)
        }).catch((err) => { reject(err) })
    })
}

exports.List = (Projet, Sequenceur) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var BddTool = require(process.cwd() + '/global/BddTool')

        // Get Document list
        var DocumentList = []
        var BddId = 'EtlTool'
        var BddEnvironnement = 'PRD'
        var Query = `
            SELECT      Document.DocumentID AS "DocumentID", 
                        Document.Environnement AS "Environnement", 
                        Document.Projet AS "Projet", 
                        Document.Sequenceur AS "Sequenceur", 
                        Document.Type AS "Type", 
                        Document.Lien AS "Lien", 
                        Document.FichierNom AS "FichierNom", 
                        Document.Description AS "Description", 
                        Document.CreationDate AS "CreationDate", 
                        Document.ModificationDate AS "ModificationDate", 
                        Document.Responsable AS "Responsable" 
            FROM        Document 
            WHERE       1=1 `
        if (Projet && Projet !== '') {
            Query += `AND         Document.Projet = '${BddTool.ChaineFormater(Projet, BddEnvironnement, BddId)}' `
        }
        if (Sequenceur && Sequenceur !== '') {
            Query += `AND         Document.Sequenceur = '${BddTool.ChaineFormater(Sequenceur, BddEnvironnement, BddId)}' `
        }
        Query += `
            ORDER BY    Environnement, 
                        Document.CreationDate ASC 
        `
        BddTool.QueryExecBdd(BddId, BddEnvironnement, Query, reject, (recordset) => { 
            var DocumentIDEnCours = ''
            for (var record of recordset) {
                if (DocumentIDEnCours === record.DocumentID) { continue; }
                DocumentIDEnCours = record.DocumentID
                DocumentList.push({ 
                    DocumentID: record.DocumentID, 
                    Environnement: record.Environnement, 
                    Projet: record.Projet, 
                    Sequenceur: record.Sequenceur, 
                    Type: record.Type, 
                    Lien: record.Lien, 
                    FichierNom: record.FichierNom, 
                    Description: record.Description, 
                    CreationDate: record.CreationDate, 
                    ModificationDate: record.ModificationDate, 
                    Responsable: record.Responsable
                })
            }
            resolve(DocumentList)
        })
    })
}
