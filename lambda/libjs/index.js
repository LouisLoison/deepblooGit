process.env.NODE_PATH = process.env.NODE_PATH + "/mnt/efs/lib/nodejs";
require("module").Module._initPaths(); // This re-initalizes the module loader to use the new NODE_PATH.

const esmRequire = require('esm')(module);
const BddTool = require('./db/BddTool')
const textparse = require('./textparse')
const tenderimport = require('./tenderimport')
const cpv = require('./cpv')
const tenderformat = require('./tenderformat')
const appsearch = require('./appsearch')
const elastic = require('./elastic')
const document = require('./document')
const hivebrite = require('./hivebrite')
const { AWS, documentsBucket } = require('./config')

module.exports = {
  ...esmRequire('./main.js'),
  BddTool,
  textparse,
  tenderimport,
  cpv,
  tenderformat,
  appsearch,
  document,
  elastic,
  hivebrite,
  AWS,
  documentsBucket,
}