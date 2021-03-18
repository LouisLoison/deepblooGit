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

test('metricRangesExceptTest', done => {


  extractMetrics({
    title: 'Provision Of Replace R/rear Bumper Corner , 400Kw 500Mwh Cct33253',
    description: 'Tenders are invited for Provision of Replace R/Rear Bumper Corner  Cct33253&lt;br /&gt; <br>\n&lt;br /&gt; <br>\n7140950 Cct33253 Toyota Hilux 2.4 Bj 2017 Ahtkb8cd702962058 &lt;br /&gt; <br>\n&lt;br /&gt; <br>\nReplace R/Rear Bumper Corner&lt;br /&gt; <br>\n&lt;br /&gt; <br>\nClosing Date: 2021/01/13&lt;br /&gt; <br>\n&lt;br /&gt; <br>\nClosing Time: 12:00 PM<br><br>Provision Of Replace R/rear Bumper Corner 400Kw 500Mwh Cct33253<br><br>',
  }).then(metrics => {

    console.log(metrics)
    const criterions = metricsCriterions(metrics)
    console.log(criterions)
    done()
  })
}, 15000)

