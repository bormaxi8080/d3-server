/**
 * Модуль для асинхронных обращений к memcached
 */

var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

/**
 * @constructor
 */
var MemQuery = function(connectionProvider, liveTime, logger)
{
    this.result = null;
    this.error = null;

    this._connectionProvider = connectionProvider;
    this._liveTime = liveTime;

    var _self = this;
    var _logger = logger;

    /**
     * Получить значение по ключу
     *
     * @param key   {String}    Строковый ключ
     */
    this.get = function(key)
    {
        _logger.info('\x1b[32m[cache]\x1b[0m GET', key);
        _self._connectionProvider.get(key, onComplete);
    };

    /**
     * Сохранить значение по ключу
     *
     * @param key       {String}    Строковый ключ
     * @param value     {Object}    Значение для хранения
     */
    this.set = function(key, value)
    {
        _logger.info('\x1b[32m[cache]\x1b[0m SET', key);
        _self._connectionProvider.set(key, value, _self._liveTime, onComplete);
    };

    var onComplete = function(err, result)
    {
        _logger.info('\x1b[32m[cache]\x1b[0m DONE', err);
        if (!_self)
            return;

        if (err)
        {
            _logger.error(err);
            _self.error = err;
            _self.emit("error");
        }
        else
        {
            _self.result = result;
            _self.emit("complete");
        }

        _self = null;
    };
};

Mixer.mix(MemQuery.prototype, EventEmitter.prototype);

module.exports = MemQuery;