const lambda = require('../../function/pdftoimg/index')
const input_event = require('input_events/basic.json')
const output_event = require('output_events/basic.json')

test('pdfToImgLambda', done => {
  const event = lambda.handler(input_event, null)
  expect(event).toEqual(output_event)
  done()
})