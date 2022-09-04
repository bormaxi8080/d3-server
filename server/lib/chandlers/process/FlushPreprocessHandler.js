var JSONUtils = require("../../data/JSONUtils");

var FlushPreprocessHandler = function(core, next) {
    this.core = core;
    this.next = next;
};

FlushPreprocessHandler.prototype.handle = function(task, callback) {
    var flush = false;
    var dbCfg = this.core.config().db();
    var worldData = task.data.getWorld();

    task.flushing_values = {};

    dbCfg.flushing_props.forEach(function(prop) {
        var oldValue = null;
        try { oldValue = JSONUtils.get(worldData, prop); } catch(e) { }
        task.flushing_values[prop] = oldValue
    });

    callback(null, this.next);
};

module.exports = FlushPreprocessHandler;
