var GetPaymentsByCodeQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.dataGate = mgr.core.dataGate;
};

GetPaymentsByCodeQuery.prototype.run = function(social_id, payment_code, callback) {
    var self = this;
    var shard_id = this.dataGate.getShardFor(social_id);

    var Payment = this.models.Payment;

    Payment.using_shard(shard_id)
    .find({ where: { payment_code: payment_code } })
    .success(function(payment) {
        if (!payment) {
            return callback(null, null);
        }
        callback(null, [payment]);
    }).error(function(err) {
        callback(err, null);
    });
};

module.exports = GetPaymentsByCodeQuery;
