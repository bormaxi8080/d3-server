var FastHandlerChain = require("../../core/net/FastHandlerChain");

var ResetUserRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:       new handlers.BodyParser(core, "prepare_user"),
        auth:         new handlers.AuthHandler(core, "prepare_user"),
        prepare_user: new handlers.PrepareUserHandler(core, "lock", true),
        lock:         new handlers.LockUserHandler(core, true, "fetch", true),
        fetch:        new handlers.FetchDataHandler(core, "process"),
        process:      new handlers.ResetUserHandler(core, "unlock"),
        error:        new handlers.ErrorReplyHandler(core, "unlock"),
        unlock:       new handlers.UnlockUserHandler(core)
    });
};

ResetUserRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = ResetUserRoute;
