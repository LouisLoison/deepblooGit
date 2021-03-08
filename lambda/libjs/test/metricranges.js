const { metricsRanges, extractMetrics, metricsCriterions } = require('../metricranges')

let ranges = metricsRanges('electric potential', [{entity: 'electric potential', numericValue: 22333 } , {entity: 'power', numericValue: 22333 }])
console.log(ranges)

ranges = metricsRanges('power', [{entity: 'electric potential', numericValue: 22333 } , {entity: 'power', numericValue: 22333 }])

console.log(ranges)



const metrics = extractMetrics({title: 'Build a 400kV line with 222 kV and 33 Kv transformers',
  description: 'The power handled is 40MW. A 20/11KV transformer and a 420/210 kV one, linked by a 30 - 40 KVa line over 34 kms of distance, about 23 miles. Repeated A 20/11KV transformer and a 420/210 kV one, linked by a 30 40 KVa line over 34 kms of distance, about 23 m',
})
  .then((metrics) => {
    console.log(metrics)
    const criterions = metricsCriterions(metrics)
    console.log(criterions)
    ranges = metricsRanges('electric potential', criterions)
    console.log(ranges)
    ranges = metricsRanges('power', criterions)
    console.log(ranges)
  })
