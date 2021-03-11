const pdfToImages = async (fileLocation) => {
  const config = require(process.cwd() + '/config')
  const path = require('path')
  const { createCanvas } = require('canvas')
  const assert = require('assert')
  const pdfjsLib = require('pdfjs-dist')

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

  const pdfDocument = await pdfjsLib.getDocument(fileLocation)

  const pageToImg = async (pageNum) => {
    return new Promise((resolve, reject) => {
      try {
        const fs = require('fs')
        const page = await pdfDocument.getPage(pageNum)

        // Render the page on a Node canvas with 100% scale.
        const viewport = page.getViewport(1.0)
        const canvasFactory = new NodeCanvasFactory()
        const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)
        const renderContext = {
          canvasContext: canvasAndContext.context,
          viewport: viewport,
          canvasFactory: canvasFactory
        }

        await page.render(renderContext)

        // convert the canvas to a png stream.
        const folderTemp = path.join(config.WorkSpaceFolder, '/Temp/')
        const fileName = `testPdfToImg-${pageNum}.png`
        const imageLocation = path.join(folderTemp, fileName)
        if (fs.existsSync(imageLocation)) {
          fs.unlinkSync(imageLocation)
        }
        const out = fs.createWriteStream(imageLocation)
        canvasAndContext.canvas.createPNGStream({compressionLevel: 9}).pipe(out)
        out.on('finish', function(){
          resolve(imageLocation)
        })
      } catch (err) { reject(err) }
    })
  }

  const images = require("images")
  const imageDatas = []
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const imageLocation = await pageToImg(i)
    const imgSizeInfo = images(imageLocation).size()
    imageDatas.push({
      location: imageLocation,
      width: imgSizeInfo.width,
      height: imgSizeInfo.height
    })
  }

  return(imageDatas)
}

const getFileStream = (bucketName, fileKey) => {
  var AWS = require('aws-sdk');
  var s3 = new AWS.S3();
  var options = {
    Bucket    : bucketName,
    Key    : fileKey,
  };

  var fileStream = s3.getObject(options).createReadStream();
  return fileStream;
}

exports.handler =  async function(event, context) {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  const message = JSON.parse(event.record[0]['body'])
  const { bucketName, fileKey, outputBucket, documentId } = message
  const fileStream  = getFileStream(bucketName, fileKey)
  const imageData = await pdfToImages(fileStream)
  console.log(imageData)

  return context.logStreamName
}
