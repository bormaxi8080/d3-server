module.exports = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(social_network, social_id) {
        var shard_id = mgr.core.dataGate.getShardFor(social_id);
        _models.User
            .using_shard(shard_id)
            .find({where: {social_network: social_network, social_id: social_id}, attributes: ['id']})
            .success(function(res) {
                if (res) {
                    _self.result = true;
                } else {
                    _self.result = false;
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
