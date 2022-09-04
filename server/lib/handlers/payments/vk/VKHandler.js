/**
 * Базовый функционал.
 * Миксуется к остальных хендлерам VK.
 */
var Mixer = require("../../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var VKHandler = function() {

};

VKHandler.prototype.writeResponse = function(response, reply) {
    if (this._logger && this._logger.info) {
        // Должно инициализироваться в хендлерах, куда миксуем этот файл
        this._logger.info("VK callback response: " + JSON.stringify(reply));
    } else {
        console.log("VK callback response: " + JSON.stringify(reply));
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({response: reply}));

    this.emit("complete", null);
};

var vkErrors = {
    1: {
        error_msg: 'общая ошибка',
        critical: true
    },
    2: {
        error_msg: 'товара не существует',
        critical: true
    },
    10: {
        error_msg: 'несовпадение вычисленной и переданной подписи',
        critical: true
    },
    11: {
        error_msg: 'ошибка целостности запроса',
        critical: true
    },
    20: {
        error_msg: 'товара не существует',
        critical: true
    },
    21: {
        error_msg: 'товара нет в наличии',
        critical: true
    },
    22: {
        error_msg: 'пользователя не существует',
        critical: true
    }
};

VKHandler.prototype.writeError = function(response, reason) {
    if (this._logger && this._logger.info) {
        // Должно инициализироваться в хендлерах, куда миксуем этот файл
        this._logger.info("VK callback error: " + JSON.stringify(reason));
    } else {
        console.log("VK callback response: " + JSON.stringify(reply));
    }

    response.writeHead(200, {"Content-Type": "application/json"});
    response.writeHead({"invocation-error": reason});

    var err = vkErrors[reason];
    if (!err)
        err = vkErrors[1];
    err.error_code = reason;

    response.end(JSON.stringify({error: err}));

    this.emit("complete", null);
};

Mixer.mix(VKHandler.prototype, EventEmitter.prototype);

module.exports = VKHandler;