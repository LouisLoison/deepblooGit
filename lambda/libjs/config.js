const AWS = require('aws-sdk')
AWS.config.apiVersions = {
  secretsmanager: '2017-10-17',
  // other service API versions
};

exports.AWS = AWS
exports.documentsBucket = process.env.DOCUMENTS_BUCKET

let env = process.env.NODE_ENV || 'dev'
env = process.env.NODE_ENV == 'local' ? 'dev' : env

exports.env = env

let dbSecret = false;
let appsearchSecret = false;
let elasticSecret = false

const getSecret = async (SecretId) => {
  const secretsmanager = new AWS.SecretsManager()
  const data = await secretsmanager.getSecretValue({ SecretId }).promise()
  // console.log(data)
  const params = JSON.parse(data.SecretString)
  if (process.env.NODE_ENV === 'local') {
    params.host = 'localhost'
    params.port = 5434
  }
  return params
}

exports.getDbSecret = async () => {
  dbSecret = dbSecret || await getSecret(process.env.DB_SECRET)
  return dbSecret
}

exports.getAppsearchSecret = async () => {
  appsearchSecret = appsearchSecret || await getSecret(process.env.APPSEARCH_SECRET)
  const appsearchEndpoint = process.env.APPSEARCH_ENDPOINT
  return { ...appsearchSecret, appsearchEndpoint }
}

exports.getElasticSecret = async () => {
  elasticSecret = elasticSecret || await getSecret(process.env.ELASTIC_SECRET)
  const appsearchEndpoint = process.env.APPSEARCH_ENDPOINT
  return { ...elasticSecret }
}

/*
data = {
 ARN: "arn:aws:secretsmanager:us-west-2:123456789012:secret:MyTestDatabaseSecret-a1b2c3",
 CreatedDate: <Date Representation>,
 Name: "MyTestDatabaseSecret",
 SecretString: "{\n  \"username\":\"david\",\n  \"password\":\"BnQw&XDWgaEeT9XGTT29\"\n}\n",
 VersionId: "EXAMPLE1-90ab-cdef-fedc-ba987SECRET1",
 VersionStages: [
    "AWSPREVIOUS"
 ]
}
*/
