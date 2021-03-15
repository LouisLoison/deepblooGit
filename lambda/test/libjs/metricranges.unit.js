const { metricsRanges, extractMetrics, metricsCriterions } = require('../../libjs/metricranges')

test('metricRangesTest', done => {


  let ranges = metricsRanges('electric potential', [{ entity: 'electric potential', numericValue: 22333 }, { entity: 'power', numericValue: 22333 }])
  // console.log(ranges)
  expect(ranges).toEqual(["MV (1kV/33kV)"])

  ranges = metricsRanges('power', [{ entity: 'electric potential', numericValue: 22333 }, { entity: 'power', numericValue: 22333 }])
  expect(ranges).toEqual(["1kW/1MW"])

  // console.log(ranges)


  extractMetrics({
    title: 'Build a 400kV line with 222 kV and 33 Kv transformers',
    description: 'The power handled is 40MW. A 20/11KV transformer and a 420/210 kV one, linked by a 30 - 40 KVa line over 34 kms of distance, about 23 miles. Repeated A 20/11KV transformer and a 420/210 kV one, linked by a 30 40 KVa line over 34 kms of distance, about 23 m',
  }).then(metrics => {

    // console.log(metrics)
    const criterions = metricsCriterions(metrics)
    // console.log(criterions)
    ranges = metricsRanges('electric potential', criterions)
    // console.log(ranges)
    expect(ranges).toEqual(['EHV (>330kV)', 'EHV (>220kV)', 'HV (33kV/220kV)', 'MV (1kV/33kV)'])
    ranges = metricsRanges('power', criterions)
    // console.log(ranges)
    expect(ranges).toEqual(['10MW/100MW', '1kW/1MW'])
    done()
  })
}, 15000)
