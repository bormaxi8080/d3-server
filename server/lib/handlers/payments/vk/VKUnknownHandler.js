var Mixer = require("../../../core/Mixer");
var VKHandler = require("./VKHandler");

/**
 * @constructor
 */
var VKUnknownHandler = function(core, next) {
    var _self = this;
    this._logger = core.logger;

    this.handle = function(task) {
        _self.writeError(task.response, 1);
        _self.emit('complete', null);
    };
};


Mixer.mix(VKUnknownHandler.prototype, VKHandler.prototype);

module.exports = VKUnknownHandler;