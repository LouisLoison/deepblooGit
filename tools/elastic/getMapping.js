
const { getElasticMapping } = require('deepbloo').elastic

const main = async (index) => {
  // console.log(JSON.stringify((await getElasticMapping('tenders')).body['tenders-dev'], null, 2))
  console.log(JSON.stringify((await getElasticMapping(index)).body[`${index}-dev`], null, 2))
  process.exit()
}

main('newtenders')// .then(process.exit())
