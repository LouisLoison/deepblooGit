
const config = {
  account: '669031476932',
  region: 'eu-west-1',
  dbName: 'serverless-test',
  NODE_ENV: 'dev',
  DB_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx',
  DB_HOST: 'serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com',
  APPSEARCH_ENDPOINT: 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/',
  APPSEARCH_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:appsearch-TZnQcu',
  ELASTIC_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:elastic-fnVFZr',
  vpcId: 'vpc-f7456f91',
  availabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
  publicSubnetIds: ['subnet-aff99dc9', 'subnet-225d2a6a', 'subnet-a8d677f2'],
  privateSubnetIds: ['subnet-0d44e4d2296bfd59f', 'subnet-0530f274ce7351e90', 'subnet-0530f274ce7351e90'],
  DOCUMENTS_BUCKET: 'textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj',
  HIVEBRITE_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:hivebrite-tayvUB',
  frontCertificateArn: 'arn:aws:acm:us-east-1:669031476932:certificate/6a68b464-3123-4d6f-87f2-dfef8fcce134',
  docsCertificateArn: 'arn:aws:acm:us-east-1:669031476932:certificate/a1ad52e6-b508-4331-bfa6-97919b21376a',
  // backCertificateArn: 'arn:aws:acm:us-east-1:669031476932:certificate/524d4953-0aef-4529-89f9-622edd9cf9dd',
}

export {
  config,
}
