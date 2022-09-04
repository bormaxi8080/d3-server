var FastHandlerChain = require("../../core/net/FastHandlerChain");

var GetPaymentsRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "process"),
        process: new handlers.GetPaymentsHandler(core)
    });
};

GetPaymentsRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = GetPaymentsRoute;
