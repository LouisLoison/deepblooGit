const path = require('path')

exports.getS3Url = (s3Url, extension) => {
  // s3Url can be 'https://xxxxxx/tenders/tender%xxxxxx/xxxxxxx/xxxxx.pdf'
  const s3UrlSliced = s3Url.split('/')
  const baseS3Url = s3UrlSliced.slice(2, 5).join('/');
  const documentFile = exports.getFilename(s3Url)
  const documentName = documentFile.split('.')[0];
  const newDocumentFile = documentName + extension;
  return "https://" + path.join(baseS3Url, documentName, newDocumentFile);
}

exports.getS3ObjectUrl = (objectName, extension) => {
  const documentObject = path.parse(objectName);
  const pathArray = objectName.split('/')
  const baseSource = pathArray.slice(0, 2).join('/');
  const newDocument = documentObject.name + extension;
  return path.join(baseSource, documentObject.name, newDocument);
}

exports.getFilename = (objectUrl) => {
  return objectUrl.split('/').slice(-1)[0]
}

exports.updateEventOutput = (s3Url, objectName, event, newExtension) => {
  const filename = exports.getFilename(s3Url)
  const newFilename = filename.split('.')[0] + `${newExtension}`;
  event.s3Url = exports.getS3Url(s3Url, newExtension);
  event.sourceUrl = event.s3Url;
  event.filename = newFilename;
  event.objectName = exports.getS3ObjectUrl(objectName, newExtension);
  return event
}