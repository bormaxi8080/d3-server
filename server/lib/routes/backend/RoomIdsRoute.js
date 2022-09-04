var FastHandlerChain = require("../../core/net/FastHandlerChain");

var RoomIdsRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "auth"),
        auth:   new handlers.AuthHandler(core, "runner"),
        runner: new handlers.RoomIdsHandler(core)
    });
};

RoomIdsRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = RoomIdsRoute;
