var config = module.exports = {}

config.prefixe = 'prod'
config.prefixeDev = 'dev'
config.prefixeProd = 'prod'
config.WorkSpaceFolder = 'C:/Ethelp/'
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
},
config.hivebriteUrl = 'https://deepbloo.hivebrite.com/',
config.hivebriteToken = null
config.bdd = {
  deepbloo: {
    prod: {
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
