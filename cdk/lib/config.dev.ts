
const config = {
  account: '669031476932',
  region: 'eu-west-1',
  dbName: 'serverless-test',
  NODE_ENV: 'dev',
  DB_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx',
  DB_HOST: 'serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com',
  APPSEARCH_ENDPOINT: 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/',
  APPSEARCH_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:appsearch-TZnQcu',
  ELASTIC_SECRET: "arn:aws:secretsmanager:eu-west-1:669031476932:secret:elastic-fnVFZr",
  vpcId: 'vpc-f7456f91',
  availabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
  privateSubnetIds: ['subnet-0d44e4d2296bfd59f', 'subnet-0530f274ce7351e90', 'subnet-0530f274ce7351e90'],
  DOCUMENTS_BUCKET: 'textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj',
  HIVEBRITE_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:hivebrite-tayvUB',
}

export {
  config,
}
