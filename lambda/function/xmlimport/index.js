const { getFileContent, log } = require('deepbloo');
const { StepFunctions } = require('aws-sdk')
const xml2js = require('xml2js')
const util = require('util')
const { v4: uuidv4 } = require('uuid');

const stepfunctions = new StepFunctions({apiVersion: '2016-11-23'});

const startImportSteps = (data) => {
  return new Promise(async (callback, reject) => {
    const normedObject = data.fileSource.split('').filter(char => /[a-zA-Z0-9-_]/.test(char)).join('')
    const name = `${normedObject}-${data.fileSourceIndex}-a`
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
      log(`startExecution Succeeded:\n`, res);
      callback({
        statusCode: 200
      });
    });
    // listen for error
    request.on("error", (err, response) => {
      log(
        `Error --  ${err.message} ${err.code}, ${err.statusCode}`
      );
      reject(err);
    });
    // send request
    request.send();
    log('Started stepfunctions', request);
  });
}

exports.handler =  async function(event, ) {
  const bucketName = event['Records'][0]['s3']['bucket']['name']
  const objectName = event['Records'][0]['s3']['object']['key']

  const fileData = await getFileContent(bucketName, objectName)
  const dataSource = objectName.split('/')[1]

  const parser = new xml2js.Parser()
  const parseString = util.promisify(parser.parseString)
  const parseData = await parseString(fileData)
  const iterableData = (dataSource === 'tenderinfo') ? parseData.import.row : parseData.notices.notice
  let tenderCount = 0
  for (const row of iterableData) {
    tenderCount++

    row["dataSource"] = dataSource;

    const importTenderInfo = {
      tenderData: row,
      fileSource: objectName,
      fileSourceIndex: tenderCount,
      dataSource,
      exclusion: '',
      exclusionWord: '',
      status: 1,
      creationDate: new Date(),
      updateDate: new Date()
    }
    await startImportSteps(importTenderInfo)
    if (tenderCount >= 1) { break }
  }
  log(`Started ${tenderCount} jobs`)
}

