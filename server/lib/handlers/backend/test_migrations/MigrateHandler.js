var crypto = require('crypto');

var Mixer = require("../../../core/Mixer");
var Utils = require("../../../core/Utils");
var CallChainer = require("../../../core/CallChainer");
var QueryCall = require("../../../core/Utils").QueryCall;
var EventEmitter = require("events").EventEmitter;

var MigrateHandler = function(core, next) {
    this._core = core;
    this._next = next;
    this._logger = core.logger;
};

MigrateHandler.prototype.sendResult = function(code, body) {
    this.task.reply(code, {}, JSON.stringify(body));
    this.emit('complete');
};

MigrateHandler.prototype.handle = function(task) {
    var self = this;
    this.task = task;

    var require_params = ['users'];
    var _params = this.validate_params(task.post, require_params);
    if (!_params || _params.hasOwnProperty('validate_errors')) {
        return this.sendResult(500, { status: 'error', msg : _params.validate_errors });
    }

    var dataGate = self._core.dataGate;
    var users = JSON.parse(_params.users);
    if (!Object.keys(users).length) {
        return self.sendResult(200, { status:'error', msg: 'no users passed' })
    }

    var customStream = function() {
        this.messages = [];
        this.status = 'ok';
        this.level = 0;
        this.write = function(msg){
            var obj = JSON.parse(msg);
            if (obj.level >= this.level) {
                this.level = obj.level;
                switch(this.level) {
                case 30:
                    this.status = 'ok';
                    break;
                case 40:
                    this.status = 'warn';
                    break;
                case 50:
                    this.status = 'error';
                    break;
                case 60:
                    this.status = 'fatal';
                    break;
                }
            }
            this.messages.push(obj.msg);
        }
    }

    var bunyan = require('bunyan')
    var logs = [];
    for (id in users) {
        var stream = new customStream();
        var logger = bunyan.createLogger({ name: 'test migration', stream: stream });
        var user = users[id];
        this._core.dataGate.migration.execute(user.revision, user.dump.world, user.dump.rooms, this._core.config(), _params.migration_exec, logger);
        logs.push({social_id: user.social_id, status: stream.status, messages: stream.messages})
    }
    self.sendResult(200, { status:'ok', logs: logs })
};

MigrateHandler.prototype.validate_params = function(params, require_params) {
    if (Utils.hasBlankFields(params, require_params)) {
        params.validate_errors = 'Params (' + require_params + ') cannot be blank'
        return params;
    }
    return params;
}

Mixer.mix(MigrateHandler.prototype, EventEmitter.prototype);
module.exports = MigrateHandler;
