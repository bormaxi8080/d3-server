var FastHandlerChain = require("../../core/net/FastHandlerChain");

var MMPaymentRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("auth", {
        auth:      new handlers.MMPaymentAuthHandler(core, "mmPayment"),
        mmPayment: new handlers.MMPaymentProcessorHandler(core)
    });
};

MMPaymentRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = MMPaymentRoute;
