SetTokenQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.dataGate = mgr.core.dataGate;
};

SetTokenQuery.prototype.run = function(social_id, network_id, token, token_type, odin, callback) {
    var self = this;
    var token_shard = self.dataGate.getShardFor(social_id);
    this.dataGate.begin(token_shard)
    .success(function(conn) {
        var db_close = function(err) {
            conn.rollback();
            callback(err, null);
        };
        self.models.TokenMap
        .using_shard(token_shard)
        .find({where: {token_type: token_type, token: token}, for: "SHARE"}, {ts_id: conn.id})
        .success(function(data) {
            if (data && (data.social_id == social_id && data.network_id == network_id)) {
                return db_close(null);
            }
            self.models.TokenMap.using_shard(token_shard)
            .build({
                token_type: token_type,
                token: token,
                odin: odin,
                social_id: social_id,
                network_id: network_id
            }, {isNewRecord: !data})
            .save(null, {ts_id: conn.id})
            .success(function() {
                conn.commit()
                .success(function() {
                    callback(null)
                }).error(db_close);
            })
            .error(db_close);
        })
        .error(db_close);
    })
    .error(callback);
};

module.exports = SetTokenQuery;