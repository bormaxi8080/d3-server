/**
 * Модуль для записи платежа в одноклассниках в БД
 */

var Mixer = require("../../../core/Mixer");
var MMHandler = require("./MMHandler");

var QueryCall = require("../../../core/Utils").QueryCall;

var STATUS_TMP_ERROR = 0;
var STATUS_BAD_REQUEST = 2;

var DB_ERROR = 703;
/**
 * @constructor
 */
var MMPaymentProcessorHandler = function(core) {
    var _self = this;
    this._logger = core.logger;

    var products  = core.config().services.products['mm'];

    this.handle = function(task)
    {
        var product = products[task.data.service_id];
        var network_id = 2;

        if (!product) {
            this._logger.warn('MMPayment. Product with code ' + task.data.service_id + ' not found.');
        }

        var amount = 0;
        if ('mailiki_price' in task.data) {
            amount = task.data.mailiki_price;
        } else if ('other_price' in task.data) {
            amount = parseInt(task.data.other_price) / 100;
        } else if ('sms_price' in task.data) {
            amount= task.data.sms_price;
        }

        var paymentRequest = {
            product_code:   task.data.service_id,
            amount:         amount,
            payment_code:   task.data.transaction_id
        };

        core.dataGate.begin(core.dataGate.getShardFor(task.data.uid))
            .success(function(conn) {
                QueryCall(core.dataGate, 'serviceExecute', [network_id, task.data.uid, 'payment', paymentRequest, conn])
                    .success(function() {
                        _self._logger.info('MMPayment. Success.');

                        conn.commit()
                            .success(function() {
                                _self.writeResponse(task.response)
                            })
                            .error(_self.writeError.bind(_self, task.response, STATUS_TMP_ERROR, DB_ERROR))
                    })
                    .error(function(error){
                        _self._logger.error('MMPayment. Failure. ' + error);

                        conn.rollback();
                        _self.writeError(task.response, STATUS_TMP_ERROR, DB_ERROR);
                    })
            })
            .error(_self.writeError.bind(_self, task.response, STATUS_TMP_ERROR, DB_ERROR));
    };
};

Mixer.mix(MMPaymentProcessorHandler.prototype, MMHandler.prototype);
module.exports = MMPaymentProcessorHandler;