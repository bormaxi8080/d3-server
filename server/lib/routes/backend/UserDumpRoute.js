var FastHandlerChain = require("../../core/net/FastHandlerChain");

var UserDumpRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "auth"),
        auth:    new handlers.AuthHandler(core, "process"),
        process: new handlers.UserDumpHandler(core)
    });
};

UserDumpRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = UserDumpRoute;
