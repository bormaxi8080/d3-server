var FastHandlerChain = require("../core/net/FastHandlerChain");

var UserLoggerRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "auth", 1024 * 1024 * 1024 * 5),
        auth:   new handlers.AuthorizeHandler(core, "runner"),
        runner: new handlers.UserLoggerHandler(core)
    });
};

UserLoggerRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = UserLoggerRoute;
