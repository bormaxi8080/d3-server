/**
 * Проставим флаг, что у нас init запрос
 */

var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var InitFlagHandler = function(core, next) {
    this._core = core;
    this._next = next;
};

InitFlagHandler.prototype.handle = function(task) {

    task.is_init_request = true;

    task.next = this._next;
    this.emit("complete", task);
};

Mixer.mix(InitFlagHandler.prototype, EventEmitter.prototype);

module.exports = InitFlagHandler;
