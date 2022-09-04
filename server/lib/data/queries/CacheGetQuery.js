/**
 * Модуль для получения сессионных данных
 */

var QueryUtils = require('../QueryUtils')

/**
 * @constructor
 */
var CacheGetQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _memory = mgr.cache;

    this.result = null;
    this.error = null;

    var _query = null;

    /**
     * Получить данные
     *
     */
    this.run = function(network_id, social_id)
    {
        var cache_id = QueryUtils.getCacheID(this.manager.core.config().cache().prefix, network_id, social_id);
        _query = _memory.getQuery();
        _query.addListener('complete', onSuccess);
        _query.addListener('error', onError);
        _query.get(cache_id);
    };

    /**
     * Обработчик успешного поиска сессионных данных
     */
    var onSuccess = function()
    {
        _query.removeAllListeners();

        _self.result = _query.result;
        _self.emit("complete");
    };

    /**
     * Обработчик ошибки при поиске сессионных данных
     */
    var onError = function()
    {
        _query.removeAllListeners();

        _self.error = _query.error;
        _self.emit("error");
    };
};

module.exports = CacheGetQuery;