var StatesListHandler = function(core) {
    this.core = core;
};

StatesListHandler.prototype.handle = function(task, callback) {
    var self = this;
    var params = task.post;
    var user = task.user;

    var cqueries = this.core.cqueries;

    this.task = task;

    cqueries.savedStatesGetList.run(user, function(err, res) {
        if (err) {
            self.handleError(err, 'states_get_list_error');
            return callback(err, null);
        }

        if (res) {
            self.replySuccess(res);
        } else {
            self.handleError(new Error('Saved states not found.'), 'states_get_list_error');
        }
        callback(null, null);
    });
};

StatesListHandler.prototype.replySuccess = function(body) {
    this.task.reply(200, {}, body);
};

StatesListHandler.prototype.handleError = function(err, msg) {
    if (err) self.logger.error('StatesListHandler error', err);
    this.task.reply(200, {}, { error_code: msg });
};

module.exports = StatesListHandler;
