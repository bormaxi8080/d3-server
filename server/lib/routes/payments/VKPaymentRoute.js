var FastHandlerChain = require("../../core/net/FastHandlerChain");

var VKPaymentRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("body", {
        body:                new handlers.BodyParser(core, "auth"),
        auth:                new handlers.VKPaymentAuthHandler(core, "get_item"),
        get_item:            new handlers.VKGetItemHandler(core, "order_status_change"),
        order_status_change: new handlers.VKPaymentProcessorHandler(core, "error"),
        error:               new handlers.VKUnknownHandler(core)
    });
};

VKPaymentRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = VKPaymentRoute;
