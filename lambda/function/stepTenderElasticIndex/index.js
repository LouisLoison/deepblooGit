const { indexToElasticsearch, filterDocument } = require('deepbloo').elastic

exports.handler = async function (event,) {
  const { analyzedData, formatedData } = event

  if (event.mergedData.data) {
    const elasticDoc = filterDocument({
      ...analyzedData,
      ...formatedData,
    })
    elasticDoc.id = event.mergedData.data.tenderUuid

    const elasticRes = await indexToElasticsearch([elasticDoc], 'tenders')
    const [{ body }] = elasticRes
    return body
  }
  return {}
}
