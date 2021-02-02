const path = require('path')
const { createCanvas } = require('canvas')
const assert = require('assert')
const pdfjsLib = require('pdfjs-dist/es5/build/pdf.js')
const gs = require('node-gs');
var pdf2img = require('pdf2img-lambda-friendly');
const fs = require('fs')
const { documentsBucket, getFileContent, putFile, log } = require('deepbloo')
// process.env['FONTCONFIG_PATH'] = path.join(process.env['LAMBDA_TASK_ROOT'], 'fonts')
// process.env['LD_LIBRARY_PATH'] = path.join(process.env['LAMBDA_TASK_ROOT'], 'fonts');

const pdfToImages = async (documentsBucket, objectName) => {
  return new Promise(async (resolve, reject) => {
    const fileData = await getFileContent(documentsBucket, objectName)
    fs.writeFileSync('/tmp/file.pdf', fileData)
    const pdfData = fs.readFileSync('/tmp/file.pdf')
    //console.log(pdfData)
    /*
    pdf2img.setOptions({
      type: 'jpg',                                // png or jpg, default jpg
      density: 600,                               // default 600
      outputdir: '/tmp/output', // output folder, default null (if null given, then it will create folder name same as file name)
      outputname: 'test',                         // output file name, dafault null (if null given, then it will create image name same as input name)
    });

    console.log('Starting conversion')
    pdf2img.convert('/tmp/file.pdf', function (err, info) {
      console.log('Converted')
      if (err) {

        console.log('Got error')
        // console.log(err)
        // console.log(info)
        reject(err)
      }
      console.log('Got no error')
      // console.log(info);
      const { result, message } =  info
      if(result === 'success') {
        message.forEach(async ({ page, path }) => {
          // console.log(path)
          const pngData = fs.readFileSync(path)
          const outputKey = `${objectName}-${page}.png`
          await putFile (documentsBucket, outputKey, pngData)
        })
      }
      resolve(info)
    });
    
    
    */

    fs.rmdirSync('/tmp/out/', { recursive: true })
    fs.mkdirSync('/tmp/out/')
    gs()
      .batch()
      .nopause()
      .device( 'png16m' )
      .input( '/tmp/file.pdf')
      .output( '/tmp/out/%d.png' )
      .executablePath('/opt/bin/gs')
      .exec( function ( error, stdout, stderr ) {
        console.log('GS returned')
        // console.log(error, stderr, stdout)
        Promise.all(fs.readdirSync('/tmp/out/').map(fileName => {
          const pngData = fs.readFileSync(`/tmp/out/${fileName}`)
          const outputKey = `${objectName}-${fileName}`
          return putFile (documentsBucket, outputKey, pngData)
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

  // console.log(documentsBucket, objectName)
  // console.log(fileData)
  /*
  if (fileData) {

    const pdfDocument = await pdfjsLib.getDocument({
      data: fileData,
      ignoreErrors: true
    }).promise

    const pageToImg = async (pageNum) => {
      return new Promise(async (resolve, reject) => {
        try {

          const page = await pdfDocument.getPage(pageNum)
          // Render the page on a Node canvas with 100% scale.
          const viewport = page.getViewport({ scale: 1.0 })
          const canvasFactory = new NodeCanvasFactory()
          const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)
          const renderContext = {
            canvasContext: canvasAndContext.context,
            viewport: viewport,
            canvasFactory: canvasFactory
          }

          await page.render(renderContext)

          // convert the canvas to a png stream.
          const imageLocation = `/tmp/out-${pageNum}.png`
          if (fs.existsSync(imageLocation)) {
            fs.unlinkSync(imageLocation)
          }
          const out = fs.createWriteStream(imageLocation)

          canvasAndContext.canvas.createPNGStream({ compressionLevel: 9 }).pipe(out)

          out.on('finish', async function () {
            const outputKey = `${objectName}-${pageNum}.png`
            const pngData = fs.readFileSync(imageLocation)
            await putFile (documentsBucket, outputKey, pngData)
            //console.log(pngData)
            /*
            putFile (documentsBucket, outputKey, pngData).then( function () {
              resolve({imageLocation, outputKey})
            })
            */
  /*
   resolve({imageLocation, outputKey})
 })
} catch (err) { reject(err) }
})
}
 
const images = require("images")
const imageDatas = []
console.log(pdfDocument)
for (let i = 1; i <= pdfDocument.numPages; i++) {
log(`processing image ${i}`)
const { imageLocation } = await pageToImg(i)
const imgSizeInfo = images(imageLocation).size()
imageDatas.push({
location: imageLocation,
width: imgSizeInfo.width,
height: imgSizeInfo.height
})
}

return (imageDatas)
}
return []
*/
}

exports.handler = async function (event, context) {
  const { objectName } = event
  //console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  const imageData = await pdfToImages(documentsBucket, objectName)
  console.log(JSON.stringify(imageData, null, 2))
  return { ...event, pageCount: imageData.length }
}
