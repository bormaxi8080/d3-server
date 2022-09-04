/**
 */

var Mixer = require("../../core/Mixer");
var HybridHandler = require("./HybridHandler");
var QueryCall = require("../../core/Utils").QueryCall;
var hybridValidate = require("./HybridValidator");
var Utils = require("../../core/Utils");

var HybridAuthorizeHandler = function(core, next) {
    this._core = core;
    this._next = next;
    this._logger = core.logger;
};

HybridAuthorizeHandler.prototype.handle = function(task) {
    var self = this;
    task.next = null;

    if (!Utils.hasFields(task.post, ["link_code", "link_id", "link_key"]))
        return self.sendResult(200, {error_code: "auth_failed"}, task);

    var netCfg = self._core.config().app().networks_map.hybrid;

    hybridValidate(task.post.link_code, task.post.link_id, task.post.link_key, netCfg)
        .success(function(res) {
            if (!res)
                return self.sendResult(200, {error_code: "auth_failed"}, task);
            task.next = self._next;
            self.emit("complete", task);
        })
        .error(function(error) {
            self._logger.error(error);
            self.sendResult(200, {error_code: "auth_failed"}, task);
        })
};

Mixer.mix(HybridAuthorizeHandler.prototype, HybridHandler.prototype);

module.exports = HybridAuthorizeHandler;
