var JSONUtils = require("../../data/JSONUtils");

var FlushPostprocessHandler = function(core, next) {
    this.core = core;
    this.next = next;
};

FlushPostprocessHandler.prototype.checkChangeLimit = function(max_changes, data) {
    if (!max_changes)
        return false;
    var numChanges = data.getNumChanges();
    return numChanges >= max_changes;
};

FlushPostprocessHandler.prototype.checkPropChanges = function(props, data, oldValues) {
    var worldData = data.getWorld();
    return props.some(function(prop) {
        var newValue = null;
        try { newValue = JSONUtils.get(worldData, prop); } catch(e) {}
        return (newValue != oldValues[prop]);
    });
};

FlushPostprocessHandler.prototype.handle = function(task, callback) {
    var self = this;
    var dbCfg = this.core.config().db();
    var flush = false;
    flush = flush || this.checkChangeLimit(dbCfg.max_changes, task.data);
    flush = flush || this.checkPropChanges(dbCfg.flushing_props, task.data, task.flushing_values);

    if (!flush) {
        return callback(null, self.next);
    }

    task.data.flush(task.current_location.map_social_id, task.current_location.current_room)
    .success(function() {
        callback(null, self.next);
    })
    .error(function(error) {
        task.error = error;
        callback(null, "error");
    });
};

module.exports = FlushPostprocessHandler;
