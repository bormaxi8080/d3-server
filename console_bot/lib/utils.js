var Fiber  = require('fibers');
var util = require('util');

var sleep = exports.sleep = function(ms) {
    var fiber = Fiber.current;
    setTimeout(function() {
        fiber.run();
    }, ms);
    Fiber.yield();
};

var inspect = exports.inspect = function(obj, returnResult) {
    var result = JSON.stringify(obj, null, 2);
    if (returnResult)
        return result;
    console.log(result);
};

var dump = exports.dump = function() {
    var params = {
        showHidden: true,
        depth: null,
        colors: true
    };
    console.log(util.inspect(arguments, params));
};

var list = exports.list = function(val) {
    return val.split(',');
};

var measure = exports.measure = function(fn) {
    var start = Date.now();
    fn();
    return Date.now() - start;
};
