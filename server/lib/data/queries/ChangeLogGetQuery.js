var ChangeLogGetQuery = function(mgr) {
    var self = this;
    var models = mgr.models;

    this.manager = mgr;
    this.result = null;
    this.error = null;

    this.run = function(user, conn) {
        conn = conn || {};
        self.result = [];

        models.ChangeLog
        .using_shard(user.shard)
        .findAll(
            { where: { user_id: user.id }, order: 'id asc', for: "SHARE" },
            { ts_id: conn.id }
        )
        .success(function(logs) {
            for (var l in logs) {
                self.result = self.result.concat(JSON.parse(logs[l].data));
            }
            self.emit('complete');
        })
        .error(function(e) {
            self.error = 'Ошибка получения логов сессии: ' + e;
            self.emit('error');
        });
    };
};

module.exports = ChangeLogGetQuery;
