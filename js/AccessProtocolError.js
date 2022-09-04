/**
 * Ошибка протокола взаимодействия (иначе говоря, пытаемся выполнить какую-то функцию с параметрами, не подходящими под
 * ее сигнатуру и/или реализаию)
 */
function AccessProtocolError(message) {
    this.name = "AccessProtocolError";
    this.message = message;
    this.stack = new Error(message).stack;
    this.toString = function () {return this.name + ": " + this.message};
}

AccessProtocolError.prototype = new Error();
