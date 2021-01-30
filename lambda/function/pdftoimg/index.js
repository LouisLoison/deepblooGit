const path = require('path')
const { createCanvas } = require('canvas')
const assert = require('assert')
const pdfjsLib = require('pdfjs-dist/es5/build/pdf.js')
const { documentsBucket, getFileContent, log } = require('deepbloo')

const pdfToImages = async (documentsBucket, objectName) => {
  function NodeCanvasFactory() {
  }

  NodeCanvasFactory.prototype = {
    create: function NodeCanvasFactory_create(width, height) {
      assert(width > 0 && height > 0, 'Invalid canvas size')
      let canvas = createCanvas(width, height, 'png')
      let context = canvas.getContext('2d')
      return {
        canvas: canvas,
        context: context,
      }
    },

    reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
      assert(canvasAndContext.canvas, 'Canvas is not specified')
      assert(width > 0 && height > 0, 'Invalid canvas size')
      canvasAndContext.canvas.width = width
      canvasAndContext.canvas.height = height
    },

    destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
      assert(canvasAndContext.canvas, 'Canvas is not specified')
      canvasAndContext.canvas.width = 0
      canvasAndContext.canvas.height = 0
      canvasAndContext.canvas = null
      canvasAndContext.context = null
    },
  }
  const fileData = await getFileContent(documentsBucket, objectName)
  console.log(documentsBucket, objectName)
  console.log(fileData)
  if (fileData) {
    const pdfDocument = await pdfjsLib.getDocument({ data: fileData }).promise

    const pageToImg = async (pageNum) => {
      return new Promise(async (resolve, reject) => {
        try {
          const fs = require('fs')
          const page = await pdfDocument.getPage(pageNum)
          console.log(page)
          // Render the page on a Node canvas with 100% scale.
          const viewport = page.getViewport({ scale: 1.0 })
          console.log(viewport)
          const canvasFactory = new NodeCanvasFactory()
          const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)
          const renderContext = {
            canvasContext: canvasAndContext.context,
            viewport: viewport,
            canvasFactory: canvasFactory
          }

          await page.render(renderContext)

          // convert the canvas to a png stream.
          const folderTemp = '/tmp/'
          const fileName = `testPdfToImg-${pageNum}.png`
          const imageLocation = path.join(folderTemp, fileName)
          if (fs.existsSync(imageLocation)) {
            fs.unlinkSync(imageLocation)
          }
          const out = fs.createWriteStream(imageLocation)
          canvasAndContext.canvas.createPNGStream({ compressionLevel: 9 }).pipe(out)
          out.on('finish', function () {
            resolve(imageLocation)
          })
        } catch (err) { reject(err) }
      })
    }

    const images = require("images")
    const imageDatas = []
    console.log(pdfDocument)
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      log(`processing image ${i}`)
      const imageLocation = await pageToImg(i)
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
}

const getFileStream = (bucketName, fileKey) => {
  var AWS = require('aws-sdk');
  var s3 = new AWS.S3();
  var options = {
    Bucket: bucketName,
    Key: fileKey,
  };

  var fileStream = s3.getObject(options).createReadStream();
  return fileStream;
}

exports.handler = async function (event, context) {
  const { objectName } = event
  console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  const imageData = await pdfToImages(documentsBucket, objectName)
  console.log(imageData)
  return { ...event, pageCount: imageData.length }
}
