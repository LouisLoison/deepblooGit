exports.CpvListGet = () => {
    return new Promise(async (resolve, reject) => {
        let Cpvs = [
            {
                code: 9200000,
                name: 'petroleum-coal-and-oil-products-',
                included: false,
                logo: 'http://arread.fr/deepbloo/default.png',
                cover_picture: 'http://arread.fr/deepbloo/FondBleu.jpg',
                industries: [
                    {
                        id: 26,
                        name: 'Other Equipment',
                    },
                ],
            },
            {
                code: 31680000,
                name: 'electrical-supplies-and-accessories-',
                included: true,
                logo: 'http://arread.fr/deepbloo/default.png',
                cover_picture: 'http://arread.fr/deepbloo/various.jpg',
                industries: [
                    {
                        id: 14,
                        name: 'LV Equipment',
                    },
                    {
                        id: 26,
                        name: 'Other Equipment',
                    },
                ],
            },
        ]
        resolve(Cpvs)
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

exports.FileParse = () => {
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
