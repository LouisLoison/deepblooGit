const { indexToElasticsearch } = require('deepbloo').elastic

exports.handler = async function (event,) {
  const { analyzedData, formatedData } = event

  if (event.mergedData.data) {
    const elasticDoc = {
      ...analyzedData,
      ...formatedData,
      id: event.mergedData.data.tenderUuid,
    }

    const elasticRes = await indexToElasticsearch([elasticDoc], 'errors')
    const [{ body }] = elasticRes
    return body
  }
  return {}
}
