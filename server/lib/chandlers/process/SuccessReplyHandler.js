var crypto = require("crypto");

var SuccessReplyHandler = function(core, send_world, sendRandomSeed, next) {
    this.core = core;
    this.send_world = send_world;
    this.sendRandomSeed = sendRandomSeed;
    this.next = next;
};

SuccessReplyHandler.prototype.handle = function(task, callback) {
    var world = task.data.getWorld();
    var session_id = task.data.getSessionID();

    var res = {
        options: {
            "sq_session_id": session_id,
            "server_time": Date.now()
        },
        "gamedata": (this.send_world ? world : 'OK'),
        "services": task.data.getUnusedServices()
    };

    if (this.sendRandomSeed) {
        res.options.random_seed = world.options.random_seed;
    }

    task.reply(200, {}, res);
    callback(null, this.next);
};

module.exports = SuccessReplyHandler;
