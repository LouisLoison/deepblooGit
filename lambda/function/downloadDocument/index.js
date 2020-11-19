
const { getFileContent, getXmlJsonData, log } = require('deepbloo');

const { StepFunctions } = require('aws-sdk')

const xml2js = require('xml2js')

const stepfunctions = new StepFunctions({apiVersion: '2016-11-23'});

const startImportSteps = async (data) => {
  const normedObject = data.fileSource.split('').filter(char => /[a-zA-Z0-9-_]/.test(char))
  const name = `${normedObject}-${data.fileSourceIndex}`
  const params = {
    stateMachineArn: process.env.TENDER_STATE_MACHINE_ARN, /* required */
    input: JSON.stringify(data, null, 2),
    name,
    // traceHeader: 'STRING_VALUE'
  };
  const result = stepfunctions.startExecution(params);
  log(result, 'Started stepfunctions');
}

exports.handler =  async function(event, ) {
  const bucketName = event['Records'][0]['s3']['bucket']['name']
  const objectName = event['Records'][0]['s3']['object']['key']

  const fileData = await getFileContent(bucketName, objectName)
  const dataSource = objectName.split('/')[1]

  const parser = new xml2js.Parser()
  const parseData = parser.parseString(fileData)
  const iterableData = (dataSource === 'tenderinfo') ? parseData.import.row : parseData.notices.notice
  let tenderCount = 0
  for (const row of iterableData) {
    tenderCount++
    const relatedDocuments = row.related_documents ?
      row.related_documents
        .map(d => d.document_url)
        .filter() : []
    log('Raw row',row,'DEBUG')
    let importData = {}
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

    const importTenderInfo = {
      ...importData,
      related_documents: relatedDocuments,
      fileSource: objectName,
      fileSourceIndex: tenderCount,
      tenderFormat: 'tenderinfo',
      exclusion: '',
      exclusionWord: '',
      status: 1,
      creationDate: new Date(),
      updateDate: new Date()
    }
    await startImportSteps(importTenderInfo)
    if (tenderCount > 1) { break }
  }
  console.log(`Started ${tenderCount} jobs`)
}

