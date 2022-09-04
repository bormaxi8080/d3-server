var Mixer = require("../../core/Mixer");
var QueryCall = require("../../core/Utils.js").QueryCall;
var EventEmitter = require("events").EventEmitter;

var ServicesEditHandler = function(core) {
    var _self = this;

    this.handle = function(task) {
        try {
            var deleted = JSON.parse(task.post.deleted || "[]");
            var created = JSON.parse(task.post.created || "[]");
            var changed = JSON.parse(task.post.changed || "{}");
        }
        catch (e) {
            sendResult(task, 500, "ERROR. " + e.message)
        }

        QueryCall(core.dataGate, "saveServiceChanges", [task.post.social_network, task.post.social_id, deleted, created, changed])
            .success(function() {
                sendResult(task, 200, 'OK')
            })
            .error(function(error) {
                sendResult(task, 500, "ERROR. " + error)
            });
    };

    var sendResult = function(task, code, body) {
        task.reply(code, {}, body);
        task.next = null;
        _self.emit('complete', task);
    }
};

Mixer.mix(ServicesEditHandler.prototype, EventEmitter.prototype);
module.exports = ServicesEditHandler;
