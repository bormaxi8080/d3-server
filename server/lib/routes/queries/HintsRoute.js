var FastHandlerChain = require("../../core/net/FastHandlerChain");

var HintsRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "runner"),
        runner: new handlers.HintsHandler(core)
    });
};

HintsRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = HintsRoute;
