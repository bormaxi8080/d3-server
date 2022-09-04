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

    this.run = function(shard_id, id) {
        _models.UserLog
            .using_shard(shard_id)
            .find({where: {id: id}})
            .success(function(res) {
                if (res) {
                    _self.result = QueryUtils.flatRow(res);
                    _self.result.shard_id = shard_id;
                    _self.result.full_id = QueryUtils.combineFullId(shard_id, id);
                }
                else {
                    _self.result = {};
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
