var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var MigrationsHandler = function(core, next) {
    this._core = core;
    this._next = next;
    var _task;
    var _self;

    /**
     * Migration list
     * @param task
     */
    this.handle = function(task) {
        _task = task;
        _self = this;
        var _result;

        _result = this._core.dataGate.migration.getMigrations();

        if (_result.errors && _result.errors.length > 0) {
            sendResult(500, JSON.stringify(_result));
        } else {
            sendResult(200, JSON.stringify(_result));
        }
    };

    /**
     * Отправляем результат
     */
    var sendResult = function(code, body) {
        _task.reply(code, {}, body);
        _self.emit('complete', null);
    };
};

Mixer.mix(MigrationsHandler.prototype, EventEmitter.prototype);

module.exports = MigrationsHandler;
