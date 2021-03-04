const Units = require('./public/constants/units.json')

const metricsRange = ({ entity, numericValue }) => {
  const ranges = Units.ranges[entity] || []
  const [found] = Object.keys(ranges).filter(label => {
    const [min, max] = ranges[label]
    return (min <= numericValue) && (numericValue < max)
  })
  return found
}

const metricsRanges = (entity, criterions) => {
  return (criterions || [])
    .filter(c => (c.entity === entity) && isFinite(c.numericValue))
    .map(c => metricsRange(c))
    .filter(label => label)
}

exports.metricsRanges = metricsRanges
