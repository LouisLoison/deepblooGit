const Units = require('./public/constants/units.json')
const { stripHtml } = require("string-strip-html")
const { AWS, env } = require('./config')

const textparseIds = {
  'power': 1001,
  'electric potential': 1002,
  'length': 1003,
  'currency': 1004,
  'current': 1005,
}

const formatString = (str) => {
  return stripHtml(str).result
    .replace(/[/-]/g, '|').replace(/[kK][V]/g, 'Kv')
}

exports.extractMetrics = async (tender) => {
  return new Promise((resolve, reject) => {
    tender = tender || {}
    const title = formatString(tender.title)
    const description = formatString(tender.description)

    const lambda = new AWS.Lambda()
    lambda.invoke({
      FunctionName: `stepValueExtraction-${env}`,
      Payload: JSON.stringify({
        title,
        description,
      }),
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
    }, (err, data) => {
      if(err) {
        reject(err)
      } else {
        resolve(JSON.parse(data.Payload))
      }
    })
  })
}

exports.metricsCriterions = ({ title_metrics, description_metrics }) => {
  return [...new Set([
    ...title_metrics.map(m => ({
      "value": m.surface,
      "word": m.surface,
      "numericValue": m.value,
      "entity": m.unit.entity,
      "findCount": title_metrics.reduce((acc, val) => acc + ((val.surface === m.surface) ? 1 : 0), 0),
      "textParseId": textparseIds[m.unit.entity],
      "scope": 'TITLE',
    })),
    ...description_metrics.map(m => ({
      "value": m.surface,
      "word": m.surface,
      "numericValue": m.value,
      "entity": m.unit.entity,
      "findCount": description_metrics.reduce((acc, val) => acc + ((val.surface === m.surface) ? 1 : 0), 0),
      "textParseId": textparseIds[m.unit.entity],
      "scope": 'DESCRIPTION',
    })),
  ])]
}

const metricsRange = ({ entity, numericValue }) => {
  const ranges = Units.ranges[entity] || []
  const [found] = Object.keys(ranges).filter(label => {
    const [min, max] = ranges[label]
    return (min <= numericValue) && (numericValue < max)
  })
  return found
}

const metricsRanges = (entity, criterions) => {
  return [...new Set((criterions || [])
    .filter(c => (c.entity === entity) && isFinite(c.numericValue))
    .map(c => metricsRange(c))
    .filter(label => label)
  )]
}

exports.metricsRanges = metricsRanges
