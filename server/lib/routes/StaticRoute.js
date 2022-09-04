var fs = require('fs');
var FastHandlerChain = require("../core/net/FastHandlerChain");

var StaticRoute = function(core) {
    var handlers = core.handlerFactory.list();
    var path = fs.realpathSync(core.config().app().static_dir);
    var staticCache = {}
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "static"),
        static: new handlers.StaticHandler(core, path, staticCache)
    });
};

StaticRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = StaticRoute;
