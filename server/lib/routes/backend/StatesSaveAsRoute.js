var FastHandlerChain = require("../../core/net/FastHandlerChain");

var StatesSaveAsRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:       new handlers.BodyParser(core, "auth"),
        auth:         new handlers.AuthHandler(core, "prepare_user"),
        prepare_user: new handlers.PrepareUserHandler(core, "process", true),
        process:      new handlers.StatesSaveAsHandler(core)
    });
};

StatesSaveAsRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = StatesSaveAsRoute;
