var FastHandlerChain = require("../../core/net/FastHandlerChain");

var SaveStateRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:       new handlers.BodyParser(core, "auth"),
        auth:         new handlers.AuthHandler(core, "prepare_user"),
        prepare_user: new handlers.PrepareUserHandler(core, "lock", true),
        lock:         new handlers.LockUserHandler(core, true, "process", true),
        process:      new handlers.SaveStateHandler(core, "unlock"),
        unlock:       new handlers.UnlockUserHandler(core),
        error:        new handlers.ErrorReplyHandler(core, "unlock")
    });
};

SaveStateRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = SaveStateRoute;
