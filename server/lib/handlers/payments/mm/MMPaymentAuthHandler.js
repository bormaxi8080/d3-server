/**
 * Обработчик, проверяющий авторизацию запроса на платежи
 * в моем мире
 */

var Mixer = require('../../../core/Mixer');
var MMHandler = require('./MMHandler');

var URL = require('url');
var Crypto = require('crypto');

var STATUS_TMP_ERROR = 0;
var STATUS_BAD_REQUEST = 2;

var NO_ERROR = 0;
var BAD_PARAMS = 703;
var BAD_SIGNATURE = 703;
var NO_PRICE = 703;


/**
 * @constructor
 */
var MMPaymentAuthHandler = function(core, next) {
    this._core = core;
    var _self = this;
    var _next = next;

    this.handle = function(task) {
        var request = task.request;
        var params = URL.parse(request.url, true).query;

        var reason = _self.getErrorReason(request, params);

        if (reason !== 0) {
            _self.writeError(task.response, STATUS_BAD_REQUEST, reason);
        } else {
            task.next = _next;
            task.data = params;

            _self.emit('complete', task);
        }
    };
};

/**
 * Получить код ошибки, если таковая присутствует. Если
 * ошибки нет возвращается 0.
 *
 * @param request   {Object}    Запрос от одноклассников
 * @param params    {Object}    Параметры запроса после парсинга
 */
MMPaymentAuthHandler.prototype.getErrorReason = function(request, params)
{
    if ((request.method !== 'GET') ||
        !('uid' in params) ||
        !('app_id' in params) ||
        !('service_id' in params) ||
        !('transaction_id' in params) ||
        !('sig' in params) ||

        (params.app_id != this._core.config().app().networks['2'].app_id)
    ) {
        return BAD_PARAMS;
    }

    if (!('sms_price' in params) && !('mailiki_price' in params) && !('other_price' in params)) {
        return NO_PRICE;
    }

    if (!("sig" in params) || (params.sig !== this.calculateSig(params))) {
        return BAD_SIGNATURE;
    }

    return NO_ERROR;
};

/**
 * Подсчитать сигнатуру запроса
 *
 * @param params    {Object}    Объект, представляющий параметры запроса
 */
MMPaymentAuthHandler.prototype.calculateSig = function(params) {
    var names = [];
    var fieldName;

    for (fieldName in params) names.push(fieldName);
    names.sort();

    var result = '';
    var len = names.length;
    for (var i = 0; i < len; i++)
    {
        fieldName = names[i];
        if (fieldName == 'sig') continue;

        result += fieldName + '=' + params[fieldName];
    }

    result += this._core.config().app().networks['2'].secret_key;

    result = Crypto.createHash('md5').update(result, 'utf8').digest('hex').toLowerCase();

    return result;

};

Mixer.mix(MMPaymentAuthHandler.prototype, MMHandler.prototype);
module.exports = MMPaymentAuthHandler;