var FastHandlerChain = require("../../core/net/FastHandlerChain");

var HealthRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "process"),
        process: new handlers.HealthHandler(core)
    });
};

HealthRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = HealthRoute;
