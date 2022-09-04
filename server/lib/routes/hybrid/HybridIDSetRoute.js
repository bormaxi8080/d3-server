var FastHandlerChain = require("../../core/net/FastHandlerChain");

var HybridIDSetRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:    new handlers.BodyParser(core, "auth"),
        auth:      new handlers.AuthorizeHandler(core, "filter"),
        filter:    new handlers.HybridOnlyHandler(core, "hybrid_id"),
        hybrid_id: new handlers.HybridIDSetHandler(core, false)
    });
};

HybridIDSetRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = HybridIDSetRoute;
