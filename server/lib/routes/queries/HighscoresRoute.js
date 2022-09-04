var FastHandlerChain = require("../../core/net/FastHandlerChain");

var HighscoresRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "runner"),
        runner: new handlers.HighscoresHandler(core)
    });
};

HighscoresRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = HighscoresRoute;
