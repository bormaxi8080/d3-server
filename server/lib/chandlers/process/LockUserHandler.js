var SessionData = require("../../data/SessionData");

var LockUserHandler = function(core, init, next, no_migrate) {
    this.core = core;
    this.init = init;
    this.next = next;
    this.no_migrate = no_migrate;
};

LockUserHandler.prototype.handle = function(task, callback) {
    var self = this;
    SessionData.lock(this.core, task.post.social_network, task.post.social_id, task.post.sq_session_id, this.init, this.no_migrate, function(err, data) {
        var next = (err ? "error" : self.next)
        if (err) {
            task.error = err;
        } else {
            task.data = data;
            if (task.data.getSessionID() != task.post.sq_session_id) {
                task.batch = [];
            }
        }
        callback(null, next);
    });
};

module.exports = LockUserHandler;
