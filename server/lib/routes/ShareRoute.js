var FastHandlerChain = require("../core/net/FastHandlerChain");

var ShareRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "share"),
        share:  new handlers.ShareHandler(core)
    });
};

ShareRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = ShareRoute;
