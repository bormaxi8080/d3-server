/**
 * Модуль выполнения Service Execute
 */
var Executor = require("../../services/ExecutorFactory");

/**
 * @constructor
 */
var serviceExecute = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    var _social_id;
    var _network_id;
    var _service_id;
    var _requestParams;
    var _executor;
    var _conn;

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
            _conn = conn;
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
        if (_executor.hasOwnProperty('execute')) {
            _executor.execute(_network_id, _social_id, _requestParams, _conn);
        } else {
            _executor.result = {
                response: _requestParams,
                expires_date: (_requestParams.hasOwnProperty('expires_date') ? _requestParams['expires_date'] : 0)
            };
            onExecuteComplete();
        }
    };

    /**
     * Обработчик окончания execute
     */
    var onExecuteComplete = function() {
        _executor.removeAllListeners();

        var expires_date =  _executor.result['expires_date'] || 0;
        delete(_executor.result['expires_date']);

        var shard_id = _self.manager.core.dataGate.getShardFor(_social_id);
        var request = _models.ServiceRequest.using_shard(shard_id).build({
            social_id:    _social_id,
            network_id:   _network_id,
            service_id:   _service_id,
            data:         JSON.stringify(_executor.result),
            expires_date: expires_date
        });
        request
            .save(null, _conn ? {ts_id: _conn.id} : undefined)
            .success(function(res) {
                _self.result = {
                    "service_id":   _service_id,
                    "operation_id": res.id,
                    "data":         _executor.result,
                    "expires_date": expires_date
                };
                _self.emit("complete");
            })
            .error(onDBError.bind(_self))
    };

    /**
     * Обработчик события ошибки execute
     */
    var onExecuteError = function() {
        _executor.removeAllListeners();
        _self.error = _executor.error;
        _self.emit("error");
    };

    /**
     * Обработчик события ошибки обращеня к БД
     */
    var onDBError = function(error) {
        onError("DB error: " + error);
    };

    /**
     * Обработчик события ошибки обращеня к БД
     */
    var onError = function(error) {
        _self.error = error;
        _self.emit("error");
    };
};

module.exports = serviceExecute;