/**
 * @constructor
 */
var QueryUtils = require('./../QueryUtils');

module.exports = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(shard, user_id) {
        _models.SavedStates
            .using_shard(shard)
            .findAll({attributes: ['id', 'comment', 'user_id', ["'" + shard + "'", 'shard']], where: {user_id: user_id}}, {order: '"createdAt" desc'}, { raw: true })
            .success(function(res) {
                if (res) {
                    _self.result = res;
                } else {
                    _self.result = [];
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
