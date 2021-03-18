const { cpvParseTreat, textParseTreat } = require('./textparse')


exports.parseDocumentCriterionsData = (textData, textParses, cpvList, documentScope) => {
  let cpvs = []
  let documentCriterions = []
  const pages = []
  if (textData.pages) {
    for (const pageData of textData.pages) {
      const page = {
        location: pageData.location,
        imgWidth: pageData.imgWidth,
        imgHeight: pageData.imgHeight,
        cpvs: [],
        documentCriterions: []
      }
      if (pageData.textData && pageData.textData.Blocks) {
        const lines = pageData.textData.Blocks.filter(a => a.BlockType === 'LINE')
        for (const line of lines) {
          const documentCriterionCpvfounds = cpvParseTreat(line.Text, cpvList)
          if (documentCriterionCpvfounds) {
            for (const documentCriterionCpv of documentCriterionCpvfounds) {
              const cpvFind = cpvList.find(a => a.cpvId === documentCriterionCpv.cpvId)
              if (cpvFind) {
                const cpv = {
                  documentCriterionCpv,
                  code: cpvFind.code,
                  boundingBox: {
                    left: line.Geometry.BoundingBox.Left,
                    top: line.Geometry.BoundingBox.Top,
                    width: line.Geometry.BoundingBox.Width,
                    height: line.Geometry.BoundingBox.Height,
                  },
                }
                page.cpvs.push(cpv)
                cpvs.push(cpv)
              }
            }
          }
      const documentCriterionNews = textParseTreat(line.Text, textParses, documentScope)
          if (documentCriterionNews) {
            for (const documentCriterionNew of documentCriterionNews) {
              documentCriterionNew.boundingBox = {
                left: line.Geometry.BoundingBox.Left,
                top: line.Geometry.BoundingBox.Top,
                width: line.Geometry.BoundingBox.Width,
                height: line.Geometry.BoundingBox.Height,
              }
              page.tenderCriterions.push(documentCriterionNew)
              documentCriterions.push(documentCriterionNew)
            }
          }
        }
      }
      pages.push(page)
    }
  }
  if (textData.text) {
    const documentCriterionCpvfounds = cpvParseTreat(textData.text, cpvList)
    if (documentCriterionCpvfounds) {
      for (const tenderCriterionCpv of documentCriterionCpvfounds) {
        const cpvFind = cpvList.find(a => a.cpvId === tenderCriterionCpv.cpvId)
        if (cpvFind) {
          const cpv = {
            tenderCriterionCpv,
            code: cpvFind.code,
          }
          cpvs.push(cpv)
        }
      }
    }
  const tenderCriterionNews = textParseTreat(textData.text, textParses, documentScope)
    for (const tenderCriterionNew of tenderCriterionNews) {
      const tenderCriterionFind = documentCriterions.find(a => a.textParseId === tenderCriterionNew.textParseId)
      if (!tenderCriterionFind) {
        documentCriterions.push(tenderCriterionNew)
      }
    }
  }
  return { documentCriterions, cpvs, pages }
}

exports.parseDocumentCpvsText = (text, textParses, cpvList, documentScope) => {
  let cpvs = []
  const pages = []
  let documentCriterions = []
  const documentCriterionCpvfounds = cpvParseTreat(text, cpvList)
  const page = {
      location: null,
      cpvs: [],
      documentCriterions: []
  }
  if (documentCriterionCpvfounds) {
    for (const documentCriterionCpv of documentCriterionCpvfounds) {
      const cpvFind = cpvList.find(a => a.cpvId === documentCriterionCpv.cpvId)
      if (cpvFind) {
        const cpv = {
          documentCriterionCpv,
          code: cpvFind.code,
          boundingBox: {
            left: line.Geometry.BoundingBox.Left,
            top: line.Geometry.BoundingBox.Top,
            width: line.Geometry.BoundingBox.Width,
            height: line.Geometry.BoundingBox.Height,
          },
        }
        page.cpvs.push(cpv)
        cpvs.push(cpv)
      }
    }
  }
  page.tenderCriterions = textParseTreat(text, textParses, documentScope)
  pages.push(page)
  documentCriterions = page.documentCriterions
  return { documentCriterions, cpvs, pages }
}

exports.documentImportCriterions = async (fileLocation, filename, cpvList, textParses, tenderId, exportAws) => {
  return new Promise(async (resolve, reject) => {
    let cpvs = []
    let documentCriterions = []
    let pages = []
    try {
      let documentScope = 'DOCUMENT'
      let text = null
      let textData = null
      if (filename.toLowerCase().endsWith('.pdf')) {
        textData = await this.fileParsePdf(fileLocation, tenderId)
      } else if (filename.toLowerCase().endsWith('.doc')) {
        text = await this.fileParseDoc(fileLocation)
      } else if (filename.toLowerCase().endsWith('.docx')) {
        text = await this.fileParseDocx(fileLocation)
      } else if (filename.toLowerCase().endsWith('.htm') || filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.php')) {
        textData = await this.fileParseHtml(fileLocation, tenderId)
      } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.png')) {
        textData = await this.fileParseImage(fileLocation, tenderId, exportAws)
      }
      if (text) {
        [documentCriterions, cpvs, pages] = this.parseDocumentCpvsText(text, textParses, cpvList, documentScope)
      } else if (textData) {
        [documentCriterions, cpvs, pages] = this.parseDocumentCriterionsData(textData, textParses, cpvList, documentScope)
      }
      resolve({
        cpvs,
        documentCriterions,
        pages,
      })
    } catch (err) { reject(err) }
  })
}