const express = require('express')
const cors = require("cors")
const compression = require("compression")
const helmet = require("helmet")
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const config = require('./config')

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

const urlPublics = [
  '/api/PrivateDeal/PrivateDealGet',
  '/api/Annonce/List',
  '/api/Annonce/Click',
]
app.use(function(req, res, next) {
  if (urlPublics.includes(req.path)) {
    next()
  } else {
    if (!req.headers.authorization) {
      return res.end(JSON.stringify({ status: 403, Error: 'No credentials sent!' }, null, 3))
    }
    const jwt = require('jsonwebtoken')
    let token = req.headers.authorization.split(' ')[1]
    let certText = 'certTest'
    try {
      let tokenDecoded = jwt.verify(token, certText, { algorithm: 'HS256'})
      config.user.userId = tokenDecoded.userId
      config.user.hivebriteId = tokenDecoded.hivebriteId
      config.user.type = tokenDecoded.type
      config.user.email = tokenDecoded.email
      config.user.username = tokenDecoded.username
    } catch (err) {
      return res.end(JSON.stringify({ status: 403, Error: 'Invalid credentials sent!' }, null, 3))
    }
    if (!config.user.userId || config.user.userId === 0 || config.user.userId === '') {
      return res.end(JSON.stringify({ status: 403, Error: 'Invalid token sent!' }, null, 3))
    }
    next()
  }
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
server.timeout = 2400000;
