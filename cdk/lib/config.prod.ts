
const config = {
  account: '957571717716',
  region: 'eu-west-1',
  dbName: 'db',
  NODE_ENV: 'prod',
  DB_SECRET: 'arn:aws:secretsmanager:eu-west-1:957571717716:secret:aurora-TRgv8E',
  DB_HOST: 'db.cluster-c6pgcparadyn.eu-west-1.rds.amazonaws.com',
  APPSEARCH_ENDPOINT: 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/',
  APPSEARCH_SECRET: 'arn:aws:secretsmanager:eu-west-1:957571717716:secret:appsearch-FRXuuQ',
  ELASTIC_SECRET: 'arn:aws:secretsmanager:eu-west-1:957571717716:secret:elastic-JYZV6g',
  vpcId: 'vpc-a262b9db',
  availabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
  privateSubnetIds: ['subnet-3f332759', 'subnet-a89572e3', 'subnet-02257458'],
  DOCUMENTS_BUCKET: 'documents.deepbloo.com',
  HIVEBRITE_SECRET: 'arn:aws:secretsmanager:eu-west-1:957571717716:secret:hivebrite-In9VfQ',
}

export {
  config,
}
