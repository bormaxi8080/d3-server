var QueryCall = require("../../core/Utils").QueryCall;
var async = require('async');

var StatesSaveAsHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
};

StatesSaveAsHandler.prototype.handle = function(task, callback) {
    var self = this;

    this.task = task;

    var user = task.user;
    var params = task.post;
    var cqueries = this.core.cqueries;
    var dataGate = this.core.dataGate;
    var connection = null;

    var stack = [];

    stack.push(function(fn) {
        dataGate.begin(user.shard).success(function(conn) {
            connection = conn;
            fn(null);
        }).error(fn);
    });

    stack.push(function(fn) {
        cqueries.lockUserTransaction.run(user, connection, function(err, lock) {
            fn(err, lock);
        });
    });

    stack.push(function(lock, fn) {
        QueryCall(dataGate, "stateGet", [user, connection])
        .success(function(data) {
            fn(null, data);
        }).error(fn);
    });

    stack.push(function(data, fn) {
        QueryCall(dataGate, "savedStatesSet", [user, params.comment, data, connection])
        .success(function() {
            fn(null);
        }).error(fn);
    });

    stack.push(function(fn) {
        connection.commit().success(function() {
            fn(null);
        }).error(fn);
    });

    async.waterfall(stack, function(err) {
        if (err) {
            connection.rollback();

            self.handleError(err, 'cannot_save_state');
            return callback(err, null);
        }

        self.replySuccess('OK');
        callback(null, null);
    });
};

StatesSaveAsHandler.prototype.replySuccess = function(body) {
    this.task.next = this.next;
    this.task.reply(200, {}, body);
};

StatesSaveAsHandler.prototype.handleError = function(err, message) {
    if (err) this.logger.error('StatesSaveAsHandler error', err);
    this.task.reply(200, {}, { error_code: message });
};

module.exports = StatesSaveAsHandler;
