exports.test = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { Client } = require('@elastic/elasticsearch')
      const client = new Client({
        node: 'https://a85bb760f6f74e4bbb19f9928e3ba878.eu-west-1.aws.found.io:9243/',
        auth: {
          username: 'admin@deepbloo.com',
          password: 'sMt_nC]z_7R9C'
        },
        maxRetries: 5,
        requestTimeout: 60000,
        sniffOnStart: true
      })
      
      client.create({
        id: string,
        index: string,
        type: string,
        wait_for_active_shards: string,
        refresh: 'true' | 'false' | 'wait_for',
        routing: string,
        timeout: string,
        version: number,
        version_type: 'internal' | 'external' | 'external_gte',
        pipeline: string,
        body: object
      })

      resolve()
    } catch (err) { reject(err) }
  })
}
