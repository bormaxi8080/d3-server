/**
 * Модуль выполнения Service Query
 */
var Executor = require("../../services/ExecutorFactory");

/**
 * @constructor
 */
var ServiceQueryQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    var _social_id;
    var _network_id;
    var _service_id;
    var _executor;
    var _requestParams;

    /**
     * Запуск.
     *
     * @param network_id    {Number}     Идентификатор социальной сети
     * @param social_id     {String}     Идентификатор пользователя
     * @param service_id    {Number}     Id сервиса
     * @param requestParams {Object}     Параметры запроса
     */
    this.run = function(network_id, social_id, service_id, requestParams, conn) {
        process.nextTick(function() {
            _network_id = network_id;
            _social_id = social_id;
            _service_id = service_id;
            _requestParams = requestParams;
            runQuery();
        });
    };

    /**
     * Запуск процесса обработки Query
     */
    var runQuery = function() {
        _executor = _self.manager.core.executorFactory.getExecutor(_service_id);
        if (!_executor) {
            _self.error = "invalid executor";
            return _self.emit("error");
        }
        _executor.addListener("complete", onExecuteComplete);
        _executor.addListener("error", onExecuteError);
        if (_executor.hasOwnProperty('query'))
            _executor.query(_network_id, _social_id, _requestParams);
        else {
            _executor.result = _requestParams;
            onExecuteComplete();
        }
    };

    /**
     * Обработчик окончания execute
     */
    var onExecuteComplete = function()
    {
        _executor.removeAllListeners();
        _self.result = _executor.result;
        _self.emit("complete");
    };

    /**
     * Обработчик события ошибки execute
     */
    var onExecuteError = function()
    {
        _executor.removeAllListeners();
        _self.error = _executor.error;
        _self.emit("error");
    };
};

module.exports = ServiceQueryQuery;