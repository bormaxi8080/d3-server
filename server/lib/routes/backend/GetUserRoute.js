var FastHandlerChain = require("../../core/net/FastHandlerChain");

var GetUserRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "process"),
        process: new handlers.GetUserHandler(core)
    });
};

GetUserRoute.prototype.createChain = function() {
    return this.chain;
}

module.exports = GetUserRoute;
