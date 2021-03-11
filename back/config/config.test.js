var config = require('./config.global');

config.env = 'test';
config.prefixe = 'test';
config.hostname = 'test.example';
//config.mongo.db = 'example_test';
config.WorkSpaceFolder = '/home/olivier/deepbloo/workspace'
config.ftpPath = '~/deepbloo/workspace/Ftp'
config.elasticEndpoint = "http://localhost:9200/"
config.elasticUser = 'elastic'
config.elasticPassword = 'changeme'
// app search unavailale locally (licensed binary)
config.appsearchEndpoint = "http://localhost:3002/"
config.appsearchSearchKey = "search-xxxxxxxxxxxxxxxxxxxxxxxx"
config.appsearchPrivateKey = "private-xxxxxxxxxxxxxxxxxxxxxxxx"


module.exports = config;
config.algolia.apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.algoliaApiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.zohoRefreshToken = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.zohoClientSecret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.awsSecretAccessKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.hivebrite.clientSecret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...'
