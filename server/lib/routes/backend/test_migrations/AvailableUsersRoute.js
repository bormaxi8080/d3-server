var FastHandlerChain = require("../../../core/net/FastHandlerChain");

var AvailableUsersRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "auth"),
        auth:    new handlers.AuthHandler(core, "process"),
        process: new handlers.AvailableUsersHandler(core)
    });
};

AvailableUsersRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = AvailableUsersRoute;
