var ChangeLogAddQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(user, changes, conn) {
        conn = conn || {};
        _models.ChangeLog
            .using_shard(user.shard)
            .create({
                user_id: user.id,
                data: JSON.stringify(changes)
            }, null, {ts_id: conn.id})
            .success(function(res) {
                _self.emit('complete');
            })
            .error(function(e) {
                _self.error = 'Ошибка сохранения логов сессии: ' + e;
                _self.emit('error');
            })
    };
};

module.exports = ChangeLogAddQuery;