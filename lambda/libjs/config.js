const AWS = require('aws-sdk')
AWS.config.apiVersions = {
  secretsmanager: '2017-10-17',
  lambda: '2015-03-31',
  // other service API versions
};

AWS.config.region = 'eu-west-1'

exports.AWS = AWS
exports.documentsBucket = process.env.DOCUMENTS_BUCKET

const defaultEnv = 'dev'
const defaultLocalEnv = 'local'

const localEnv = process.env.NODE_ENV || defaultEnv

const env = localEnv === defaultLocalEnv ? defaultEnv : process.env.NODE_ENV || localEnv

exports.env = env

let dbSecret = false;
let appsearchSecret = false;
let elasticSecret = false
let hivebriteSecret = false;
let hivebriteSharedSecret = false;

const getSecret = async (SecretId) => {
  const secretsmanager = new AWS.SecretsManager()
  const data = await secretsmanager.getSecretValue({ SecretId }).promise()
  // console.log(data)
  const params = JSON.parse(data.SecretString)
  if (localEnv === 'local') {
    params.host = 'postgres-dev-1dd6a1ec3b56af08.elb.eu-west-1.amazonaws.com'
    params.port = 5432
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
  return { ...elasticSecret }
}

exports.getHivebriteSecret = async () => {
  hivebriteSecret = hivebriteSecret || await getSecret(process.env.HIVEBRITE_SECRET)
  return { ...hivebriteSecret }
}

exports.getHivebriteSharedSecret = async () => {
  hivebriteSharedSecret = hivebriteSharedSecret || await getSecret(process.env.HIVEBRITE_SECRET)
  return { ...hivebriteSharedSecret }
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
