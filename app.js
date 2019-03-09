const express = require('express')
const cors = require("cors")
const compression = require("compression")
const helmet = require("helmet")
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const config = require('./config')

/* Récupération de la config local */
if (config.WorkSpaceFolder !== undefined && config.WorkSpaceFolder !== null) {
  const fs = require('fs')
  var ConfigPath = config.WorkSpaceFolder + 'BackConfig.json'
  try {
    var ConfigParsed = JSON.parse(fs.readFileSync(ConfigPath, 'UTF-8'))
    config.AppBackPort = ConfigParsed.AppBackPort
    config.AppFrontUrl = ConfigParsed.AppFrontUrl
    config.AppSchedulePort = ConfigParsed.AppSchedulePort
    config.bdd = ConfigParsed.bdd
  }
  catch (err) { }
}
config.user = { }

app.use(helmet({
  frameguard: false
}))
app.use(cors({  
  //origin: [config.AppFrontUrl],
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(compression())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/img', express.static(config.WorkSpaceFolder + 'Image/'))
app.use('/document', express.static(config.WorkSpaceFolder + 'Document/'))
app.use('/Projet', express.static(config.WorkSpaceFolder + 'Projet/'))
app.use('/download', express.static(config.WorkSpaceFolder + 'Download/'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'))
})

app.post('/api/User/Login', function(req, res) {
  try {
    res.setHeader('Content-Type', 'application/json')
    require('./controllers/User/CtrlUser').Login(req, res)
  } catch (err) {
    res.end(JSON.stringify({ success: false, Error: 'Error' }, null, 3))
  }
})

app.post('/api/Tool/FrontUrl', function(req, res) {
  res.end(JSON.stringify({ success: false, AppFrontUrl: config.AppFrontUrl }, null, 3))
})

app.post('/upload', function(req, res) {
  // console.log('origin : ' + req.get('origin'))
  res.setHeader('Content-Type', 'application/json')
  const CtrlUpload = require('./controllers/CtrlUpload')
  CtrlUpload.UploadFile(req, res)
})

app.use(function(req, res, next) {
  if (!req.headers.authorization) {
    return res.end(JSON.stringify({ status: 403, Error: 'No credentials sent!' }, null, 3))
  }
  const jwt = require('jsonwebtoken')
  let token = req.headers.authorization.split(' ')[1]
  let certText = 'certTest'
  try {
    let tokenDecoded = jwt.verify(token, certText, { algorithm: 'HS256'})
    config.user.Identifiant = tokenDecoded.Identifiant
    config.user.Pseudo = tokenDecoded.Pseudo
    config.user.RoleId = tokenDecoded.RoleId
    config.user.UserId = tokenDecoded.UserId
  } catch (err) {
    return res.end(JSON.stringify({ status: 403, Error: 'Invalid credentials sent!' }, null, 3))
  }
  if (!config.user.UserId || config.user.UserId === 0 || config.user.UserId === '') {
    return res.end(JSON.stringify({ status: 403, Error: 'Invalid token sent!' }, null, 3))
  }
  next()
})

app.post('/api/:Controller/:Methode', function(req, res) {
  try {
    res.setHeader('Content-Type', 'application/json')
    const ObjectCtrl = require('./controllers/' + req.params.Controller + '/Ctrl' + req.params.Controller)
    if (typeof ObjectCtrl[req.params.Methode] === 'function') {
      ObjectCtrl[req.params.Methode](req, res)
    } else {
      res.end(JSON.stringify({ success: false, Error: 'Unknown methode !' }, null, 3))
    }
  } catch (err) {
    res.end(JSON.stringify({ success: false, Error: 'Error' }, null, 3))
  }
})

app.use(function(req, res) {
  res.status(404).send({ success: false, err: 'Path not found : ' + req.originalUrl })
})

var server = app.listen(config.AppBackPort, function() {
  console.log('Server listening on port ' + config.AppBackPort)
})
