var FetchDataHandler = function(core, next) {
    this.core = core;
    this.next = next;
};

FetchDataHandler.prototype.handle = function(task, callback) {
    var self = this;
    var sessionData = task.data;
    var current_location = task.current_location;
    task.error = null;
    sessionData.fetch(current_location.map_social_id, current_location.current_room)
    .success(function(result){
        callback(null, self.next);
    })
    .error(function(error){
        task.error = error;
        callback(null, "error");
    });
};

module.exports = FetchDataHandler;
