/**
 * Модуль выполнения Service Clear
 */
/**
 * @constructor
 */
var serviceClear = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;
    var _logger = mgr.core.logger;

    this.result = null;
    this.error = null;

    /**
     * Запуск.
     *
     * @param network_id    {Number}     Идентификатор социальной сети
     * @param social_id     {String}     Идентификатор пользователя
     * @param request_id    {Number}     Id реквеста
     */
    this.run = function(network_id, social_id, request_id, conn) {
        request_id = parseInt(request_id);
        mgr.core.dataGate.getQueryChainer()
            .add(_models.ServiceRequest.using(social_id).find({attributes: ['service_id', 'data'], where: {id: request_id}}, {ts_id: conn.id}))
            .add(_models.ServiceRequest.using(social_id).delete({where: {id: request_id}, limit: "ALL"}, {ts_id: conn.id}))
            .run()
            .success(function(res) {
                var request = res[0];
                if (!request)
                    return _self.emit("complete");
                var _executor = _self.manager.core.executorFactory.getExecutor(request.service_id);
                if (!_executor) {
                    _logger.error("invalid executor " + request.service_id);
                    _self.error = "invalid executor";
                    return _self.emit("error");
                }
                if (_executor.hasOwnProperty("clear")) {
                    _executor.addListener("complete", _self.emit.bind(_self, "complete"));
                    _executor.addListener("error", function() {
                        _self.error = _executor.error;
                        return _self.emit("error");
                    });
                    _executor.clear(network_id, social_id, JSON.parse(request.data), conn);
                }
                else
                    _self.emit("complete");
            })
            .error(function(error) {
                _self.error = error;
                _self.emit("error");
            });
    };
};

module.exports = serviceClear;