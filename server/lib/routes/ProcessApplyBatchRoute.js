var FastHandlerChain = require("../core/net/FastHandlerChain");

var ProcessApplyBatchRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("parser", {
        parser:      new handlers.BodyParser(core, "auth"),
        auth:        new handlers.AuthorizeHandler(core, "prep"),
        prep:        new handlers.ProcessPrepareHandler(core, "lock"),
        lock:        new handlers.LockUserHandler(core, false, "fetch"),
        fetch:       new handlers.FetchDataHandler(core, "preprocess"),
        preprocess:  new handlers.FlushPreprocessHandler(core, "runner"),
        runner:      new handlers.ProcessHandler(core, "postprocess"),
        postprocess: new handlers.FlushPostprocessHandler(core, "store"),
        store:       new handlers.SaveChangesHandler(core, "reply"),
        reply:       new handlers.SuccessReplyHandler(core, false, false, "unlock"),
        error:       new handlers.ErrorReplyHandler(core, "unlock"),
        unlock:      new handlers.UnlockUserHandler(core)
    });
};

ProcessApplyBatchRoute.prototype.createChain = function() {
    return this.chain;
}

module.exports = ProcessApplyBatchRoute