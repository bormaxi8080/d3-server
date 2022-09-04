GetTokensQuery = function(mgr) {
    var self = this;

    this.result = null;
    this.error = null;

    this.run = function(network_id, social_id) {
        var token_shard = mgr.core.dataGate.getShardFor(social_id);
        mgr.models.TokenMap
        .using_shard(token_shard)
        .findAll({where: {network_id: network_id, social_id: social_id}})
        .success(function(results) {
            self.result = results || [];
            self.emit('complete');
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

module.exports = GetTokensQuery;