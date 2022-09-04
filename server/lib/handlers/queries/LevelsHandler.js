var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var QueryCall = require("../../core/Utils").QueryCall;

var LevelsHandler = function(core) {
    this.core = core;
}

LevelsHandler.prototype.handle = function(task) {
    var self = this;
    var hybrids;
    try {
        hybrids = JSON.parse(task.post['hybrids']);
    } catch (e) {
        hybrids = null;
    }

    if (hybrids) {
        QueryCall(this.core.dataGate, 'levelsGetQuery', [hybrids]).success(function(res) {
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

Mixer.mix(LevelsHandler.prototype, EventEmitter.prototype);
module.exports = LevelsHandler;
