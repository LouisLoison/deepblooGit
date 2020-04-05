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
    }
  }
}
config.algolia = {
  applicationId: '583JWW9ARP',
  apiKey: '5cc468809130d45b76cf76598a09ff21'
}
