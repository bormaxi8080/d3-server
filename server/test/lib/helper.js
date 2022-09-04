var path = require('path')
var sinon = exports.sinon = require('sinon')
var chai = require('chai');
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);
require('mocha-subject').infect();

var sandbox = exports.sandbox = null;

chai.use(sinonChai);
require('mocha-subject').infect();

module.exports.expect = require('chai').expect;
module.exports.sinon = require('sinon');

beforeEach(function() {
    exports.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    exports.sandbox.restore();
});

module.exports.init_route = function(name) {
    var file = path.join(__dirname, '../../lib/routes', name);
    var routeClass = require(file);
    var core = {};
    return new routeClass(core);
};

module.exports.init_handler = function(name) {
    var file = path.join(__dirname, '../../lib/handlers', name);
    var handler = require(file);
    var core = {};
    return new handler(core);
};

module.exports.require = function(name) {
    return require(path.join(__dirname, '../../lib', name));
};

module.exports.create_task = function() {
    return {
        post: [],
        setParams: function(post) {
                this.post = post;
        },
        response: {
            body: '',
            code: '',
            writeHead: function(code){
                    this.code = code;
            },
            end: function(body){
                    this.body = body
            }
        }
    };
};
