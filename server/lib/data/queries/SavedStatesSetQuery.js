/**
 * @constructor
 */
var JSONUtils = require('../../data/JSONUtils');

var savedStatesSet = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    /**
     */
    this.run = function(user, comment, data, conn) {
        conn = conn || {};
        JSONUtils.pack(data, function(error, data) {
            if (error)
                return onError(error);
            _models.SavedStates
                .using_shard(user.shard)
                .find({where: {user_id: user.id, comment: comment}}, {ts_id: conn.id})
                .success(function(state) {
                    if (state) {
                        // Update
                        state.data = JSON.stringify(data);
                        state.save(['data'], {ts_id: conn.id})
                            .success(function() {_self.emit('complete');})
                            .error(onDBError);
                    }
                    else {
                        // Create
                        _models.SavedStates
                            .using_shard(user.shard)
                            .create({
                                user_id: user.id,
                                comment: comment,
                                data: JSON.stringify(data)
                            }, null, {ts_id: conn.id})
                            .success(function() {_self.emit('complete');})
                            .error(onDBError);
                    }
                })
                .error(onDBError);
        });
    };

    var onDBError = function(error) {
        onError('DB error: ' + error);
    };

    var onError = function(error) {
        _self.error = error;
        _self.emit("error");
    }
};

module.exports = savedStatesSet;