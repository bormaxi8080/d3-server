/**
 * @constructor
 */

var JSONUtils = require('../../data/JSONUtils');

var savedStatesGet = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    /**
     */
    this.run = function(user, id, conn) {
        conn = conn || {};
        _models.SavedStates
            .using_shard(user.shard)
            .find({where: {user_id: user.id, id: id}}, {ts_id: conn.id})
            .success(function(row) {
                if (row) {
                    JSONUtils.unpack(row.data, function(error, data) {
                        _self.result = data;
                        _self.emit('complete');
                    });
                }
                else {
                    _self.result = null;
                    _self.emit('complete');
                }
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

module.exports = savedStatesGet;
