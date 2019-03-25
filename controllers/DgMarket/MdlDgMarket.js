exports.BddImport = () => {
  return new Promise(async (resolve, reject) => {
    let tendersCurrent = null
    try {
      const fs = require('fs')
      const path = require('path')
      
      // Get file
      const deepblooFolder = 'C:/Temp/Deepbloo/'
      const fileFolder = path.join(deepblooFolder, 'Ftp/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
      }
      const fileLocation = path.join(fileFolder, files[0])

      // Get tenders
      const tenders = await this.FileParse(fileLocation)

      const BddId = 'deepbloo'
      const BddEnvironnement = 'PRD'
      const BddTool = require(process.cwd() + '/global/BddTool')
      for (let tender of tenders) {
        tendersCurrent = tender
        let dgmarket = tender
        dgmarket.status = 0
        dgmarket.updateDate = new Date()

        // Search for internal id
        let recordset = await BddTool.QueryExecBdd2(BddId, BddEnvironnement, `
          SELECT     id AS "id"
          FROM       dgmarket 
          WHERE      dgmarketId = ${BddTool.NumericFormater(tender.dgmarketId, BddEnvironnement, BddId)} 
        `)
        for (let record of recordset) {
          dgmarket.id = record.id
          dgmarket.creationDate = new Date()
        }

        await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'dgmarket', dgmarket)
      }

      // Move file to archive folder
      const fileSource = path.parse(fileLocation).base
      const fileLocationArchive = path.join(deepblooFolder, 'Archive/', fileSource)
      fs.renameSync(fileLocation, fileLocationArchive)

      resolve()
    } catch (err) {
      tendersCurrent = tendersCurrent
      reject(err)
    }
  })
}

exports.FtpGet = () => {
    return new Promise(async (resolve, reject) => {
        const files = await this.FtpList()
        for (const file of files) {
            await this.FtpGetFile(file.name)
        }
        resolve(files)
    })
}

exports.FtpGetFile = (fileName) => {
    return new Promise((resolve, reject) => {
        const config = require(process.cwd() + '/config')
        var PromiseFtp = require('promise-ftp')
        var fs = require('fs')
        const path = require('path')
        var ftp = new PromiseFtp()
        ftp.connect(config.ftp)
        .then((serverMessage) => {
            return ftp.get(`/feed/${fileName}`)
        }).then((stream) => {
            return new Promise((resolve, reject) => {
                const fileLocation = path.join(config.ftpPath, fileName)
                stream.once('close', resolve)
                stream.once('error', reject)
                stream.pipe(fs.createWriteStream(fileLocation))
            })
        }).then(function () {
            return ftp.end()
        }).then(function () {
            resolve()
        })
    })
}

exports.FtpList = () => {
    return new Promise((resolve, reject) => {
        const config = require(process.cwd() + '/config')
        const PromiseFtp = require('promise-ftp')
        const ftp = new PromiseFtp()

        let files = []
        ftp.connect(config.ftp)
        .then((serverMessage) => {
            return ftp.list('/feed/')
        }).then((list) => {
            list.forEach(file => {
                files.push(file)
            })
            return ftp.end()
        }).then(() => {
            resolve(files)
        })
    })
}

exports.FileParse = (fileLocation) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const fileLocation = 'C:/Temp/Deepbloo/Ftp/feed-20190108.xml'

      const fs = require('fs')
      const path = require('path')
      const util = require('util')
      const tool = require(process.cwd() + '/controllers/CtrlTool')
      const readFile = util.promisify(fs.readFile)

      const fileSource = path.parse(fileLocation).base
      let fileData = await readFile(fileLocation, 'utf8')

      const xml2js = require('xml2js')
      var parser = new xml2js.Parser()
      const parseString = util.promisify(parser.parseString)
      let parseData = await parseString(fileData)

      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      let tenders = []
      parseData.notices.notice.forEach(notice => {
        // check biddeadline
        let dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - 15)
        let dateText = tool.getXmlJsonData(notice.bidDeadlineDate)
        if (!dateText || dateText.trim() === '') {
          return false
        }
        let bidDeadlineDateText = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
        let termDate = new Date(bidDeadlineDateText)
        if (isNaN(termDate)) {
          return false
        }
        if (termDate < dateLimit) {
          return false
        }

        // description
        let lang = ''
        let description = ''
        if (notice.noticeText) {
          let descriptions = []
          notice.noticeText.forEach(noticeText => {
            let description = descriptions.find(a => a.lang === noticeText.$.lang)
            if (description) {
              description.text += noticeText._ + '<br><br>'
              description.text = description.text.substring(0, 1000)
            } else {
              descriptions.push({
                lang: noticeText.$.lang,
                text: noticeText._ + '<br><br>'
              })
            }
          })
          if (descriptions && descriptions.length > 0) {
            lang = descriptions[0].lang
            description = descriptions[0].text.substring(0, 5000)
          }
        }

        // HTML format
        const descriptionLowerCase = description.toLowerCase()
        if (!descriptionLowerCase.includes("<br") || !descriptionLowerCase.includes("<table") || !descriptionLowerCase.includes("<div")) {
          description = description.replace(/\r/gm, '<br>')
        }

        // CPV list
        let cpvOkCount = 0
        let cpvsText = tool.getXmlJsonData(notice.cpvs)
        if (cpvsText) {
          let cpvsTextTemp = cpvsText.split(',')
          for (let i = 0; i < cpvsTextTemp.length; i++) {
            let code = parseInt(cpvsTextTemp[i], 10)
            let cpv = CpvList.find(a => a.code === code)
            if (cpv) {
              if (cpv.active) {
                cpvOkCount++
              }
            }
          }
        }
        if (cpvOkCount === 0) {
          return false
        }

        tenders.push({
          dgmarketId: parseInt(tool.getXmlJsonData(notice.id), 10),
          procurementId: tool.getXmlJsonData(notice.procurementId).substring(0, 90),
          title: tool.getXmlJsonData(notice.noticeTitle).substring(0, 450),
          lang: lang,
          description: description,
          contactFirstName: tool.getXmlJsonData(notice.contactAddress[0].firstName),
          contactLastName: tool.getXmlJsonData(notice.contactAddress[0].lastName),
          contactAddress: tool.getXmlJsonData(notice.contactAddress[0].address).substring(0, 490),
          contactCity: tool.getXmlJsonData(notice.contactAddress[0].city).substring(0, 90),
          contactState: tool.getXmlJsonData(notice.contactAddress[0].state).substring(0, 90),
          contactCountry: tool.getXmlJsonData(notice.contactAddress[0].country).substring(0, 90),
          contactEmail: tool.getXmlJsonData(notice.contactAddress[0].email).substring(0, 190),
          contactPhone: tool.getXmlJsonData(notice.contactAddress[0].phone).substring(0, 90),
          buyerName: tool.getXmlJsonData(notice.buyerName),
          buyerCountry: tool.getXmlJsonData(notice.buyerCountry),
          procurementMethod: tool.getXmlJsonData(notice.procurementMethod),
          noticeType: tool.getXmlJsonData(notice.noticeType),
          country: tool.getXmlJsonData(notice.country),
          estimatedCost: tool.getXmlJsonData(notice.estimatedCost),
          currency: tool.getXmlJsonData(notice.currency),
          publicationDate: tool.getXmlJsonData(notice.publicationDate),
          cpvs: tool.getXmlJsonData(notice.cpvs),
          cpvDescriptions: tool.getXmlJsonData(notice.cpvDescriptions),
          bidDeadlineDate: tool.getXmlJsonData(notice.bidDeadlineDate),
          sourceUrl: tool.getXmlJsonData(notice.sourceUrl).substring(0, 1900),
          termDate: termDate,
          fileSource: fileSource
        })
      })

      resolve(tenders)
    } catch (err) { reject(err) }
  })
}

exports.FileParseOld = () => {
  return new Promise(async (resolve, reject) => {
    const fs = require('fs')
    const util = require('util')
    const tool = require(process.cwd() + '/controllers/CtrlTool')

    const readFile = util.promisify(fs.readFile)
    // const fileLocation = 'C:/Jean/Project/Deepbloo/Ftp/feed-20190108.xml'
    const fileLocation = 'C:/Jean/Project/Deepbloo/Ftp/feed-20190308.xml'
    let fileSource = 'feed-20190308.xml'
    let fileData = await readFile(fileLocation)

    const xml2js = require('xml2js')
    var parser = new xml2js.Parser()
    const parseString = util.promisify(parser.parseString)
    let parseData = await parseString(fileData)

    const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

    let tenders = []
    parseData.notices.notice.forEach(notice => {
      // description
      let lang = ''
      let description = ''
      if (notice.noticeText) {
        let descriptions = []
        notice.noticeText.forEach(noticeText => {
          let description = descriptions.find(a => a.lang === noticeText.$.lang)
          if (description) {
            description.text += noticeText._ + '<br><br>'
            description.text = description.text.substring(0, 1000)
          } else {
            descriptions.push({
              lang: noticeText.$.lang,
              text: noticeText._ + '<br><br>'
            })
          }
        })
        if (descriptions.length > 0) {
          lang = descriptions[0].lang
          description = descriptions[0].text.substring(0, 5000)
        }
      }

      // Url source list
      let sourceUrls = []
      let sourceUrl = tool.getXmlJsonData(notice.sourceUrl)
      if (sourceUrl) {
        sourceUrl.split(',').forEach(url => {
          sourceUrls.push(url)
        })
      }

      // CPV list
      let cpvOkCount = 0
      let cpvs = []
      let industries = []
      let cpvsText = tool.getXmlJsonData(notice.cpvs)
      let cpvDescriptionsText = tool.getXmlJsonData(notice.cpvDescriptions)
      if (cpvsText && cpvDescriptionsText) {
        let cpvsTextTemp = cpvsText.split(',')
        let cpvDescriptionsTextTemp = cpvDescriptionsText.split(',')
        for (let i = 0; i < cpvsTextTemp.length; i++) {
          let code = parseInt(cpvsTextTemp[i], 10)
          let cpv = CpvList.find(a => a.code === code)
          if (cpv) {
            if (cpv.active) {
              cpvOkCount++
            }
            cpvs.push(cpvDescriptionsTextTemp[i].split('-').join(' ').trim())
            industries = industries.concat(cpv.industries)
          }
        }
      }
      if (cpvOkCount === 0) {
        return false
      }
      industries = industries.filter((item, pos) => industries.indexOf(item) == pos)

      let dateText = tool.getXmlJsonData(notice.publicationDate)
      let publicationDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
      let publication_timestamp = new Date(publicationDate).getTime()

      dateText = tool.getXmlJsonData(notice.bidDeadlineDate)
      let bidDeadlineDate = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
      let bidDeadline_timestamp = new Date(bidDeadlineDate).getTime()

      tenders.push({
        hivebriteId: parseInt(tool.getXmlJsonData(notice.id), 10),
        procurementId: tool.getXmlJsonData(notice.procurementId),
        title: tool.getXmlJsonData(notice.noticeTitle),
        lang: lang,
        description: description,
        contact: {
          firstName: tool.getXmlJsonData(notice.contactAddress[0].firstName),
          lastName: tool.getXmlJsonData(notice.contactAddress[0].lastName),
          address: tool.getXmlJsonData(notice.contactAddress[0].address),
          city: tool.getXmlJsonData(notice.contactAddress[0].city),
          state: tool.getXmlJsonData(notice.contactAddress[0].state),
          country: tool.getXmlJsonData(notice.contactAddress[0].country),
          email: tool.getXmlJsonData(notice.contactAddress[0].email),
          phone: tool.getXmlJsonData(notice.contactAddress[0].phone),
        },
        buyer: {
            name: tool.getXmlJsonData(notice.buyerName),
            country: tool.getXmlJsonData(notice.buyerCountry),
        },
        procurementMethod: tool.getXmlJsonData(notice.procurementMethod),
        noticeType: tool.getXmlJsonData(notice.noticeType),
        country: tool.getXmlJsonData(notice.country),
        currency: tool.getXmlJsonData(notice.currency),
        publicationDate: publicationDate,
        publication_timestamp: publication_timestamp,
        cpvs: cpvs,
        industries: industries,
        bidDeadlineDate: bidDeadlineDate,
        bidDeadline_timestamp: bidDeadline_timestamp,
        sourceUrls: sourceUrls,
        fileSource: fileSource
      })
    })

    resolve(tenders)
  })
}

exports.FileParseOld2 = () => {
  return new Promise(async (resolve, reject) => {
      const fs = require('fs')
      const util = require('util')
      const tool = require(process.cwd() + '/controllers/CtrlTool')
  
      const readFile = util.promisify(fs.readFile)
      const fileLocation = 'C:/Jean/Project/Deepbloo/Ftp/feed-20190108.xml'
      let fileData = await readFile(fileLocation)

      const xml2js = require('xml2js')
      var parser = new xml2js.Parser()
      const parseString = util.promisify(parser.parseString)
      let parseData = await parseString(fileData)

      const countrys = require(process.cwd() + '/global/country').countrys()
      const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

      let tenders = []
      parseData.notices.notice.forEach(notice => {
          let logo = null
          let cover_picture = null

          // Get industrie id list
          let industryCount = 0
          let industry_ids = []
          let cpvs = tool.getXmlJsonData(notice.cpvs)
          if (cpvs) {
              let cpvIds = cpvs.split(',')
              cpvIds.forEach(cpvId => {
                  let code = parseInt(cpvId, 10)
                  let cpv = CpvList.find(a => a.code === code)
                  if (cpv) {
                      if (cpv.included) {
                          industryCount++
                          if (!logo) {
                              logo = cpv.logo
                              cover_picture = cpv.cover_picture
                          }
                      }
                      cpv.industries.forEach(industrie => {
                          industry_ids.push(industrie.id)
                      })
                  }
              })
          }
          if (industryCount === 0) {
              return false
          }
          if (!logo) {
              logo = 'http://arread.fr/deepbloo/none.png'
              cover_picture = 'https://www.organigramme-cle.com/wp-content/uploads/2012/06/organigramme-cylindre-societe-groupe.jpg'
          }

          // Url source list
          let sourceUrl = tool.getXmlJsonData(notice.sourceUrl)
          let sourceUrlHtml = ''
          if (sourceUrl) {
              let sourceUrls = sourceUrl.split(',')
              sourceUrlHtml = '<table>'
              sourceUrls.forEach(url => {
                  sourceUrlHtml += '<tr>';
                  sourceUrlHtml += '  <td><i class="icon-globe"></i></td>';
                  sourceUrlHtml += '  <td style="overflow: hidden; white-space: nowrap; padding: 4px; width: 400px; display: block; text-overflow: ellipsis;">';
                  sourceUrlHtml += '      <a href="' + url + '" target="_blank">' + url + '</a>';
                  sourceUrlHtml += '  </td>';
                  sourceUrlHtml += '</tr>';
              })
              sourceUrlHtml += '</table>'
              sourceUrl = sourceUrls[0]
          }

          // bid_deadline
          let bid_deadline = tool.getXmlJsonData(notice.bid_deadline)
          let bid_deadlineHtml = ''
          if (bid_deadline) {
              bid_deadlineHtml += '<div class="flexbox push-half--top">'
              bid_deadlineHtml += '  <div class="flexbox__item one-quarter palm--block palm--one-whole palm--push-half--bottom weight--bold">Bid Deadline</div>'
              bid_deadlineHtml += '  <div class="color-gray flexbox__item line-height-1-4 palm--block palm--one-whole soft-half--left text--left three-quarters">'
              bid_deadlineHtml += bid_deadline
              bid_deadlineHtml += '  </div>'
              bid_deadlineHtml += '</div>'
          }

          // description
          let product = ''
          if (sourceUrlHtml !== '') {
              product += sourceUrlHtml + '<br><br>'
          }
          if (bid_deadlineHtml !== '') {
              product += bid_deadlineHtml + '<br>'
          }
          notice.noticeText.forEach(noticeText => {
              if (noticeText.$.lang && (['en', 'fr']).indexOf(noticeText.$.lang) > -1) {
                  product += noticeText._ + '<br><br>'
              }
          })

          // Get location
          const countryName = tool.getXmlJsonData(notice.country)
          const country = countrys.find(a => a.name === countryName)

          let tender = {
              company_name: notice.buyerName,
              high_level_pitch: notice.noticeTitle,
              product: product,
              logo: logo,
              company_website: sourceUrl,
              twitter: null,
              facebook: null,
              angel_list: null,
              created_at: new Date(),
              updated_at: '2019-01-12T08:05:15.563Z',
              user_id: 446799,
              currently_fundraising: false,
              feedable_at: '2019-01-12T08:05:15.563Z',
              fundraising_at: '2019-01-12T08:05:15.563Z',
              fundraising_amount: 0,
              help: ' ',
              business_stage: 'seed_startup',
              non_profit: false,
              video_html: ' ',
              created_date: new Date(),
              cover_picture: cover_picture,
              company_size: '2_10',
              fundraising_currency: 'Currency',
              linkedin: ' ',
              tagline: ' ',
              locations: [
                  {
                      address: null,
                      city: country.city,
                      country_code: country.code
                  }
              ],
              industry_ids: industry_ids,
              customizable_attributes: [
                  {
                      _Notice_Type: tool.getXmlJsonData(notice.noticeType)
                  },
                  {
                      _Bidding_Type: '...'
                  },
                  {
                      _Buyer_Country: '...'
                  },
                  {
                      _Currency: '...'
                  },
                  {
                      _Organization_Procurement_ID: '...'
                  },
                  {
                      _DG_Market_ID: tool.getXmlJsonData(notice.id)
                  },
                  {
                      _Submission_date: '...'
                  }
              ]
          }
          tenders.push(tender)
      })

      resolve(tenders)
  })
}
