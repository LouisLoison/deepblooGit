const { getS3Url,  getS3ObjectUrl, getFilename, updateDocumentOutput } = require('../../libjs/urlhelper.js')


test('getS3Url', done => {
  const s3Url = 'https://bucket_name/tenders/tender#id/filename.html'
  const extension = ".pdf"
  const newS3Url = getS3Url(s3Url, extension)
  expect(newS3Url).toEqual('https://bucket_name/tenders/tender#id/filename/filename.pdf')
  done()
})

test('getS3ObjectUrl', done => {
  const objectUrl = 'tenders/tender#id/filename.html'
  const extension = ".pdf"
  const newS3Url = getS3ObjectUrl(objectUrl, extension)
  expect(newS3Url).toEqual('tenders/tender#id/filename/filename.pdf')
  done()
})

test('getFilename', done => {
  const objectUrl = 'tenders/tender#id/filename.html'
  const filename = getFilename(objectUrl)
  try {
    expect(filename).toEqual('filename.html')
  } catch (err) {
    throw err
  }
  done()
})

test('getFilenameWiths3Url', done => {
  const s3Url = 'https://bucket_name/tenders/tender%23id/filename/filename.pdf'
  const filename = getFilename(s3Url)
  try {
    expect(filename).toEqual('filename.pdf')
  } catch (err) {
    throw err
  }
  done()
})

test('updateDocumentOutput', done => {
  const s3Url = 'https://bucket_name/tenders/tender#id/filename.html'
  var event = {
    'objectName': '',
    's3Url': '',
    'sourceUrl': '',
    'filename': ''
  }
  const objectUrl = 'tenders/tender#id/filename.html'
  const newEvent = updateDocumentOutput(s3Url, objectUrl, event, ".pdf")
  expect(newEvent.objectName).toEqual('tenders/tender#id/filename/filename.pdf')
  expect(newEvent.filename).toEqual('filename.pdf')
  expect(newEvent.s3Url).toEqual('https://bucket_name/tenders/tender#id/filename/filename.pdf')
  expect(newEvent.sourceUrl).toEqual(newEvent['s3Url'])
  done()
})