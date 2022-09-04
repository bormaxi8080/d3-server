var QueryCall = require('../../core/Utils').QueryCall;

var ServicesListHandler = function(core, next) {
    this.core = core;
    this.logger = core.logger;
    this.next = next;
};

ServicesListHandler.prototype.handle = function(task, callback) {
    var self = this;
    var dataGate = this.core.dataGate;

    this.task = task;

    QueryCall(dataGate, 'getUnusedServices', [task.post.social_network, task.post.social_id])
    .success(function(services) {
        self.reply_success(JSON.stringify(services));
        return callback(null, null);
    })
    .error(function(err) {
        self.handle_error(err, 'unused_services_error');
        return callback(err);
    });
};

ServicesListHandler.prototype.reply_success = function(body) {
    this.task.reply(200, {}, body);
    this.task.next = this.next;
};

ServicesListHandler.prototype.handle_error = function(err, msg) {
    if (err) this.logger.error('ServicesListHandler error', err);
    this.task.reply(200, {}, { error_code: msg });
};

module.exports = ServicesListHandler;
