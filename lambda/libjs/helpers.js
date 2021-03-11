const { AWS } = require('./config');
const stream = require('stream')
const path = require('path')

const getS3Url = async (s3Url, extension) => {
  // s3Url can be 'https://xxxxxx/tenders/tender%xxxxxx/xxxxxxx/xxxxx.pdf'
  const s3UrlSliced = s3Url.split('/')
  const baseS3Url = "https://" + "/".join(s3UrlSliced.slice(2, 5));
  const documentFile = getFilename(s3Url)
  const documentName = documentFile.split('.')[0];
  const newDocumentFile = documentFile + extension;
  return path.join(baseS3Url, documentName, newDocumentFile);
}

const getS3ObjectUrl = async (objectName, extension) => {
  const documentObject = path.parse(objectName);
  const pathArray = objectName.split('/')
  const baseSource = pathArray.slice(0, 3).join('/');
  const newDocument = documentObject.name + extension;
  return path.join(baseSource, documentObject.name, newDocument);
}

const getFilename = async (objectUrl) => {
  return objectUrl.split('/').slice(-1)[0]
}

const updateEventOutput = async (s3Url, objectName, event, newExtension) => {
  const filename = getFilename(s3Url)
  const newFilename = filename.split('.')[0] + `.${newExtension}`;
  event.s3Url = getS3Url(s3Url, newExtension);
  event.sourceUrl = event.s3Url;
  event.filename = newFilename;
  event.objectName = getS3ObjectUrl(objectName, newExtension);
}

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
  return s3.putObject(options).promise()
}

const putStream = (bucketName, fileKey) => {
  console.log(`Uploading stream object s3://${bucketName}/${fileKey}`);
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  const pass = new stream.PassThrough();
  const options = {
    Bucket    : bucketName,
    Key    : fileKey,
    Body: pass
  };
  s3.upload(options, function(err, data) {
    console.log(err, data);
  });

  return pass
}

const getXmlJsonData = (data) => {
  if (!data) return null
  if (data && data.length > 0) {
    if (data[0]._) {
      return data[0]._
    } else {
      return data[0]
    }
  }
  return ''
}

const getXmlJsonArray = (data) => {
  if (!data) return null
  return data.map(d => d._ || d)
}

const log = (message, data, level='INFO') => {
  try {
    console.log(`${JSON.stringify(message, null, 2)}
${data === undefined ? '' : JSON.stringify(data, null, 2)}`)
  } catch (e) {
    if (e instanceof TypeError) {
      console.log(message)
      if (data !== undefined) { console.log(data) }
    }
    else {
      throw e
    }
  }
}

const onError = (err, res) => {
  if (process.env.NODE_ENV == 'dev') {
    console.log(err)
  }
  return (
    {
      success: false,
      Error: err.message,
      data: err.response && err.response.data ? err.response.data : null
    }
  )
}

export {
  getS3Url,
  getS3ObjectUrl,
  getFilename,
  updateEventOutput,
  getFileContent,
  putFile,
  putStream,
  getXmlJsonData,
  getXmlJsonArray,
  log,
  onError
}
