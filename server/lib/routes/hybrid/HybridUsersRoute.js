var FastHandlerChain = require("../../core/net/FastHandlerChain");

var HybridUsersRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:       new handlers.BodyParser(core, "auth"),
        auth:         new handlers.AuthorizeHandler(core, "filter"),
        filter:       new handlers.HybridOnlyHandler(core, "hybrid_users"),
        hybrid_users: new handlers.HybridUsersHandler(core)
    });
};

HybridUsersRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = HybridUsersRoute;
