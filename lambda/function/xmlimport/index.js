const { getFileContent, log } = require('deepbloo');
const { StepFunctions } = require('aws-sdk')
const xml2js = require('xml2js')
const util = require('util')
// const { v4: uuidv4 } = require('uuid');
// const { createHash } = require('crypto');
const objectHash = require('object-hash');

const stepfunctions = new StepFunctions({ apiVersion: '2016-11-23' });

const startImportSteps = (data) => {
  return new Promise(async (callback, reject) => {
    const dataSource = data.dataSource.slice(0, 10)
    const fileStamp = data.fileSource.split('/').slice(2).join('').slice(-24, -4)
    const normedObject = `${dataSource}-4-${fileStamp}`.split('').filter(char => /[a-zA-Z0-9-_]/.test(char)).join('')
    const contentHash = objectHash(data, { algorithm: 'sha256' })
    // const contentHash = createHash('sha256').update(JSON.stringify(data)).digest('hex')
    const name = `${normedObject}-${data.fileSourceIndex}-${contentHash}`.substring(0, 79)
    log(name, process.env.TENDER_STATE_MACHINE_ARN)
    const params = {
      stateMachineArn: process.env.TENDER_STATE_MACHINE_ARN, /* required */
      input: JSON.stringify(data, null, 2),
      name,
      // traceHeader: 'STRING_VALUE'
    };
    const request = await stepfunctions.startExecution(params);
    // listen for success
    request.on("extractData", res => {
      // log(`startExecution Succeeded:\n`, res);
      callback({
        statusCode: 200,
        duplicate: false,
      });
    });
    // listen for error
    request.on("error", (err, response) => {
      log(
        `Error --  ${err.message} ${err.code}, ${err.statusCode}`
      );
      if (err.code !== 'ExecutionAlreadyExists') {
        reject(err);
      }
      callback({
        statusCode: 200,
        duplicate: true,
      });
    });
    // send request
    request.send();
    // log('Started stepfunctions', request);
  });
}

exports.handler = async function (event,) {
  const bucketName = event['Records'][0]['s3']['bucket']['name']
  const objectName = event['Records'][0]['s3']['object']['key']

  const fileData = await getFileContent(bucketName, objectName)
  const dataSource = objectName.split('/')[1]

  const parser = new xml2js.Parser()
  const parseString = util.promisify(parser.parseString)
  const parseData = await parseString(fileData)
  const iterableData = (dataSource === 'tenderinfo') ? parseData.import.row : parseData.notices.notice
  let tenderCount = 0
  let duplicateCount = 0
  for (const row of iterableData) {
    try {
      tenderCount++

      row["dataSource"] = dataSource;

      const rawTender = {
        tenderData: row,
        fileSource: objectName,
        fileSourceIndex: tenderCount,
        startDelay: (tenderCount < 20 ?
          tenderCount : Math.round(20 + tenderCount * 0.2)), /* Limits step process rates
                                                               allowing 20 seconds slow-start */
        dataSource,
        //      exclusion: '',
        //      exclusionWord: '',
        status: 1,
        creationDate: new Date(),
        updateDate: new Date()
      }
      const { duplicate } = await startImportSteps(rawTender)
      duplicateCount += duplicate ? 1 : 0
      if (tenderCount % 100 == 0) {
        log(`Processed ${tenderCount} tenders, started ${tenderCount - duplicateCount} (${duplicateCount} duplicates)`)
      }
    } catch (error) {
      console.log(error)
    }
    //if (tenderCount >= 5) { break }
  }
  log(`Processed ${tenderCount} jobs, started ${tenderCount - duplicateCount} (${duplicateCount} duplicates)`)
}
