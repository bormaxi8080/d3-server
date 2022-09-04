var FastHandlerChain = require("../../core/net/FastHandlerChain");

var RichHealthRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "process"),
        process: new handlers.RichHealthHandler(core)
    });
};

RichHealthRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = RichHealthRoute;
