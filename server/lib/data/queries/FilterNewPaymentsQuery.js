var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var FilterNewPaymentsQuery = function(mgr) {
    var _self = this;
    this.mgr = mgr;
    this.dataGate = this.mgr.core.dataGate;
    this.models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(network_id, social_id, transactions, conn) {
        _self.models.Payment
        .using_shard(this.dataGate.getShardFor(social_id))
        .findAll({
            attributes: ['payment_code'],
            where: { payment_code: transactions }
        })
        .success(function(result) {
            var res = result.map(function(record) { return record.payment_code });
            _self.result = transactions.filter(function(transaction_id) {
                return (res.indexOf(transaction_id) < 0);
            });
            _self.emit("complete", res);
        })
        .error(function(error) {
            _self.error = 'unknown db error';
            _self.emit("error", error);

        });
    };
};

Mixer.mix(FilterNewPaymentsQuery.prototype, EventEmitter.prototype);
module.exports = FilterNewPaymentsQuery;