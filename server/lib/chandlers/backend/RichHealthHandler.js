var RichHealthHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.monitor = core.healthMonitor;
};

RichHealthHandler.prototype.handle = function(task, callback) {
    this.monitor.check(function(result) {
        task.reply(200, {}, result);
        return callback(null, this.next);
    });
};

module.exports = RichHealthHandler;
