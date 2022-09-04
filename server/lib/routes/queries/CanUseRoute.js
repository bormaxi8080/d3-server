var FastHandlerChain = require("../../core/net/FastHandlerChain");

var CanUseRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "runner"),
        runner: new handlers.CanUseHandler(core)
    });
};

CanUseRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = CanUseRoute;
