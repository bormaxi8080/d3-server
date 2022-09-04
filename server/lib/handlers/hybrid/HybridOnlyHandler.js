var Mixer = require("../../core/Mixer");
var HybridHandler = require("./HybridHandler");
var Utils = require("../../core/Utils");

var HybridOnlyHandler = function(core, next) {
    this._core = core;
    this._next = next;
};

HybridOnlyHandler.prototype.handle = function(task) {
    var self = this;

    var netCfg = self._core.config().app().networks_map.hybrid;

    if (task.post.social_network != netCfg.id) {
        task.next = null;
        return self.sendResult(500, {error: "invalid network"}, task);
    }

    task.next = this._next;
    self.emit("complete", task);
};

Mixer.mix(HybridOnlyHandler.prototype, HybridHandler.prototype);

module.exports = HybridOnlyHandler;
