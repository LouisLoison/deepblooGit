exports.UploadFile = (req, res) => {
    var path = require('path');
    var formidable = require('formidable');
    var fs = require('fs');
    var Config = require(process.cwd() + '/config')
    var form = new formidable.IncomingForm()
    var FileList = []
    
    function onError(err) {
        console.log('FAIL: ' + err.message)
        res.end(JSON.stringify({ success: false, Error: err.message }, null, 3))
    }

    function onSuccess(Folder) {
        res.end(JSON.stringify({ success: true, Folder: Folder, FileList: FileList }, null, 3))
    }

    form.multiples = true // specify that we want to allow the user to upload multiple files in a single request
    form.uploadDir = path.join(Config.WorkSpaceFolder, '/Upload') // store all uploads in the /uploads directory

    // every time a file has been uploaded successfully, rename it to it's orignal name
    form.on('file', (field, file) => {
        var FileLocation = path.join(form.uploadDir, file.name);
        fs.rename(file.path, FileLocation, (err) => {
            if ( err ) console.log('ERROR: ' + err)
            FileList.push({ "FileName": file.name })
    
            // Move file to temp folder
            var TempFolder = path.join(form.uploadDir, '/Temp')
            fs.exists(TempFolder, (exists) => {
                if (!exists) {
                    fs.mkdir(TempFolder, (err) => {
                        if (err) { form.emit('error', err) }
                        fs.rename(FileLocation, path.join(TempFolder, file.name), (err) => {
                            if (err) { form.emit('error', err) }
                            onSuccess("Temp")
                        })
                    })
                }
                else {
                    fs.rename(FileLocation, path.join(TempFolder, file.name), (err) => {
                        if (err) { form.emit('error', err) }
                        onSuccess("Temp")
                    })
                }
            })
        })
    })

    // log any errors that occur
    form.on('error', (err) => {
        onError(err)
    })

    // once all the files have been uploaded, send a response to the client
    form.on('end', () => {
        // onSuccess("Temp")
    })

    fs.exists(form.uploadDir, (exists) => {
        if (!exists) {
            var err = {}
            err.message = 'Directorydoes not exist : ' + form.uploadDir
            onError(err)
        }
        else {
            // parse the incoming request containing the form data
            form.parse(req)
        }
    })

}
