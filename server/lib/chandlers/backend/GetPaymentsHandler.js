var GetPaymentsHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
};

GetPaymentsHandler.prototype.handle = function(task, callback) {
    this.task = task;

    var self = this;
    var cqueries = this.core.cqueries;

    var params = task.post;
    var social_id = params.social_id;
    var payment_code = params.payment_code;

    if (social_id && payment_code) {
        cqueries.getPaymentsByCode.run(social_id, payment_code, function(err, payments) {
            if (err) {
                self.handleError(err, 'cannot_find_user_payments');
                return callback(null, null);
            }
            self.replySuccess(payments);
            callback(null, null);
        });
    }

    else if (social_id) {
        cqueries.getPaymentsByUser.run(social_id, function(err, payments) {
            if (err) {
                self.handleError(err, 'cannot_find_user_payments');
                return callback(null, null);
            }
            self.replySuccess(payments);
            callback(null, null);
        });
    }

    else {
        self.handleError(new Error('Not enough parameters'), 'params_not_set');
        callback(null, null);
    }
};

GetPaymentsHandler.prototype.replySuccess = function(msg) {
    this.task.reply(200, {}, msg);
};

GetPaymentsHandler.prototype.handleError = function(err, msg) {
    if (err) this.logger.error('GetPaymentsHandler error', err);
    this.task.reply(200, {}, { error_code: msg });
};

module.exports = GetPaymentsHandler;
