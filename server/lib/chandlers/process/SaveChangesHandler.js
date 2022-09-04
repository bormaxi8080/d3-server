var SaveChangesHandler = function(core, next) {
    this.core = core;
    this.next = next;
};

SaveChangesHandler.prototype.handle = function(task, callback) {
    var self = this;
    var sessionData = task.data;
    sessionData.store()
    .success(function(result){
        return callback(null, self.next)
    })
    .error(function(error){
        task.error = error;
        return callback(null, "error")
    });
};

module.exports = SaveChangesHandler;
