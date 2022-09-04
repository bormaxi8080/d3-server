var QueryCall = require('../../core/Utils').QueryCall;

var PaymentExecutor = function(core) {
    var self = this;

    this.execute = function(network_id, social_id, params, conn) {
        QueryCall(core.dataGate, 'paymentAdd', [network_id, social_id, params, conn])
        .success(function() {
            self.result = {
                payment_code: params.payment_code,
                response: {
                    store: params.store,
                    product_id: params.inner_product_id
                }
            };
            self.emit('complete');
        })
        .error(function(err) {
            self.error = err;
            self.emit('error');
        });
    };

    this.change = function(network_id, social_id, old_params, new_params, conn) {
        console.log("change payment from", old_params, "to", new_params);
        self.emit('error');
    };

    this.clear = function(network_id, social_id, params, conn) {
        var query = core.dataGate.getQuery('paymentDelete');
        query.addListener('complete', function() {
            query.removeAllListeners();
            self.result = query.result;
            self.emit('complete');
        });
        query.addListener('error', function() {
            query.removeAllListeners();
            self.error = query.error;
            self.emit('error');
        });
        query.run(network_id, social_id, params.payment_code, conn);
    }
};

module.exports = PaymentExecutor;
