process.env.NODE_PATH = process.env.NODE_PATH + "/mnt/efs/lib/nodejs";
require("module").Module._initPaths(); // This re-initalizes the module loader to use the new NODE_PATH.

