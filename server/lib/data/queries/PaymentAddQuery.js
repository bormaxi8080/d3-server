/**
 * @constructor
 */
var paymentAdd = function(mgr) {
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
                    _models.Payment
                        .using_shard(shard_id)
                        .create({
                            user_id: user.id,
                            payment_code: params.payment_code,
                            product_code: params.product_code,
                            redeemed: false
                        }, null, {ts_id: conn.id})
                        .success(function(payment) {
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

module.exports = paymentAdd;