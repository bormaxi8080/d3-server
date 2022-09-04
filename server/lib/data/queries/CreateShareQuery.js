/**
 * @constructor
 */
var ShareAddQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(network_id, social_id, params, conn) {
        var shard_id = mgr.core.dataGate.getShardFor(social_id);
        _models.User
            .using_shard(shard_id)
            .find({ where: {social_network: network_id, social_id: social_id}}, {ts_id: conn.id})
            .success(function(user) {
                if (user) {
                    if (params.expiresAt == undefined) {
                        var d = new Date();
                        params.expiresAt = d.setDate(d.getDate() + 1); // По умолчанию 1 день
                    }
                    if (params.max_uses == undefined) {
                        params.max_uses = 10;
                    }

                    _models.Share
                        .using_shard(shard_id)
                        .create({
                            social_id: user.social_id,
                            network_id: user.social_network,
                            post_id: params.post_id,
                            expiresAt: new Date(params.expiresAt),
                            max_used: params.max_uses,
                            state: true,
                            data: JSON.stringify(params.data)
                        }, null, {ts_id: conn.id})
                        .success(function(gift) {
                            _self.result = {
                                response: {
                                    data: params.data
                                }
                            };
                            _self.emit("complete");
                        })
                        .error(onDBError);
                }
                else {
                    _self.error = 'unknown user';
                    _self.emit("error");
                }
            })
            .error(onDBError);
    };

    var onDBError = function(error) {
        _self.error = "DB error: " + error;
        _self.emit("error");
    }
};

module.exports = ShareAddQuery;