var FastHandlerChain = require("../core/net/FastHandlerChain");

var SetTokenRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "auth"),
        auth:   new handlers.AuthorizeHandler(core, "runner"),
        runner: new handlers.SetTokenHandler(core)
    });
};

SetTokenRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = SetTokenRoute;
