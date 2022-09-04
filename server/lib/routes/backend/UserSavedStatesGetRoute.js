var FastHandlerChain = require("../../core/net/FastHandlerChain");

var UserSavedStatesGetRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "auth"),
        auth:    new handlers.AuthHandler(core, "process"),
        process: new handlers.UserSavedStatesGetHandler(core)
    });
};

UserSavedStatesGetRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = UserSavedStatesGetRoute;
