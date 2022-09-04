/**
 * @constructor
 */
module.exports = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    /**
     * Список
     */
    this.run = function(user) {
        _models.UserLog
            .using_shard(user.shard)
            .findAll({where: {user_id: user.id}, order: 'createdAt desc'})
            .success(function(res) {
                _self.result = [];

                for (var i in res) {
                    var row = res[i];

                    _self.result.push({
                        at_created: row.createdAt,
                        data: row.data, //.replace(/\\\\/g, '\\'),//JSON.parse(row.data.replace(/\\\\/g, '\\'))
                        id: row.id,
                        reason: row.reason,
                        updated_at: row.updatedAt
                    });
                }
                _self.emit('complete');
            })
            .error(onDBError);
    };

    var onDBError = function(error) {
        onError('DB error: ' + error);
    };

    var onError = function(error) {
        _self.error = error;
        _self.emit("error");
    }
};
