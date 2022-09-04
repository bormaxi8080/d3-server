
var util = require("util");
var EventEmitter = require("events").EventEmitter;

var EventEmitterExt = function(fct) {
    this.fct = fct
    EventEmitterExt.super_.apply(this);
};
util.inherits(EventEmitterExt, EventEmitter);

EventEmitterExt.prototype.run = function() {
    var self = this;

    // delay the function call and return the emitter
    process.nextTick(function(){
        self.fct.call(self, self)
    });

    return this
};

EventEmitterExt.prototype.success = function(fct) {
    this.on('success', fct);
    return this
};

EventEmitterExt.prototype.error = function(fct) {
    this.on('error', fct);
    return this
};

EventEmitterExt.prototype.done = function(fct) {
    this.on('error', function(err) { fct(err, null) })
        .on('success', function(result) { fct(null, result) });
    return this
};

module.exports = EventEmitterExt;