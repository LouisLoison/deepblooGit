const gs = require('node-gs');
const fs = require('fs')
const { documentsBucket, getFileContent, getFilename, putFile, getS3ObjectUrl } = require('deepbloo')

const pdfToImages = async (documentsBucket, objectName) => {
  return new Promise(async (resolve, reject) => {
    const fileData = await getFileContent(documentsBucket, objectName)
    fs.writeFileSync('/tmp/file.pdf', fileData)

    fs.rmdirSync('/tmp/out/', { recursive: true })
    fs.mkdirSync('/tmp/out/')
    gs()
      .batch()
      .nopause()
      .device('png16m')
      .input('/tmp/file.pdf')
      .output('/tmp/out/%d.png')
      .executablePath('/opt/bin/gs')
      .exec(function (error, stdout, stderr) {
        if(error) {
          console.log(error, stderr, stdout)
          return
        }
        Promise.all(fs.readdirSync('/tmp/out/').map(fileName => {
          const pngData = fs.readFileSync(`/tmp/out/${fileName}`)
          const pdfFile = "images/" + getFilename(objectName)
          var objectS3Path = getS3ObjectUrl(objectName, '.pdf')
          objectS3Path = objectS3Path.split('/').slice(0, 3).join('/')
          const outputKey = `${objectS3Path}-${pdfFile}`
          console.log("===> objectS3Path: ", objectS3Path)
          console.log("===> pdfFile: ", pdfFile)
          // const outputKey = getS3ObjectUrl(objectName)
          return putFile(documentsBucket, outputKey, pngData)
        }))
          .then(a =>
            resolve(fs.readdirSync('/tmp/out/'))
          )
        /*
        if ( error ) {
          reject(stderr)
          // ¯\_(ツ)_/¯
        } else {
          resolve(stdout)
          // ( ͡° ͜ʖ ͡°)
        }
        */
      });

  })
}

exports.handler = async function (event, context) {
  console.log("===> ENTER INTO LAMBDA !!")
  const { objectName } = event
  if(event.status <= 0) {
    return { ...event, errorMessage: "Status inst positive" }
  }
  //console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  const imageData = await pdfToImages(documentsBucket, objectName)
  console.log(JSON.stringify(imageData, null, 2))
  return { ...event, pageCount: imageData.length }
}
