var FastHandlerChain = require("../../core/net/FastHandlerChain");

var ServicesGetTemplatesRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "auth"),
        auth:   new handlers.AuthHandler(core, "runner"),
        runner: new handlers.ServicesGetTemplatesHandler(core)
    });
};

ServicesGetTemplatesRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = ServicesGetTemplatesRoute;
