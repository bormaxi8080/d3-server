var UnlockUserHandler = function(core, next) {
    this.next = next;
};

UnlockUserHandler.prototype.handle = function(task, callback) {
    var self = this;
    var sessionData = task.data;
    task.error = null;

    if (!sessionData) {
        return callback(null, task.next);
    }

    sessionData.unlock()
    .success(function(result){
        return callback(null, self.next);
    })
    .error(function(error){
        return callback(null, null);
    });
};

module.exports = UnlockUserHandler;
