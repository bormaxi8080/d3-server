var PrepareUserHandler = function(core, next, no_migrate) {
    this.core = core;
    this.logger = core.logger;
    this.next = next;
    this.no_migrate = no_migrate;
};

PrepareUserHandler.prototype.handle = function(task, callback) {
    var self = this;
    var params = task.post;
    var cqueries = this.core.cqueries;

    this.task = task;

    cqueries.getUser.run(params.social_network, params.social_id, self.no_migrate, function(err, user) {
        if (err) {
            self.handleError(err, 'query_error');
            return callback(err, null);
        }

        if (user) {
            task.user = user;
            task.current_location = {
                map_social_id: task.post['social_id'],
                current_room:  task.post['room_id'] || 0
            };
            return callback(null, self.next);
        } else {
            self.handleError("User not found", 'user_not_found');
            return callback(null, null);
        }
    });
};

PrepareUserHandler.prototype.handleError = function(err, code) {
    if (err) this.logger.error('PrepareUserHandler error:', err);
    this.task.reply(200, {}, { error_code: code });
};

module.exports = PrepareUserHandler;
