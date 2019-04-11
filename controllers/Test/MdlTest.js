exports.ArchiveTest = () => {
    return new Promise((resolve, reject) => {
        const fs = require('fs')
        const path = require('path')
        const moment = require('moment')

        // Liste des fichiers du rep
        let dir = 'C:/Temp/Partage/Archive/'
        fs.readdirSync(dir).forEach(file => {
            let fileLocation = path.join(dir, file)
            let fileStat = fs.statSync(fileLocation)
            if (fileStat.isDirectory()) { return }
            let fileDays = moment().diff(moment(fileStat.mtime), 'days')
            if (fileDays > 60) {
                let archivePath = path.join(dir, 'Archive')
                if (!fs.existsSync(archivePath)) { fs.mkdirSync(archivePath) }
                let year = fileStat.mtime.getUTCFullYear()
                let yearPath = path.join(archivePath, `${year}`)
                if (!fs.existsSync(yearPath)) { fs.mkdirSync(yearPath) }
                let month = fileStat.mtime.getUTCMonth() + 1
                let monthPath = path.join(yearPath, `${month}`)
                if (!fs.existsSync(monthPath)) { fs.mkdirSync(monthPath) }
                let day = fileStat.mtime.getUTCDate()
                let dayPath = path.join(monthPath, `${day}`)
                if (!fs.existsSync(dayPath)) { fs.mkdirSync(dayPath) }
                dayPath = dayPath
                let fileLocationNew = path.join(dayPath, file)
                require(process.cwd() + '/controllers/CtrlTool').renameSync(fileLocation, fileLocationNew)
            }
        })
        resolve(true)
    })
}

exports.OracleTest = () => {
    return new Promise((resolve, reject) => {
        var oracledb = require('oracledb')
        oracledb.getConnection(
        {
            user          : "Ethelp",
            password      : "Ethelp",
            connectString : "(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521)))(CONNECT_DATA=(SID=xe)))"
        },
        function(err, connection)
        {
            if (err) { reject(err); return; }
            connection.execute("SELECT * FROM Job ", (err, result) => {
                if (err) { reject(err); return; }
                console.log(result.rows)
                resolve()
            })
        })
    })
}

exports.PromiseTest = (JobInterfaceID) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var sql = require('mssql');
        sql.connect(Config.AppBdd.config).then(() => { return sql.query`
            SELECT TOP 1 * 
            FROM dsi_hlp_JobInterface WITH(NOLOCK) 
            WHERE JobInterfaceID = ${JobInterfaceID} 
        `}).then(result => {
            sql.close();
            resolve(result.recordset)
        }).catch(err => { sql.close(); reject(err); })
        sql.on('error', err => { sql.close(); reject(err); })
    })
}

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

exports.CpvCreateJson = () => {
  return new Promise(async (resolve, reject) => {
    fs = require('fs')

    let familys = []
    fs.readFileSync('c:/Temp/Onglet4.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      familys.push({
        category: lineArray[0].trim(),
        family: lineArray[1].trim()
      })
    })

    let categories = []
    fs.readFileSync('c:/Temp/Onglet3.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      let category = {
        category: lineArray[0].trim(),
        cpv: parseInt(lineArray[1].trim(), 10),
        cpvText: lineArray[2].trim(),
        words: [],
      }
      for (let i = 4; i < lineArray.length; i++) {
        if (!lineArray[i] || lineArray[i].trim() === '') {
          continue
        }
        category.words.push(lineArray[i].trim())
      }
      let family = familys.find(a => a.category === category.category)
      if (family) {
        category.family = family.family
      }
      categories.push(category)
    })

    let categoriesText = JSON.stringify(categories, null, 3)
    fs.writeFile('c:/Temp/OngletJson2.txt', categoriesText, function (err) {
      if (err) {
        return console.log(err);
      }
    })
  
    /*
    let industries = []
    fs.readFileSync('c:/Temp/Onglet2.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      industries.push(lineArray)
    })
    */

    let cpvs = []
    fs.readFileSync('c:/Temp/Onglet1.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      cpvs.push({
        code: parseInt(lineArray[0], 10),
        label: lineArray[1].split('-').join(' ').trim(),
        active: lineArray[5] === 'Y',
        logo: lineArray[7].trim(),
        picture: lineArray[6].trim(),
        // industries: lineArray[2].split(',').map(a => a.trim()),
        category1: lineArray[3].trim(),
        category2: lineArray[4].trim(),
      })
    })

    let cpvsText = JSON.stringify(cpvs, null, 3)
    fs.writeFile('c:/Temp/OngletJson.txt', cpvsText, function (err) {
      if (err) {
        return console.log(err);
      }
    })
    resolve()
  })
}

exports.Test = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const myText = 'This is My appSentence to find';
      const word = "my sentence";
      let regEx = new RegExp("\\b" + word + "\\b", 'gi');
      let isFind = false;
      if (myText.match(regEx)) {
        isFind = true;
      }
      resolve(isFind)
    } catch (err) { reject(err) }
  })
}

exports.Test2 = () => {
    return new Promise(async (resolve, reject) => {
        const PromiseFtp = require('promise-ftp')
        const ftp = new PromiseFtp()

        let files = []
        ftp.connect({
            host: '34.230.223.174',
            user: 'deepbloo',
            password: 'core25RrRqq',
            protocol: 'ftp'
        })
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

        /*
        const Client = require('ftp')
        const c = new Client({
            host: '34.230.223.174',
            user: 'deepbloo',
            password: 'core25RrRqq',
            protocol: 'ftp'
        })
        c.on('ready', function() {
            c.list(function(err, list) {
                if (err) throw err
                console.dir(list)
                c.end()
                resolve(files)
            })
        })
        // connect to localhost:21 as anonymous
        c.connect()
        */
    })
}

exports.Test3 = () => {
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
