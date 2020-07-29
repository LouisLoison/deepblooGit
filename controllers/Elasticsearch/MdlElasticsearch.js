exports.test = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { Client } = require('@elastic/elasticsearch')

      const node = 'https://a85bb760f6f74e4bbb19f9928e3ba878.eu-west-1.aws.found.io:9243/'
      const auth = {
        username: 'elastic',
        password: 'qIEa2t1kjelVtxLDm0wlnirN'
      }

      // Elasticsearch connexion
      const client = new Client({
        node,
        auth,
        maxRetries: 5,
        requestTimeout: 60000,
        sniffOnStart: true
      })
      
      // Add document in DeepBloo index
      await client.create({
        id: '3',
        index: 'deepbloo',
        body: {
          tenderId: '963852',
          title: 'MyTitle TestV3',
          description: 'MyDescription TestV3...'
        }
      }, { ignore: [400] })

      /*
      const toto = await client.create({
        id: '1',
        index: 'deepbloo',
        type: 'tenders',
        body: {
          tenderId: 123456,
          title: 'MyTitle',
          description: 'MyDescription'
        }
      })
      */

      resolve(toto)
    } catch (err) { reject(err) }
  })
}
