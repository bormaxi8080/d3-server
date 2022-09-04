/**
 * Обработчик, проверяющий авторизацию запроса на платежи
 * в одноклассниках
 */

var Mixer = require("../../../core/Mixer");
var OKHandler = require("./OKHandler");

var URL = require("url");
var Crypto = require("crypto");

// константы ошибок авторизации
var NO_ERROR = 0;
var CALLBACK_INVALID_PAYMENT = 10001;
var PARAM_SIGNATURE = 104;

/**
 * @constructor
 */
var OKPaymentAuthHandler = function(core, next) {
    this._core = core;
    this._logger = core.logger;
    var _self = this;
    var _next = next;

    this.handle = function(task)
    {
        var request = task.request;
        var params = URL.parse(request.url, true).query;

        _self._logger.info("Called with params: " + JSON.stringify(params));

        var reason = _self.getErrorReason(request, params);

        if (reason !== 0)
        {
            _self.writeError(task.response, reason);
        }
        else
        {
            task.next = _next;
            task.data = params;

            _self.emit("complete", task);
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
OKPaymentAuthHandler.prototype.getErrorReason = function(request, params)
{
    if ((request.method !== "GET") ||
        !("uid" in params) ||
        !("transaction_time" in params) ||
        !("transaction_id" in params) ||
        !("product_code" in params) ||
        !("amount" in params) ||

        !("method" in params) ||
        (typeof(params.method) !== "string") ||
        (params.method !== "callbacks.payment") ||

        !("application_key" in params) ||
        (params.application_key != this._core.config().app().networks["3"].app_id)
    )
    {
        return CALLBACK_INVALID_PAYMENT;
    }

    if (!("sig" in params) || (params.sig !== this.calculateSig(params)))
    {
        return PARAM_SIGNATURE;
    }

    return NO_ERROR;
};

/**
 * Подсчитать сигнатуру запроса
 *
 * @param params    {Object}    Объект, представляющий параметры запроса
 */
OKPaymentAuthHandler.prototype.calculateSig = function(params)
{
    var names = [];
    var fieldName;

    for (fieldName in params) names.push(fieldName);
    names.sort();

    var result = "";
    var len = names.length;
    for (var i = 0; i < len; i++)
    {
        fieldName = names[i];
        if (fieldName == "sig") continue;

        result += fieldName + "=" + params[fieldName];
    }

    result += this._core.config().app().networks["3"].secret_key;

    result = Crypto.createHash("md5").update(result, "utf8").digest("hex").toLowerCase();

    return result;

};

Mixer.mix(OKPaymentAuthHandler.prototype, OKHandler.prototype);
module.exports = OKPaymentAuthHandler;