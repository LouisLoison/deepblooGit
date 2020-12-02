const AWS = require('aws-sdk')
AWS.config.apiVersions = {
  secretsmanager: '2017-10-17',
  // other service API versions
};

exports.AWS = AWS
exports.documentsBucket = process.env.CONTENT_BUCKET

let dbSecret = false;
let appsearchSecret = false;

const getSecret = async (SecretId) => {
  const secretsmanager = new AWS.SecretsManager()
  const data = await secretsmanager.getSecretValue({ SecretId }).promise()
  console.log(data)
  return JSON.parse(data.SecretString)
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
