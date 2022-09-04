/**
 * @constructor
 */
var QueryUtils = require('./../QueryUtils');
var JSONUtils = require("../JSONUtils");

module.exports = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(shard, id) {
        _models.SavedStates
            .using_shard(shard)
            .find({where: {id: id}}, {raw: true})
            .success(function(res) {
                if (!res) return _self.emit('complete');

                JSONUtils.unpack(res.data, function(error, unpacked) {
                    if (!error) {
                        res.data = unpacked;
                    }
                    _self.result = res;
                    _self.emit('complete');
                });
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
