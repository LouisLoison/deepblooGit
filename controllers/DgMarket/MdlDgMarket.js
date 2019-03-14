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

exports.FileParse = () => {
  return new Promise(async (resolve, reject) => {
    const fs = require('fs')
    const util = require('util')
    const tool = require(process.cwd() + '/controllers/CtrlTool')

    const readFile = util.promisify(fs.readFile)
    // const fileLocation = 'C:/Jean/Project/Deepbloo/Ftp/feed-20190108.xml'
    const fileLocation = 'C:/Jean/Project/Deepbloo/Ftp/feed-20190308.xml'
    let fileData = await readFile(fileLocation)

    const xml2js = require('xml2js')
    var parser = new xml2js.Parser()
    const parseString = util.promisify(parser.parseString)
    let parseData = await parseString(fileData)

    const CpvListOld = await this.CpvListGet()
    const CpvList = require(process.cwd() + '/public/constants/cpvs.json')

    let tenders = []
    parseData.notices.notice.forEach(notice => {
      // description
      let descriptions = []
      if (notice.noticeText) {
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
        title: tool.getXmlJsonData(notice.noticeTitle),
        descriptions: descriptions,
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
        sourceUrls: sourceUrls
      })
    })

    resolve(tenders)
  })
}

exports.FileParseOld = () => {
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
        const CpvList = await this.CpvListGet()

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
  
exports.CpvListGet = () => {
    return new Promise(async (resolve, reject) => {
        let Cpvs = [
          { flag: 'Y', code: 9300000 },
          { flag: 'Y', code: 9310000 },
          { flag: 'Y', code: 9320000 },
          { flag: 'Y', code: 9321000 },
          { flag: 'Y', code: 9322000 },
          { flag: 'Y', code: 9323000 },
          { flag: 'Y', code: 9324000 },
          { flag: 'Y', code: 9330000 },
          { flag: 'Y', code: 9331000 },
          { flag: 'Y', code: 9331100 },
          { flag: 'Y', code: 9331200 },
          { flag: 'Y', code: 9332000 },
          { flag: 'Y', code: 9200000 },
          { flag: 'N', code: 9210000 },
          { flag: 'N', code: 9211000 },
          { flag: 'N', code: 9211100 },
          { flag: 'N', code: 9211200 },
          { flag: 'N', code: 9211300 },
          { flag: 'N', code: 9211400 },
          { flag: 'N', code: 9211500 },
          { flag: 'N', code: 9211600 },
          { flag: 'N', code: 9211610 },
          { flag: 'N', code: 9211620 },
          { flag: 'N', code: 9211630 },
          { flag: 'N', code: 9211640 },
          { flag: 'N', code: 9211650 },
          { flag: 'N', code: 9211700 },
          { flag: 'N', code: 9211710 },
          { flag: 'N', code: 9211720 },
          { flag: 'N', code: 9211800 },
          { flag: 'N', code: 9211810 },
          { flag: 'N', code: 9211820 },
          { flag: 'N', code: 9211900 },
          { flag: 'N', code: 9220000 },
          { flag: 'N', code: 9221000 },
          { flag: 'N', code: 9221100 },
          { flag: 'N', code: 9221200 },
          { flag: 'N', code: 9221300 },
          { flag: 'N', code: 9221400 },
          { flag: 'N', code: 9222000 },
          { flag: 'N', code: 9222100 },
          { flag: 'N', code: 9230000 },
          { flag: 'N', code: 9240000 },
          { flag: 'N', code: 9241000 },
          { flag: 'N', code: 9242000 },
          { flag: 'N', code: 9242100 },
          { flag: 'N', code: 31000000 },
          { flag: 'Y', code: 31100000 },
          { flag: 'N', code: 31110000 },
          { flag: 'N', code: 31111000 },
          { flag: 'Y', code: 31120000 },
          { flag: 'Y', code: 31121000 },
          { flag: 'Y', code: 31121100 },
          { flag: 'Y', code: 31121110 },
          { flag: 'Y', code: 31121111 },
          { flag: 'Y', code: 31121200 },
          { flag: 'Y', code: 31121300 },
          { flag: 'Y', code: 31121310 },
          { flag: 'Y', code: 31121320 },
          { flag: 'Y', code: 31121330 },
          { flag: 'Y', code: 31121331 },
          { flag: 'Y', code: 31121340 },
          { flag: 'Y', code: 31122000 },
          { flag: 'Y', code: 31122100 },
          { flag: 'Y', code: 31124000 },
          { flag: 'Y', code: 31124100 },
          { flag: 'Y', code: 31124200 },
          { flag: 'Y', code: 31126000 },
          { flag: 'Y', code: 31127000 },
          { flag: 'Y', code: 31128000 },
          { flag: 'N', code: 31130000 },
          { flag: 'N', code: 31131000 },
          { flag: 'N', code: 31131100 },
          { flag: 'N', code: 31131200 },
          { flag: 'N', code: 31132000 },
          { flag: 'Y', code: 31140000 },
          { flag: 'Y', code: 31141000 },
          { flag: 'N', code: 31150000 },
          { flag: 'Y', code: 31151000 },
          { flag: 'Y', code: 31153000 },
          { flag: 'Y', code: 31154000 },
          { flag: 'Y', code: 31155000 },
          { flag: 'Y', code: 31156000 },
          { flag: 'Y', code: 31157000 },
          { flag: 'Y', code: 31158000 },
          { flag: 'Y', code: 31158100 },
          { flag: 'Y', code: 31158200 },
          { flag: 'Y', code: 31158300 },
          { flag: 'Y', code: 31160000 },
          { flag: 'Y', code: 31161000 },
          { flag: 'Y', code: 31161100 },
          { flag: 'Y', code: 31161200 },
          { flag: 'Y', code: 31161300 },
          { flag: 'Y', code: 31161400 },
          { flag: 'Y', code: 31161500 },
          { flag: 'Y', code: 31161600 },
          { flag: 'Y', code: 31161700 },
          { flag: 'Y', code: 31161800 },
          { flag: 'Y', code: 31161900 },
          { flag: 'Y', code: 31162000 },
          { flag: 'Y', code: 31162100 },
          { flag: 'Y', code: 31170000 },
          { flag: 'Y', code: 31171000 },
          { flag: 'Y', code: 31172000 },
          { flag: 'Y', code: 31173000 },
          { flag: 'Y', code: 31174000 },
          { flag: 'Y', code: 31200000 },
          { flag: 'Y', code: 31210000 },
          { flag: 'Y', code: 31211000 },
          { flag: 'Y', code: 31211100 },
          { flag: 'Y', code: 31211110 },
          { flag: 'Y', code: 31211200 },
          { flag: 'Y', code: 31211300 },
          { flag: 'Y', code: 31211310 },
          { flag: 'Y', code: 31211320 },
          { flag: 'Y', code: 31211330 },
          { flag: 'Y', code: 31211340 },
          { flag: 'Y', code: 31212000 },
          { flag: 'Y', code: 31212100 },
          { flag: 'Y', code: 31212200 },
          { flag: 'Y', code: 31212300 },
          { flag: 'Y', code: 31212400 },
          { flag: 'Y', code: 31213000 },
          { flag: 'Y', code: 31213100 },
          { flag: 'Y', code: 31213200 },
          { flag: 'Y', code: 31213300 },
          { flag: 'Y', code: 31213400 },
          { flag: 'Y', code: 31214000 },
          { flag: 'Y', code: 31214100 },
          { flag: 'Y', code: 31214110 },
          { flag: 'Y', code: 31214120 },
          { flag: 'Y', code: 31214130 },
          { flag: 'Y', code: 31214140 },
          { flag: 'Y', code: 31214150 },
          { flag: 'Y', code: 31214160 },
          { flag: 'Y', code: 31214170 },
          { flag: 'Y', code: 31214180 },
          { flag: 'Y', code: 31214190 },
          { flag: 'Y', code: 31214200 },
          { flag: 'Y', code: 31214300 },
          { flag: 'Y', code: 31214400 },
          { flag: 'Y', code: 31214500 },
          { flag: 'Y', code: 31214510 },
          { flag: 'Y', code: 31214520 },
          { flag: 'Y', code: 31215000 },
          { flag: 'Y', code: 31216000 },
          { flag: 'Y', code: 31216100 },
          { flag: 'Y', code: 31216200 },
          { flag: 'Y', code: 31217000 },
          { flag: 'Y', code: 31218000 },
          { flag: 'Y', code: 31219000 },
          { flag: 'Y', code: 31220000 },
          { flag: 'Y', code: 31221000 },
          { flag: 'Y', code: 31221100 },
          { flag: 'Y', code: 31221200 },
          { flag: 'Y', code: 31221300 },
          { flag: 'Y', code: 31221400 },
          { flag: 'Y', code: 31221500 },
          { flag: 'Y', code: 31221600 },
          { flag: 'Y', code: 31221700 },
          { flag: 'N', code: 31223000 },
          { flag: 'Y', code: 31224000 },
          { flag: 'Y', code: 31224100 },
          { flag: 'Y', code: 31224200 },
          { flag: 'Y', code: 31224300 },
          { flag: 'Y', code: 31224400 },
          { flag: 'Y', code: 31224500 },
          { flag: 'Y', code: 31224600 },
          { flag: 'Y', code: 31224700 },
          { flag: 'Y', code: 31224800 },
          { flag: 'Y', code: 31224810 },
          { flag: 'Y', code: 31230000 },
          { flag: 'Y', code: 31300000 },
          { flag: 'Y', code: 31310000 },
          { flag: 'Y', code: 31311000 },
          { flag: 'Y', code: 31320000 },
          { flag: 'Y', code: 31321000 },
          { flag: 'Y', code: 31321100 },
          { flag: 'Y', code: 31321200 },
          { flag: 'Y', code: 31321210 },
          { flag: 'Y', code: 31321220 },
          { flag: 'Y', code: 31321300 },
          { flag: 'Y', code: 31321400 },
          { flag: 'Y', code: 31321500 },
          { flag: 'Y', code: 31321600 },
          { flag: 'Y', code: 31321700 },
          { flag: 'Y', code: 31330000 },
          { flag: 'Y', code: 31340000 },
          { flag: 'Y', code: 31341000 },
          { flag: 'Y', code: 31342000 },
          { flag: 'Y', code: 31343000 },
          { flag: 'Y', code: 31344000 },
          { flag: 'Y', code: 31350000 },
          { flag: 'Y', code: 31351000 },
          { flag: 'Y', code: 31400000 },
          { flag: 'Y', code: 31410000 },
          { flag: 'Y', code: 31411000 },
          { flag: 'Y', code: 31420000 },
          { flag: 'Y', code: 31421000 },
          { flag: 'Y', code: 31422000 },
          { flag: 'Y', code: 31430000 },
          { flag: 'Y', code: 31431000 },
          { flag: 'Y', code: 31432000 },
          { flag: 'Y', code: 31433000 },
          { flag: 'Y', code: 31434000 },
          { flag: 'Y', code: 31440000 },
          { flag: 'N', code: 31500000 },
          { flag: 'N', code: 31510000 },
          { flag: 'N', code: 31511000 },
          { flag: 'N', code: 31512000 },
          { flag: 'N', code: 31512100 },
          { flag: 'N', code: 31512200 },
          { flag: 'N', code: 31512300 },
          { flag: 'N', code: 31514000 },
          { flag: 'N', code: 31515000 },
          { flag: 'N', code: 31516000 },
          { flag: 'N', code: 31517000 },
          { flag: 'N', code: 31518000 },
          { flag: 'N', code: 31518100 },
          { flag: 'N', code: 31518200 },
          { flag: 'N', code: 31518210 },
          { flag: 'N', code: 31518220 },
          { flag: 'N', code: 31518300 },
          { flag: 'N', code: 31518500 },
          { flag: 'N', code: 31518600 },
          { flag: 'N', code: 31519000 },
          { flag: 'N', code: 31519100 },
          { flag: 'N', code: 31519200 },
          { flag: 'N', code: 31520000 },
          { flag: 'N', code: 31521000 },
          { flag: 'N', code: 31521100 },
          { flag: 'N', code: 31521200 },
          { flag: 'N', code: 31521300 },
          { flag: 'N', code: 31521310 },
          { flag: 'N', code: 31521320 },
          { flag: 'N', code: 31521330 },
          { flag: 'N', code: 31522000 },
          { flag: 'N', code: 31523000 },
          { flag: 'N', code: 31523100 },
          { flag: 'N', code: 31523200 },
          { flag: 'N', code: 31523300 },
          { flag: 'N', code: 31524000 },
          { flag: 'N', code: 31524100 },
          { flag: 'N', code: 31524110 },
          { flag: 'N', code: 31524120 },
          { flag: 'N', code: 31524200 },
          { flag: 'N', code: 31524210 },
          { flag: 'N', code: 31527000 },
          { flag: 'N', code: 31527200 },
          { flag: 'N', code: 31527210 },
          { flag: 'N', code: 31527260 },
          { flag: 'N', code: 31527270 },
          { flag: 'N', code: 31527300 },
          { flag: 'N', code: 31527400 },
          { flag: 'N', code: 31530000 },
          { flag: 'N', code: 31531000 },
          { flag: 'N', code: 31531100 },
          { flag: 'N', code: 31532000 },
          { flag: 'N', code: 31532100 },
          { flag: 'N', code: 31532110 },
          { flag: 'N', code: 31532120 },
          { flag: 'N', code: 31532200 },
          { flag: 'N', code: 31532210 },
          { flag: 'N', code: 31532300 },
          { flag: 'N', code: 31532310 },
          { flag: 'N', code: 31532400 },
          { flag: 'N', code: 31532500 },
          { flag: 'N', code: 31532510 },
          { flag: 'N', code: 31532600 },
          { flag: 'N', code: 31532610 },
          { flag: 'N', code: 31532700 },
          { flag: 'N', code: 31532800 },
          { flag: 'N', code: 31532900 },
          { flag: 'N', code: 31532910 },
          { flag: 'N', code: 31532920 },
          { flag: 'N', code: 31600000 },
          { flag: 'N', code: 31610000 },
          { flag: 'N', code: 31611000 },
          { flag: 'N', code: 31612000 },
          { flag: 'N', code: 31612200 },
          { flag: 'N', code: 31612300 },
          { flag: 'N', code: 31612310 },
          { flag: 'N', code: 31620000 },
          { flag: 'Y', code: 31625000 },
          { flag: 'Y', code: 31625100 },
          { flag: 'Y', code: 31625200 },
          { flag: 'Y', code: 31625300 },
          { flag: 'N', code: 31630000 },
          { flag: 'N', code: 31640000 },
          { flag: 'N', code: 31642000 },
          { flag: 'N', code: 31642100 },
          { flag: 'N', code: 31642200 },
          { flag: 'N', code: 31642300 },
          { flag: 'N', code: 31642400 },
          { flag: 'N', code: 31642500 },
          { flag: 'N', code: 31643000 },
          { flag: 'N', code: 31643100 },
          { flag: 'N', code: 31644000 },
          { flag: 'N', code: 31645000 },
          { flag: 'N', code: 31650000 },
          { flag: 'N', code: 31651000 },
          { flag: 'N', code: 31660000 },
          { flag: 'N', code: 31670000 },
          { flag: 'N', code: 31671000 },
          { flag: 'N', code: 31671100 },
          { flag: 'N', code: 31671200 },
          { flag: 'Y', code: 31680000 },
          { flag: 'Y', code: 31681000 },
          { flag: 'N', code: 31681100 },
          { flag: 'Y', code: 31681200 },
          { flag: 'N', code: 31681300 },
          { flag: 'N', code: 31681400 },
          { flag: 'N', code: 31681410 },
          { flag: 'N', code: 31681500 },
          { flag: 'N', code: 31682000 },
          { flag: 'N', code: 31682100 },
          { flag: 'N', code: 31682110 },
          { flag: 'Y', code: 31682200 },
          { flag: 'Y', code: 31682210 },
          { flag: 'Y', code: 31682220 },
          { flag: 'Y', code: 31682230 },
          { flag: 'Y', code: 31682300 },
          { flag: 'Y', code: 31682310 },
          { flag: 'Y', code: 31682400 },
          { flag: 'Y', code: 31682410 },
          { flag: 'Y', code: 31682500 },
          { flag: 'Y', code: 31682510 },
          { flag: 'Y', code: 31682520 },
          { flag: 'Y', code: 31682530 },
          { flag: 'Y', code: 31682540 },
          { flag: 'N', code: 31700000 },
          { flag: 'N', code: 31710000 },
          { flag: 'N', code: 31711000 },
          { flag: 'N', code: 31711100 },
          { flag: 'N', code: 31711110 },
          { flag: 'N', code: 31711120 },
          { flag: 'N', code: 31711130 },
          { flag: 'N', code: 31711131 },
          { flag: 'N', code: 31711140 },
          { flag: 'Y', code: 31711150 },
          { flag: 'Y', code: 31711151 },
          { flag: 'Y', code: 31711152 },
          { flag: 'Y', code: 31711154 },
          { flag: 'Y', code: 31711155 },
          { flag: 'N', code: 31711200 },
          { flag: 'N', code: 31711300 },
          { flag: 'N', code: 31711310 },
          { flag: 'N', code: 31711400 },
          { flag: 'N', code: 31711410 },
          { flag: 'N', code: 31711411 },
          { flag: 'N', code: 31711420 },
          { flag: 'N', code: 31711421 },
          { flag: 'N', code: 31711422 },
          { flag: 'N', code: 31711423 },
          { flag: 'N', code: 31711424 },
          { flag: 'N', code: 31711430 },
          { flag: 'N', code: 31711440 },
          { flag: 'N', code: 31711500 },
          { flag: 'Y', code: 31711510 },
          { flag: 'N', code: 31711520 },
          { flag: 'N', code: 31711530 },
          { flag: 'N', code: 31712000 },
          { flag: 'N', code: 31712100 },
          { flag: 'N', code: 31712110 },
          { flag: 'N', code: 31712111 },
          { flag: 'N', code: 31712112 },
          { flag: 'N', code: 31712113 },
          { flag: 'N', code: 31712114 },
          { flag: 'N', code: 31712115 },
          { flag: 'N', code: 31712116 },
          { flag: 'N', code: 31712117 },
          { flag: 'N', code: 31712118 },
          { flag: 'N', code: 31712119 },
          { flag: 'N', code: 31712200 },
          { flag: 'N', code: 31712300 },
          { flag: 'N', code: 31712310 },
          { flag: 'N', code: 31712320 },
          { flag: 'Y', code: 31712330 },
          { flag: 'Y', code: 31712331 },
          { flag: 'Y', code: 31712332 },
          { flag: 'N', code: 31712333 },
          { flag: 'N', code: 31712334 },
          { flag: 'N', code: 31712335 },
          { flag: 'N', code: 31712336 },
          { flag: 'Y', code: 31712340 },
          { flag: 'Y', code: 31712341 },
          { flag: 'Y', code: 31712342 },
          { flag: 'Y', code: 31712343 },
          { flag: 'Y', code: 31712344 },
          { flag: 'Y', code: 31712345 },
          { flag: 'Y', code: 31712346 },
          { flag: 'Y', code: 31712347 },
          { flag: 'Y', code: 31712348 },
          { flag: 'Y', code: 31712349 },
          { flag: 'Y', code: 31712350 },
          { flag: 'N', code: 31712351 },
          { flag: 'N', code: 31712352 },
          { flag: 'N', code: 31712353 },
          { flag: 'N', code: 31712354 },
          { flag: 'N', code: 31712355 },
          { flag: 'N', code: 31712356 },
          { flag: 'N', code: 31712357 },
          { flag: 'N', code: 31712358 },
          { flag: 'N', code: 31712359 },
          { flag: 'N', code: 31712360 },
          { flag: 'N', code: 31720000 },
          { flag: 'N', code: 31730000 },
          { flag: 'N', code: 31731000 },
          { flag: 'N', code: 31731100 },
          { flag: 'Y', code: 45223720 },
          { flag: 'Y', code: 45231200 },
          { flag: 'Y', code: 45231400 },
          { flag: 'Y', code: 45232200 },
          { flag: 'Y', code: 45232210 },
          { flag: 'Y', code: 45232220 },
          { flag: 'Y', code: 45232221 },
          { flag: 'Y', code: 45250000 },
          { flag: 'Y', code: 45255000 },
          { flag: 'Y', code: 45310000 },
          { flag: 'Y', code: 45311000 },
          { flag: 'Y', code: 45311100 },
          { flag: 'Y', code: 45311200 },
          { flag: 'Y', code: 9000000 },
          { flag: 'Y', code: 14000000 },
          { flag: 'Y', code: 76000000 },
        ]
        resolve(Cpvs)
    })
}
