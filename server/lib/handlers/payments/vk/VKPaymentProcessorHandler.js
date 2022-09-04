var Mixer = require("../../../core/Mixer");
var VKHandler = require("./VKHandler");
var QueryCall = require("../../../core/Utils").QueryCall;

/**
 * @constructor
 */
var VKPaymentProcessorHandler = function(core, next) {
    var _self = this;
    this._logger = core.logger;

    var products = core.config().services.products['vk'];

    this.handle = function(task) {
        if (task.post.notification_type != 'order_status_change' &&
            task.post.notification_type != 'order_status_change_test') {
            task.next = next;
            return _self.emit('complete', task);
        }

        if (!task.post.order_id) {
            return _self.writeError(task.response, 1);
        }

        var product = products[task.post.item];

        if (!product || task.post.item_price != product.cost) {
            return _self.writeError(task.response, 1);
        }

        var network_id = 1;
        var paymentRequest = {
            product_code: task.post.item,
            amount: task.post.item_price,
            payment_code: task.post.order_id
        };
        core.dataGate.begin(core.dataGate.getShardFor(task.post.receiver_id))
            .success(function(conn) {
                QueryCall(core.dataGate, 'serviceExecute', [network_id, task.post.receiver_id, 'payment', paymentRequest, conn])
                    .success(function() {
                        conn.commit()
                            .success(function() {
                                _self.writeResponse(task.response, {order_id: task.post.order_id});
                            })
                            .error(_self.writeError.bind(_self, task.response, 1))
                    })
                    .error(function() {
                        conn.rollback();
                        _self.writeError(task.response, 1)
                    })
            })
            .error(_self.writeError.bind(_self, task.response, 1))
    };
};

Mixer.mix(VKPaymentProcessorHandler.prototype, VKHandler.prototype);

module.exports = VKPaymentProcessorHandler;