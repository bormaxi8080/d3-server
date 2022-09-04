/**
 * Модуль-обвязка вокруг Memcached
 */

var Memcached = require("memcached");
var MemQuery = require("./MemQuery");

/**
 * @constructor
 *
 * @param config    {Object}    Конфигурация memcached
 */
var Memory = function(config, logger)
{
    this._liveTime = config.liveTime;
    this._logger = logger;

    var host = config.host;
    var poolSize = config.poolSize;
    this._connectionProvider = new Memcached(host, {
        poolSize: poolSize,
        retries: config.retries || 1
    });
};

/**
 * Получить обращение к in-memory хранилищу
 */
Memory.prototype.getQuery = function()
{
    if (!this._connectionProvider) throw new Error("Неверно инициализирован Memcache!");

    return new MemQuery(this._connectionProvider, this._liveTime, this._logger);
};

module.exports = Memory;