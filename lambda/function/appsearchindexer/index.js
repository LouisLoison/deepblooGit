const { indexObject } = require('deepblooback/controllers/Elasticsearch/MdlElasticsearch');

const getFileContent = async (bucketName, fileKey) => {
  var AWS = require('aws-sdk');
  var s3 = new AWS.S3({apiVersion: '2006-03-01'});
  var options = {
    Bucket    : bucketName,
    Key    : fileKey,
  };
  let fileContent
  console.log(`Getting object s3://${bucketName}/${fileKey}`);
  try {
    const fileObject = await s3.getObject(options).promise();
    fileContent = fileObject.Body.toString('utf-8');
  } catch (error) {
    console.error(error);
  }
  // console.log(fileContent);
  return  fileContent;
}

const getResults = async (bucketName, outputPath) => {
  const content = {
    "fullTextMachineOrder": await getFileContent(bucketName,`${outputPath}text.txt`),
    "fullText": await getFileContent(bucketName,`${outputPath}text-inreadingorder.txt`)
  }
  return content
}

exports.handler =  async function(event, ) {
  const request = JSON.parse(event['Records'][0]['body']);
  const { documentId, objectName, bucketName } = request
  const outputPath = `${objectName}-analysis/${documentId}/`

  const { fullText, fullTextMachineOrder, responseByPage } = await getResults(bucketName, outputPath)
  const tenderId = objectName.split('#')[1].split('/')[0]
  await indexObject([{
    id: tenderId,
    fullText,
    fullTextMachineOrder,
    objectName,
    bucketName,
    }], 'deepbloo-en'); 

  /*
  await indexObject([{
    id: tenderId,
    responseByPage:  JSON.parse(await getFileContent(bucketName,`${outputPath}pages.json`)),
    fullText,
    fullTextMachineOrder,
    objectName,
    bucketName,
    }],
    "textracted"); 
  */
  return {
    statusCode: 200,
    body: 'Started job {}'.format(jobId)
  }
}
