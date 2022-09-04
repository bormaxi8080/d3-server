var FastHandlerChain = require("../../core/net/FastHandlerChain");

var LevelsRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "runner"),
        runner: new handlers.LevelsHandler(core)
    });
};

LevelsRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = LevelsRoute;
