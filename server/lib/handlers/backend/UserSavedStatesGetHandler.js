var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var EventEmitterExt = require("../../core/EventEmitterExt");
var CallChainer = require("../../core/CallChainer");
var QueryCall = require("../../core/Utils").QueryCall;
var zlib = require('zlib');

UserDumpHandler = function (core, next) {
    this._core = core;
    this._next = next;
    var _task;
    var _self;
    var _logger = core.loger;

    /**
     * User Dump
     * @param task
     */
    this.handle = function (task) {
        _self = this;
        _task = task;
        var params = task.post;

        var shard = _self._core.dataGate.getShardFor(params.social_id);

        QueryCall(core.dataGate, "getUserSavesStatesGet", [shard, params.id])
            .success(function(data) {
                // ToDo было бы неплохо прикрутить гзип
                sendResult(200, {status: 'OK', data: data});
            })
            .error(function(error) {
                sendResult(500, {status: 'error', error: error});
            });
    };

    /**
     * Send result
     */
    var sendResult = function (code, body) {
        if (typeof(body) == 'object') body = JSON.stringify(body);
        _task.reply(code, {}, body);
        _self.emit('complete', null);
    };
};

Mixer.mix(UserDumpHandler.prototype, EventEmitter.prototype);

module.exports = UserDumpHandler;
