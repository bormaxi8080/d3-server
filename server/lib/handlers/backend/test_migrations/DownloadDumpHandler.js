var crypto = require('crypto');

var Mixer = require("../../../core/Mixer");
var Utils = require("../../../core/Utils");
var CallChainer = require("../../../core/CallChainer");
var QueryCall = require("../../../core/Utils").QueryCall;
var EventEmitter = require("events").EventEmitter;

var DownloadDumpHandler = function(core, next) {
    this._core = core;
    this._next = next;
    this._logger = core.logger;
};

DownloadDumpHandler.prototype.sendResult = function(code, body) {
    this.task.reply(code, {}, JSON.stringify(body));
    this.emit('complete', 'error');
};

DownloadDumpHandler.prototype.handle = function(task) {
    var self = this;
    this.task = task;

    var require_params = ['users'];
    var _params = this.validate_params(task.post, require_params);
    if (!_params || _params.hasOwnProperty('validate_errors')) {
        this.sendResult(500, {status: 'error', msg : _params.validate_errors});
        return false;
    }

    var dataGate = self._core.dataGate;
    var users = JSON.parse(_params.users)
    var users_length = Object.keys(users).length
    if (users_length <= 0) {
        self.sendResult(500, {status:'error', msg: 'users not found'})
        return false;
    }

    var addQuery = function(user) {
        QueryCall(dataGate, "stateGet", [user])
            .success(function(data) {
                user.dump = data;
                users_length--;
                if (users_length == 0){
                    self.sendResult(200, {status:'ok', users: users})
                }
            })
            .error(function(error){
                users_length--;
                self._logger.error(error)
            });
    }

    for (var id in users) {
        var user = users[id];
        addQuery(user)
    }
};

DownloadDumpHandler.prototype.validate_params = function(params, require_params) {
    if (Utils.hasBlankFields(params, require_params)) {
        params.validate_errors = 'Params (' + require_params + ') cannot be blank'
        return params;
    }
    return params;
}


Mixer.mix(DownloadDumpHandler.prototype, EventEmitter.prototype);
module.exports = DownloadDumpHandler;
