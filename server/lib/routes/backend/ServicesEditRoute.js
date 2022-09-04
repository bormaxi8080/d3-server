var FastHandlerChain = require("../../core/net/FastHandlerChain");

var ServicesEditRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "auth"),
        auth:   new handlers.AuthHandler(core, "runner"),
        runner: new handlers.ServicesEditHandler(core)
    });
};

ServicesEditRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = ServicesEditRoute;
