var Mixer = require("../../core/Mixer");
var QueryCall = require("../../core/Utils.js").QueryCall;
var EventEmitter = require("events").EventEmitter;

var RoomIdsHandler = function(core, next) {
    var _self = this;

    this.handle = function(task) {
        QueryCall(core.dataGate, 'getRoomIds', [task.post.social_network, task.post.social_id])
            .success(function(data) {
                sendResult(task, 200, JSON.stringify(data))
            })
            .error(function(error) {
                sendResult(task, 500, "ERROR. " + error)
            });
    };

    var sendResult = function(task, code, body) {
        task.reply(code, {}, body);
        task.next = next;
        _self.emit('complete', task);
    }
};

Mixer.mix(RoomIdsHandler.prototype, EventEmitter.prototype);
module.exports = RoomIdsHandler;
