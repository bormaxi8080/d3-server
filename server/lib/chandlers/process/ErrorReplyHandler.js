var ErrorReplyHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
};

ErrorReplyHandler.prototype.handle = function(task, callback) {
    var status = 410;
    var error = "error";
    if (task.error instanceof Object && task.error.error_code) {
        status = 200;
        error = JSON.stringify(task.error);
    }
    this.logger.error("Error Reply: " + JSON.stringify(task.error));
    task.reply(status, {"Content-Type":"text/html"}, error)
    callback(null, this.next)
};

module.exports = ErrorReplyHandler;
