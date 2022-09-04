var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var DeleteUserHandler = function(core, next)
{
    this._core = core;
    var _self = this;
    var _next = next;

    var _task;
    var _params;
    var _user;

    this.handle = function(task) {
        _task   = task;
        _params = _task.post;
        _user   = _task.user;
        sessionData = _task.data;

        _query = this._core.dataGate.getQuery('deleteUser');
        _query.addListener('complete', onCompleteDeleteUser);
        _query.addListener('error', onErrorDeleteUser);
        _query.run(_user);
    }

    var onCompleteDeleteUser = function() {
        _query.removeListener('complete', onCompleteDeleteUser);
        _query.removeListener('error', onErrorDeleteUser);

        _task.next = _next;

        _self.emit('complete', _task);
    }

    var onErrorDeleteUser = function() {
        _query.removeListener('complete', onCompleteDeleteUser);
        _query.removeListener('error', onErrorDeleteUser);

        sendResult (500, "ERROR. Query error: " + _query.error);
    }

    var sendResult = function(code, body) {
        _task.reply(code, {} , body);
        _task.next = next;
        _self.emit('complete', _task);
    }
};

Mixer.mix(DeleteUserHandler.prototype, EventEmitter.prototype);
module.exports = DeleteUserHandler;
