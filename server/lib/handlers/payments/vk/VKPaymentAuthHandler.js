var Mixer = require("../../../core/Mixer");
var VKHandler = require("./VKHandler");
var URL = require("url");
var Crypto = require("crypto");


// константы ошибок авторизации
/*
 Код ошибки Критичность Значение
 1  true/false  общая ошибка.
 2  false   временная ошибка базы данных.
 10 true    несовпадение вычисленной и переданной подписи.
 11 true    параметры запроса не соответствуют спецификации;
 в запросе нет необходимых полей;
 другие ошибки целостности запроса.
 20 true    товара не существует.
 21 true    товара нет в наличии.
 22 true    пользователя не существует.
 100-999        ошибки с номерами 100-999 задаются приложением, при возврате таких ошибок обязательно должно присутствовать текстовое описание ошибки.
 */

/**
 * @constructor
 */
var VKPaymentAuthHandler = function(core, next) {
    this._core = core;
    var _self = this;
    var _next = next;
    this._logger = core.logger;

    this.handle = function(task) {
        var request = task.request;

        _self._logger.info("VKPaymentAuthHandler called with params: " + JSON.stringify(task.post));

        var reason = _self.getErrorReason(request, task.post);
        if (reason !== 0) {
            _self.writeError(task.response, reason);
        }
        else {
            task.next = _next;
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
VKPaymentAuthHandler.prototype.getErrorReason = function(request, params) {
    if (
        (request.method !== "POST") ||
            !("user_id" in params) ||
            !("receiver_id" in params) ||
            !("order_id" in params) ||

            !("notification_type" in params) ||
            (typeof(params.notification_type) !== "string") ||

            !("app_id" in params) ||
            (params.app_id != this._core.config().app().networks["1"].app_id) ||

            !("sig" in params) ||
            (params.sig !== this.calculateSig(params))
        ) {
        // TODO: добавить правильный возврат ошибок
        return 11;
    }

    return 0;
};

/**
 * Подсчитать сигнатуру запроса
 *
 * @param params    {Object}    Объект, представляющий параметры запроса
 */
VKPaymentAuthHandler.prototype.calculateSig = function(params) {
    var names = [];
    var fieldName;

    for (fieldName in params) names.push(fieldName);
    names.sort();

    var result = "";
    var len = names.length;
    for (var i = 0; i < len; i++) {
        fieldName = names[i];
        if (fieldName == "sig") continue;

        result += fieldName + "=" + params[fieldName];
    }

    result += this._core.config().app().networks["1"].secret_key;
    result = Crypto.createHash("md5").update(result, "utf8").digest("hex").toLowerCase();

    return result;
};

Mixer.mix(VKPaymentAuthHandler.prototype, VKHandler.prototype);

module.exports = VKPaymentAuthHandler;