const { indexToElasticsearch } = require('deepbloo').elastic

exports.handler = async function (event, context) {
  const elasticRes = await indexToElasticsearch([{ event, context }], 'errors')
  const [{ body }] = elasticRes
  return body
}
