var HealthHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.monitor = core.healthMonitor;
};

HealthHandler.prototype.handle = function(task, callback) {
    this.monitor.check(function(result) {
        task.reply(200, {}, (result.errors.length ? 'FAIL' : 'OK'));
        return callback(null, this.next);
    });
};

module.exports = HealthHandler;
