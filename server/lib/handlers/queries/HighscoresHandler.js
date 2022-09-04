var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var QueryCall = require("../../core/Utils").QueryCall;

var HighscoresHandler = function(core) {
    this.core = core;
}

HighscoresHandler.prototype.handle = function(task) {
    var self = this;
    var hybrids;
    try {
        hybrids = JSON.parse(task.post['hybrids']);
    } catch (e) {
        hybrids = [];
    }

    QueryCall(this.core.dataGate, 'highscoresGetQuery', [hybrids]).success(function(res) {
        task.response.end(JSON.stringify(res));
        self.emit('complete');
    }).error(function(error) {
        emitter.emit('error', error);
    });
};

Mixer.mix(HighscoresHandler.prototype, EventEmitter.prototype);
module.exports = HighscoresHandler;
