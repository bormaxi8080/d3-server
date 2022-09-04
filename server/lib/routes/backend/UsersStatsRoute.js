var HandlerChain = require("../../core/net/HandlerChain");

var UsersStatsHandler = require("../../handlers/backend/UsersStatsHandler");

var UsersStatsRoute = function(core) {
    this._core = core;
};

UsersStatsRoute.prototype.createChain = function() {
    var chain = new HandlerChain();
    chain.setStartHandler("process", new UsersStatsHandler(this._core));
    return chain;
};

module.exports = UsersStatsRoute;
