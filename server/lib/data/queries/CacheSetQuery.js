/**
 * Модуль для сохранения сессионных данных
 */

var QueryUtils = require('../QueryUtils')

/**
 * @constructor
 */
var CacheSetQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _memory = mgr.cache;

    this.result = null;
    this.error = null;

    var _query = null;

    /**
     * Сохранить данные
     */
    this.run = function(network_id, social_id, world)
    {
        var cache_id = QueryUtils.getCacheID(this.manager.core.config().cache().prefix, network_id, social_id);
        _query = _memory.getQuery();
        _query.addListener('complete', onSuccess);
        _query.addListener('error', onError);
        _query.set(cache_id, world);
    };

    /**
     * Обработчик успешного сохранения сессионных данных
     */
    var onSuccess = function()
    {
        _query.removeAllListeners();

        _self.emit("complete");
    };

    /**
     * Обработчик ошибки при сохранении сессионных данных
     */
    var onError = function()
    {
        _query.removeAllListeners();

        _self.error = _query.error;
        _self.emit("error");
    };
};

module.exports = CacheSetQuery;