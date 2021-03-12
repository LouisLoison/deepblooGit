// Please copy config/config.* files to this folder
//
var env = process.env.NODE_ENV || 'development'
, cfg = require('./config.'+env);

module.exports = cfg;
