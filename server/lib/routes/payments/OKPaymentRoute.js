var FastHandlerChain = require("../../core/net/FastHandlerChain");

var OKPaymentRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("auth", {
        auth:      new handlers.OKPaymentAuthHandler(core, "okPayment"),
        okPayment: new handlers.OKPaymentProcessorHandler(core)
    });
};

OKPaymentRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = OKPaymentRoute;
