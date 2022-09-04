var ProcessPrepareHandler = function(core, next) {
    this.core = core
    this.next = next;
};

ProcessPrepareHandler.prototype.handle = function(task, callback) {
    try {
        var gamedata = JSON.parse(task.post.gamedata);
        task.batch = gamedata.batch || [];
        task.version = gamedata.version || this.core.version.server;
    } catch(error) {
        task.error = 'failed to parse input gamedata: ' + error;
        return callback(null, "error")
    }

    if (task.version !== this.core.version.server) {
        task.error = { error_code: "version_mismatch" };
        return callback(null, "error")
    }

    var current_location = {
        map_social_id: task.post.social_id,
        current_room: task.post.room_id || 0
    }

    task.current_location = current_location;
    task.cmd_params = gamedata;
    return callback(null, this.next);
};

module.exports = ProcessPrepareHandler;
