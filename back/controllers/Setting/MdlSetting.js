exports.ArchiveData = () => {
    return new Promise(async (resolve, reject) => {
        const fs = require('fs-extra')
        const path = require('path')
        const moment = require('moment')
        const Config = require(process.cwd() + '/config')

        // Archive log file
        let LogFolder = path.join(Config.WorkSpaceFolder, 'Planhelp/Log/')
        let archivePath = path.join(LogFolder, 'Archive')
        await require(process.cwd() + '/controllers/CtrlTool').ArchiveFile(LogFolder, archivePath)

        // Purge upload folder
        TempFolder = path.join(Config.WorkSpaceFolder, `Upload/Temp/`)
        if (fs.existsSync(TempFolder)) {
            fs.readdirSync(TempFolder).forEach(file => {
                let fileLocation = path.join(TempFolder, file)
                let fileStat = fs.statSync(fileLocation)
                let fileDays = moment().diff(moment(fileStat.mtime), 'days')
                if (fileDays > 2) {
                    require(process.cwd() + '/controllers/CtrlTool').removeAsync(fileLocation)
                }
            })
        }

        resolve()
    })
}

exports.BackConfig = () => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var path = require('path')
        var fs = require('fs')
        var ConfigPath = path.join(Config.WorkSpaceFolder, 'BackConfig.json')
        var ConfigParsed = JSON.parse(fs.readFileSync(ConfigPath, 'UTF-8'))
        resolve(ConfigParsed)
    })
}

exports.BackConfigUpdate = (BackConfig) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var path = require('path')
        var fs = require('fs')
        var BackConfigLocation = path.join(Config.WorkSpaceFolder, 'BackConfig2.json')
        fs.writeFile(BackConfigLocation, JSON.stringify(BackConfig, null, 2), 'utf8', (err) => {
            if (err) { throw err }
        })
        resolve()
    })
}

exports.FrontConfig = (Environnement) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var path = require('path')
        var fs = require('fs')
        var FrontConfigLocation = path.join(Config.WorkSpaceFolder, 'FrontConfig.json')
        var FrontConfig = { }
        fs.readFile(FrontConfigLocation, 'utf8', (err, donnees) => {
            if (err) { throw err }
            FrontConfig = JSON.parse(donnees)
            resolve(FrontConfig)
        })
    })
}

exports.FrontConfigFieldUpdate = (Field, Value) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var path = require('path')
        var fs = require('fs')
        var FrontConfigLocation = path.join(Config.WorkSpaceFolder, 'FrontConfig.json')
        var FrontConfig = { }
        fs.readFile(FrontConfigLocation, 'utf8', (err, donnees) => {
            if (err) { throw err }
            FrontConfig = JSON.parse(donnees)
            FrontConfig[Field] = Value
            fs.writeFile(FrontConfigLocation, JSON.stringify(FrontConfig, null, 2), 'utf8', (err) => {
                if (err) { throw err }
            })
        })
        resolve()
    })
}
