var FastHandlerChain = require("../../core/net/FastHandlerChain");

var HybridIDGetRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:        new handlers.BodyParser(core, "auth"),
        auth:          new handlers.HybridAuthorizeHandler(core, "hybrid_id_get"),
        hybrid_id_get: new handlers.HybridIDGetHandler(core)
    });
};

HybridIDGetRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = HybridIDGetRoute;
