/**
 * Модуль для записи платежа в одноклассниках в БД
 */

var Mixer = require("../../../core/Mixer");
var OKHandler = require("./OKHandler");

var QueryCall = require("../../../core/Utils").QueryCall;

var UNKNOWN                  =    1; // Unknown Error
var SERVICE                  =    2; // Service temporary unavailable
var CALLBACK_INVALID_PAYMENT = 1001; // Payment is invalid and can not be processed
var SYSTEM                   = 9999; // Critical system failure, which can not be recovered
var PARAM_SIGNATURE          =  104; // Invalid signature

/**
 * @constructor
 */
var logger = null;

var OKPaymentProcessorHandler = function(core) {
    this._logger = core.logger;
    var _self = this;

    var products  = core.config().services.products['ok'];

    this.handle = function(task)
    {
        var product = products[task.data.product_code];
        var network_id = 3;

        if (!product) {
            this._logger.warn('OKPayment. Product with code ' + task.data.product_code + ' not found.');
        }

        var paymentRequest = {
            product_code:   task.data.product_code,
            amount:         task.data.amount,
            payment_code:   task.data.transaction_id
        };

        core.dataGate.begin(core.dataGate.getShardFor(task.data.uid))
            .success(function(conn) {
                QueryCall(core.dataGate, 'serviceExecute', [network_id, task.data.uid, 'payment', paymentRequest, conn])
                    .success(function() {
                        _self._logger.info('OKPayment. Success.');
                        conn.commit()
                            .success(function() {
                                _self.writeResponse(task.response);
                            })
                            .error(_self.writeError.bind(_self, task.response, CALLBACK_INVALID_PAYMENT))
                    })
                    .error(function(error){
                        _self._logger.error('OKPayment. Failure. ' + error);

                        conn.rollback();
                        _self.writeError(task.response, CALLBACK_INVALID_PAYMENT);
                    })
            })
            .error(_self.writeError.bind(_self, task.response, CALLBACK_INVALID_PAYMENT));
    };
};

Mixer.mix(OKPaymentProcessorHandler.prototype, OKHandler.prototype);
module.exports = OKPaymentProcessorHandler;