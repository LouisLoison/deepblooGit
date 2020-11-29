const AWS = require('aws-sdk')
AWS.config.apiVersions = {
  secretsmanager: '2017-10-17',
  // other service API versions
};

let dbSecret = false;

exports.getDbSecret = async () => {
  if(!dbSecret) {
    const secretsmanager = new AWS.SecretsManager()
    const SecretId = process.env.DB_SECRET
    const data = await secretsmanager.getSecretValue({ SecretId }).promise()
    console.log(data)
    dbSecret = JSON.parse(data.SecretString)
  }
  return (dbSecret)
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
