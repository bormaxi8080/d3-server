var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var Utils = require("../../core/Utils");

var HybridHandler = function() {
};

HybridHandler.prototype.sendResult = function(code, body, task) {
    task.reply(code, {}, JSON.stringify(body));
    this.emit("complete", task);
};

Mixer.mix(HybridHandler.prototype, EventEmitter.prototype);

module.exports = HybridHandler;
