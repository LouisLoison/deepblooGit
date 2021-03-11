const { analyzeTender } = require('deepbloo').tenderformat
const { log } = require('deepbloo');
// const { log } = require('deepbloo');

exports.handler =  async function(event, ) {
  const result = { ...event, ...await analyzeTender(event.convertedData) }
  return result
}
