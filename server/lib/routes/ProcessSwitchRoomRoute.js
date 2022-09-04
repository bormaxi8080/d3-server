var FastHandlerChain = require("../core/net/FastHandlerChain");

var ProcessSwitchRoomRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:  new handlers.BodyParser(core, "auth"),
        auth:    new handlers.AuthorizeHandler(core, "prep"),
        prep:    new handlers.ProcessPrepareHandler(core, "lock"),
        lock:    new handlers.LockUserHandler(core, false, "fetch"),
        fetch:   new handlers.FetchDataHandler(core, "runner"),
        runner:  new handlers.ProcessHandler(core, "command", true),
        command: new handlers.SwitchRoomHandler(core, "store"),
        store:   new handlers.SaveChangesHandler(core, "reply"),
        reply:   new handlers.SuccessReplyHandler(core, true, false, "unlock"),
        error:   new handlers.ErrorReplyHandler(core, "unlock"),
        unlock:  new handlers.UnlockUserHandler(core)
    });
};

ProcessSwitchRoomRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = ProcessSwitchRoomRoute;
