var FastHandlerChain = require("../../core/net/FastHandlerChain");

var ServerLogsRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "process"),
        process: new handlers.ServerLogsHandler(core)
    });
};

ServerLogsRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = ServerLogsRoute;
