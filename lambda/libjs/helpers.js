import * as AWS from 'aws-sdk';

const getFileContent = async (bucketName, fileKey) => {
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  const options = {
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

const putFile = async (bucketName, fileKey, fileContent) => {
  console.log(`Writing object s3://${bucketName}/${fileKey}`);
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  const options = {
    Bucket    : bucketName,
    Key    : fileKey,
    Body: fileContent,
  };
  return await s3.putObject(options)
}

const getXmlJsonData = (data) => {
  if (data && data.length > 0) {
    if (data[0]._) {
      return data[0]._
    } else {
      return data[0]
    }
  }
  return ''
}

const log = (message, data, level='INFO') => {
  console.log(`${level} ${JSON.stringify(message, null, 2)} 
    ${JSON.stringify(data, null, 2)}`)
}

export {
  getFileContent,
  putFile,
  getXmlJsonData,
  log,
}
