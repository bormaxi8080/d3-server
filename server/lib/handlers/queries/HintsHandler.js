var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var QueryCall = require("../../core/Utils").QueryCall;

var HintsHandler = function(core) {
    this.core = core;
}

HintsHandler.prototype.handle = function(task) {
    var self = this;
    var hybrids;
    try {
        hybrids = JSON.parse(task.post['hybrids']);
    } catch (e) {
        hybrids = null;
    }

    if (hybrids) {
        QueryCall(this.core.dataGate, 'hintsGetQuery', [hybrids]).success(function(res) {
            task.response.end(JSON.stringify(res));
            self.emit('complete');
        }).error(function(error) {
            emitter.emit('error', error);
        });
    } else {
        task.response.end('{}');
        self.emit('complete');

    }
};

Mixer.mix(HintsHandler.prototype, EventEmitter.prototype);
module.exports = HintsHandler;
