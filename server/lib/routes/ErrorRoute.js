var FastHandlerChain = require("../core/net/FastHandlerChain");

var ErrorRoute = function(core) {
    var handlers = core.handlerFactory.list();
    this.core = core;
    this.chain = new FastHandlerChain("error", {
        error: {
            handle: function(task, callback) {
                var response = task.response;
                var text = "No handler found for " + task.request.url + "!";
                task.reply(404, {"Content-Type": "text/html"}, text);
                core.logger.warn(text);
                callback(null, null);
            }
        }
    });
};

ErrorRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = ErrorRoute;
