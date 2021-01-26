const { log } = require('deepbloo');
const { get, TokenGet } = require('deepbloo').hivebrite

exports.handler = async function (event,) {
    try {
        await TokenGet()
        let tenders = []
        let ventures = []
        let ventureDuplicates = []
        let pageCount = null
        let pagenum = 0
        for (let i = 1; i < 26; i++) {
            pagenum++
            let response = await get(`api/admin/v2/ventures?page=${pagenum}&per_page=100`)
            if (!pageCount) {
                pageCount = Math.ceil(parseInt(response.headers['x-total'], 10) / parseInt(response.headers['x-per-page'], 10))
                log(`Page count (${pageCount})`)
            }
            for (let venture of response.data.ventures) {
                // venture.pagenum = pagenum
                ventures.push(venture)
            }
        }
        ventures.reverse()
        let ventureNum = -1
        let ventureNbr = ventures.length
        let ventureDateNull = 0
        let ventureDateOk = 0
        for (let venture of ventures) {
            ventureNum++
            //feedable_at:"2019-02-19T00:00:00Z"
            if (!venture.feedable_at) { ventureDateNull++ }
            else {

            }
            // if (venture.company_name === 'Rural Restructuring Agency') { let toto = '' }
            venture.ventureNum = ventureNum
            let _DG_Market_ID = venture.customizable_attributes.find(a => a._DG_Market_ID)
            if (!_DG_Market_ID) { continue }
            let dgMarketId = _DG_Market_ID._DG_Market_ID
            let tender = tenders.find(a => a.dgMarketId === dgMarketId)
            if (!tender) {
                tenders.push({
                    dgMarketId: dgMarketId,
                    hivebriteId: venture.id,
                    created_at: venture.created_at,
                    ventureNum: ventureNum
                })
            } else {
                ventureDuplicates.push({
                    tender,
                    ventureNum,
                    venture
                })
            }
        }
        log(`Venture date null (${ventureDateNull})`)
        return ventureDuplicates
    } catch (error) {
        log(error)
        return error
    }
}