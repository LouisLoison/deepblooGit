// const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList

const { getXmlJsonData, getXmlJsonArray, log } = require('deepbloo');
const moment = require('moment')

exports.handler =  async function(event, ) {
  let tender = {}
  if (event.dataSource === 'dgmarket') {
    let title = getXmlJsonData(event.noticeTitle)

    // Format description
    let lang = ''
    let description = ''
    if (event.noticeText) {
      let descriptions = []
      event.noticeText.forEach(noticeText => {
        let description = descriptions.find(a => a.lang === noticeText.$.lang)
        if (description) {
          description.text += noticeText._ + '<br><br>'
        } else {
          descriptions.push({
            lang: noticeText.$.lang,
            text: noticeText._ + '<br><br>'
          })
        }
      })
      if (descriptions && descriptions.length > 0) { // TODO support other languages
        lang = descriptions[0].lang
        description = descriptions[0].text
      }
    }

    // importDgmarket
    const bidDeadlineDateText = getXmlJsonData(event.bidDeadlineDate)
    const bidDeadlineDate = `${bidDeadlineDateText.substring(0, 4)}-${bidDeadlineDateText.substring(4, 6)}-${bidDeadlineDateText.substring(6, 8)}`
    const publicationDateText = getXmlJsonData(event.publicationDate)
    const publicationDate = `${publicationDateText.substring(0, 4)}-${publicationDateText.substring(4, 6)}-${publicationDateText.substring(6, 8)}`

    const sourceUrl = []
    getXmlJsonArray(event.sourceUrl).forEach(d => sourceUrl.push(...d.split(',')))

    tender = {
      dataSourceId: parseInt(getXmlJsonData(event.id), 10),
      procurementId: getXmlJsonData(event.procurementId).substring(0, 90),
      title: title.substring(0, 450),
      lang: lang,
      description: description.substring(0, 5000),
      contactFirstName: getXmlJsonData(event.contactAddress[0].firstName).substring(0, 90),
      contactLastName: getXmlJsonData(event.contactAddress[0].lastName).substring(0, 90),
      contactAddress: getXmlJsonData(event.contactAddress[0].address).substring(0, 490),
      contactCity: getXmlJsonData(event.contactAddress[0].city).substring(0, 90),
      contactState: getXmlJsonData(event.contactAddress[0].state).substring(0, 90),
      contactCountry: getXmlJsonData(event.contactAddress[0].country).substring(0, 90),
      contactEmail: getXmlJsonData(event.contactAddress[0].email).substring(0, 190),
      contactPhone: getXmlJsonData(event.contactAddress[0].phone).substring(0, 90),
      buyerName: getXmlJsonData(event.buyerName),
      buyerCountry: getXmlJsonData(event.buyerCountry),
      procurementMethod: getXmlJsonData(event.procurementMethod),
      noticeType: getXmlJsonData(event.noticeType),
      country: getXmlJsonData(event.country),
      estimatedCost: getXmlJsonData(event.estimatedCost),
      currency: getXmlJsonData(event.currency),
      publicationDate,
      cpvs: getXmlJsonData(event.cpvs),
      bidDeadlineDate,
      sourceUrl: sourceUrl,
      dataSource: event.dataSource,
      origine: 'DgMarket',
      creationDate: new Date(),
      updateDate: new Date(),
    }

    // check biddeadline
    /*
    let termDate = null
    let dateText = importDgmarket.bidDeadlineDate
    if (dateText && dateText.trim() !== '') {
      let bidDeadlineDateText = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
      termDate = new Date(bidDeadlineDateText)
    }
    if (!termDate || isNaN(termDate)) {
      dateText = importDgmarket.publicationDate
      if (dateText && dateText.trim() !== '') {
        let bidDeadlineDateText = `${dateText.substring(0, 4)}-${dateText.substring(4, 6)}-${dateText.substring(6, 8)}`
        termDate = new Date(bidDeadlineDateText)
      }
    }
    if (!termDate || isNaN(termDate)) {
      termDate = new Date()
    }

    // Check limit date
    let dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - 15)
    if (termDate < dateLimit) {
      importDgmarket.exclusion = 'LIMIT DATE'
      importDgmarket.status = -10
      continue
    }
	*/
  } else if (event.dataSource === 'tenderinfo') {
    /*
    if (dataSource === 'tenderinfo') {
      importData = {
        posting_id: getXmlJsonData(row.posting_id),
        date_c: getXmlJsonData(row.date_c),
        email_id: getXmlJsonData(row.email_id),
        region: getXmlJsonData(row.region),
        region_code: getXmlJsonData(row.region_code),
        add1: getXmlJsonData(row.add1),
        adid2: getXmlJsonData(row.add2),
        city: getXmlJsonData(row.city),
        state: getXmlJsonData(row.state),
        pincode: getXmlJsonData(row.pincode),
        country: getXmlJsonData(row.country),
        country_code: getXmlJsonData(row.country_code),
        url: getXmlJsonData(row.url),
        tel: getXmlJsonData(row.tel),
        fax: getXmlJsonData(row.fax),
        contact_person: getXmlJsonData(row.contact_person),
        maj_org: getXmlJsonData(row.maj_org),
        tender_notice_no: getXmlJsonData(row.tender_notice_no),
        notice_type: getXmlJsonData(row.notice_type),
        notice_type_code: getXmlJsonData(row.notice_type_code),
        bidding_type: getXmlJsonData(row.bidding_type),
        global: getXmlJsonData(row.global),
        mfa: getXmlJsonData(row.mfa),
        tenders_details: getXmlJsonData(row.tenders_details),
        short_desc: getXmlJsonData(row.short_desc),
        currency: getXmlJsonData(row.currency),
        est_cost: getXmlJsonData(row.est_cost),
        doc_last: getXmlJsonData(row.doc_last),
        financier: getXmlJsonData(row.financier),
        sector: getXmlJsonData(row.sector),
        sector_code: getXmlJsonData(row.sector_code),
        corregendum_details: getXmlJsonData(row.corregendum_details),
        project_name: getXmlJsonData(row.project_name),
        cpv: getXmlJsonData(row.cpv),
        authorize: getXmlJsonData(row.authorize),
      }
    } else if (dataSource === 'dgmarket') {
      importData = row
    }
    */

    const tenderData = Object.keys(event)
      .filter(k => !(k in ['related_documents']))
      .reduce((acc, k) => ({...acc, [k]: getXmlJsonData(event[k])}), {})

    const relatedDocuments = []
    if(event.related_documents) {
      event.related_documents
        .map(d => d.document_url)
        .filter(d => d)
        .forEach(d => relatedDocuments.push(...d))
    }

    const title = tenderData.short_desc
    const description = tenderData.tenders_details
    const termDate = moment(tenderData.doc_last, "YYYY-MM-DD").toDate()
    tender = {
      dataSourceId: tenderData.posting_id,
      procurementId: tenderData.tender_notice_no,
      title,
      lang: '',
      description,
      contactFirstName: '', // XXX
      contactLastName: tenderData.contact_person,
      contactAddress: tenderData.add1,
      contactCity: tenderData.city,
      contactState: tenderData.state,
      contactCountry: tenderData.country,
      contactEmail: tenderData.city,
      contactPhone: tenderData.email_id,
      buyerName: tenderData.maj_org,
      buyerCountry: tenderData.country,
      procurementMethod: tenderData.bidding_type,
      noticeType: tenderData.notice_type,
      country: tenderData.country,
      estimatedCost: tenderData.est_cost,
      currency: tenderData.currency,
      publicationDate: tenderData.date_c,
      //      cpvsOrigine: null,
      cpvs: tenderData.cpv,
      //      cpvDescriptions: null,
      words: '',
      bidDeadlineDate: tenderData.doc_last,
      sourceUrl: relatedDocuments,
      termDate: termDate,
      fileSource: tenderData.fileSource,
      dataSource: event.dataSource,
      origine: 'TenderInfo',
      creationDate: new Date(),
      updateDate: new Date(),
    }
  }
  else { throw new Error(`Unknown dataSource ${event.dataSource}`) }

  return tender
}
