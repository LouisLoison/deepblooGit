var config = module.exports = {}

config.prefixe = 'prod'
config.prefixeDev = 'dev'
config.prefixeProd = 'prod'
config.WorkSpaceFolder = 'C:/Temp/Deepbloo/'
config.AppBackPort = 9020
config.AppFrontUrl = 'http://localhost:8095'
config.hostname = 'dev.example.com'
config.env = 'development'
config.ftpPath = 'C:/Jean/Deepbloo/Ftp/'
config.ftp = {
  host: '34.230.223.174',
  user: 'deepbloo',
  password: 'core25RrRqq',
  protocol: 'ftp'
}
config.hivebrite = {
  url: 'https://deepbloo.hivebrite.com/',
  clientId: 'b97245387eab5b1b57ac3135e8ba7fbac2399775844ba8a2fa70426fb0d26e55',
  clientSecret: '24487443aee0962b24b678e9e6f90fec40b25fa645007d418681164423486166',
  token: null,
}
config.hivebriteUrl = 'https://deepbloo.hivebrite.com/',
config.hivebriteToken = null
config.bdd = {
  deepbloo: {
    prod: {
      config: {
        type: 'MySql',
        server: 'database-deepbloo-prd.cxvdonhye3yz.eu-west-1.rds.amazonaws.com', 
        database: 'deepbloo',
        user: 'admin',
        password: 'Deep1806'
      }
    },
    prodAws: {
      config: {
        type: 'MySql',
        server: 'database-deepbloo-prd.cxvdonhye3yz.eu-west-1.rds.amazonaws.com', 
        database: 'deepbloo',
        user: 'admin',
        password: 'Deep1806'
      }
    },
    prodLocal: {
      config: {
        type: 'MySql',
        user: 'root',
        password: 'root',
        server: '127.0.0.1', 
        database: 'DeepBloo'
      }
    },
    dev: {
      config: {
        type: 'MySql',
        user: 'root',
        password: 'root',
        server: '127.0.0.1', 
        database: 'DeepBlooDev'
      }
    },
    devAws: {
      config: {
        type: 'postgres',
        user: 'deepbloo',
        password: 'taiT6jooy7iza',
        server: 'serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com',
        database: 'deepbloo_dev'
      }
    },
    devLocal: {
      config: {
        type: 'postgres',
        user: 'deepbloo',
        password: 'taiT6jooy7iza',
        server: 'postgres-dev-1dd6a1ec3b56af08.elb.eu-west-1.amazonaws.com',
        database: 'deepbloo_dev',
      }
    },
    test: {
      config: {
        type: 'postgres',
        user: 'deepbloo',
        password: 'secret',
        server: '127.0.0.1', 
        database: 'deepbloo'
      }
    }
  }
}
config.algolia = {
  applicationId: '583JWW9ARP',
  apiKey: '5cc468809130d45b76cf76598a09ff21'
},
config.algoliaApplicationId = '583JWW9ARP',
config.algoliaApiKey = '5cc468809130d45b76cf76598a09ff21',
config.zohoRefreshToken = '1000.8ee2f4d33fb3cb6dc41d1575883911f3.96100d4d3fc2cb937efb568a1e3ba879',
config.zohoClientId = '1000.W5CSCR17PF6LE8K6B58JZK2ISFGGIH',
config.zohoClientSecret = '4a3ddb40eaf5269b38ba5496bd99643a8f709b8bc1',
config.zohoUrl = 'https://www.zohoapis.com/',
config.awsAccessKeyId = 'AKIAI3MOVDQQCFHNPKLQ',
config.awsSecretAccessKey = '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',
config.awsBucket = 'tender-document-bucket-v2'
config.awsBucketFtp = 'sftp.deepbloo.com'
config.elasticEndpoint = "https://a85bb760f6f74e4bbb19f9928e3ba878.eu-west-1.aws.found.io:9243/"
config.elasticUser = 'elastic'
config.elasticPassword = 'qIEa2t1kjelVtxLDm0wlnirN'
config.appsearchEndpoint = "https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/"
config.appsearchSearchKey = "search-pg8ft3mtkfkup3occekertmt"
config.appsearchPrivateKey = "private-ychdiximphcy4avd3kdtrc51"
