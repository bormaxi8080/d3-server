var FastHandlerChain = require("../../core/net/FastHandlerChain");

var AppStorePaymentRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "auth"),
        auth:    new handlers.AuthorizeHandler(core, "payment"),
        payment: new handlers.PaymentProcessorHandler(core)
    });
};

AppStorePaymentRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = AppStorePaymentRoute;
