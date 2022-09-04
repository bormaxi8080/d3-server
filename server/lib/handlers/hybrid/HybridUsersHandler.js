/**
 */

var Mixer = require("../../core/Mixer");
var HybridHandler = require("./HybridHandler");
var QueryCall = require("../../core/Utils").QueryCall;

var HybridUsersHandler = function(core, next) {
    this._core = core;
    this._next = next;
};

HybridUsersHandler.prototype.handle = function(task) {
    var self = this;
    task.next = null;

    var netCfg = self._core.config().app().networks_map.hybrid;

    try {
        var users = JSON.parse(task.post.params);
    }
    catch (e) {
        self.sendResult(500, {error_code: "bad_params"}, task);
        return;
    }

    for (var code in users) {
        if (!netCfg.accounts.hasOwnProperty(code)) {
            self.sendResult(500, {error: "invalid account"}, task);
            return;
        }
    }

    QueryCall(self._core.dataGate, "getHybridUsers", [users])
        .success(function(result) {
            this._next = self._next;
            self.sendResult(200, result, task);
        })
        .error(function(error) {
            self.sendResult(500, {error_code: "query failed"}, task);
        });
};

Mixer.mix(HybridUsersHandler.prototype, HybridHandler.prototype);

module.exports = HybridUsersHandler;
