/**
 * @constructor
 */
var PaymnetDeleteQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(network_id, social_id, payment_code, conn) {
        var shard_id = mgr.core.dataGate.getShardFor(social_id);
        _models.User
            .using_shard(shard_id)
            .find({ where: {social_network: network_id, social_id: social_id}}, {ts_id: conn.id})
            .success(function(user) {
                if (user) {
                    _models.Payment
                        .using_shard(shard_id)
                        .find({where: {user_id: user.id, payment_code: payment_code}}, {ts_id: conn.id})
                        .success(function(payment) {
                            if (payment) {
                                payment.redeemed = true;
                                payment
                                    .save(["redeemed"], {ts_id: conn.id})
                                    .success(function() {
                                        _self.emit("complete");
                                    })
                                    .error(onDBError);
                            }
                            else {
                                onError("Платеж не найден!");
                            }
                        })
                        .error(onDBError)
                }
                else {
                    _self.error = 'unknown user';
                    _self.emit("error");
                }
            })
            .error(onDBError);
    };

    var onDBError = function(error) {
        onError("DB error: " + error);
    }

    var onError = function(error) {
        _self.error = error;
        _self.emit("error");
    }
};

module.exports = PaymnetDeleteQuery;