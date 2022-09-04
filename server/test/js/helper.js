// Test helper uses eval magic to deal with compiled js environment.
// Please always require it using local var named 'helper':
//     var helper = require('path/to/helper');
// Method #initContextCode uses this name for proper context evaluation.
// After including use following code to load context:
//     eval(helper.initContextCode());
// Use method #setContextWorld to init storage data.
// All variables from all.js are available in global scope (context, Executor, etc.)

var sinon = exports.sinon = require('sinon')

var chai = require('chai'); chai.should();
exports.expect = chai.expect;
chai.use(require("sinon-chai"));
require('mocha-subject').infect();
var sandbox = exports.sandbox = null;

var fs = require('fs');
var path = require('path');
var ROOT_PATH = exports.ROOT_PATH = fs.realpathSync(path.join(__dirname, '/../../../'));
var LIB_PATH = exports.LIB_PATH = path.join(ROOT_PATH, 'server/lib/')

var createContextPath = path.join(ROOT_PATH, 'server/tmp/test/js/all.js');
var cfgPath = path.join(ROOT_PATH, 'server/config', (process.env.NODE_ENV || 'development'));

exports.initWorld = JSON.parse(fs.readFileSync(path.join(cfgPath, 'init_world.json'), 'utf8'));

exports.Environment = require(path.join(LIB_PATH, "core/process/Environment"));
exports.contextCode = fs.readFileSync(createContextPath, 'utf8');

exports.setContextWorld = function(context, world) {
    context.storage.commit();
    context.storage.setDump(JSON.parse(JSON.stringify(world)));
}

exports.initContextCode = function() {
    return "var fs = require('fs');\n" +
    "eval(helper.contextCode);\n" +
    "var context = createContext(new helper.Environment());\n"
}

beforeEach(function() {
    exports.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    exports.sandbox.restore();
});