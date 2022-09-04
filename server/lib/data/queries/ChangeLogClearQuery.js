var clearChangeLog = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(user, conn) {
        conn = conn || {};
        _models.ChangeLog
            .using_shard(user.shard)
            .delete({where: {user_id: user.id}, limit: "ALL"}, {ts_id: conn.id})
            .success(function() {
                _self.emit('complete');
            })
            .error(onDBError);
    };
    var onDBError = function(error) {
        _self.error = 'DB error: ' + error;
        _self.emit("error");
    }
};

module.exports = clearChangeLog;