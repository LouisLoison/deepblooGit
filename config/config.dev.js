var config = require('./config.global');

config.env = 'dev';
config.prefixe = 'devLocal';
config.hostname = 'dev.example';
//config.mongo.db = 'example_dev';
config.WorkSpaceFolder = '~/workspace'
config.ftpPath = '~/workspace/Ftp'
config.elasticEndpoint = "http://localhost:9200/"
// config.elasticUser = 'elastic'
// config.elasticPassword = 'changeme'
// app search unavailale locally (licensed binary)
config.appsearchEndpoint = "http://localhost:3002/"
// config.appsearchSearchKey = "search-xxxxxxxxxxxxxxxxxxxxxxxx"
// config.appsearchPrivateKey = "private-xxxxxxxxxxxxxxxxxxxxxxxx"


module.exports = config;
config.algolia.apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.algoliaApiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.zohoRefreshToken = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
config.zohoClientSecret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
// config.awsSecretAccessKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
// config.hivebrite.clientSecret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...'
