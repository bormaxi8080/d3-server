var FastHandlerChain = require("../../../core/net/FastHandlerChain");

var MigrateRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "auth"),
        auth:    new handlers.AuthHandler(core, 'process'),
        process: new handlers.MigrateHandler(core)
    });
};

MigrateRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = MigrateRoute;
