const esmRequire = require('esm')(module)
const { getS3Url, getS3ObjectUrl, getFilename, updateEventOutput } = esmRequire('../../libjs/helpers.js')

test('getS3Url', done => {
  const s3Url = 'https://bucket_name/tenders/tender#id/filename.html'
  const extension = ".pdf"
  const newS3Url = getS3Url(s3Url, extension)
  expect(newS3Url).toEqual('https://bucket_name/tenders/tender#id/filename/filename.html')
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
  const newS3Url = getFilename(objectUrl)
  expect(newS3Url).toEqual('filename.pdf')
  done()
})

test('updateEventOutput', done => {
  const s3Url = 'https://bucket_name/tenders/tender#id/filename.html'
  var event = {
    'objectName': '',
    's3Url': '',
    'sourceUrl': '',
    'filename': ''
  }
  const objectUrl = 'tenders/tender#id/filename.html'
  const newEvent = updateEventOutput(s3Url, objectUrl, event, ".pdf")
  expect(newEvent['objectName']).toEqual('tenders/tender#id/filename/filename.pdf')
  expect(newEvent['filename']).toEqual('filename.pdf')
  expect(newEvent['s3Url']).toEqual('https://bucket_name/tenders/tender#id/filename.pdf')
  expect(newEvent['sourceUrl']).toEqual(newEvent['s3Url'])
  done()
})