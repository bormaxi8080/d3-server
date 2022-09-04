/**
 * Модуль выполнения Service Clear
 */

/**
 * @constructor
 */
var ServicesDeleteQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;
    var _logger = this.manager.core.logger;

    this.result = null;
    this.error = null;

    /**
     * Запуск.
     *
     * @param network_id    {Number}     Идентификатор социальной сети
     * @param social_id     {String}     Идентификатор пользователя
     * @param request_ids   {Array}      список id удаляемых сервисов
     * @param conn          {Object}     defult: null, коннект с транзакцией, если есть.
     */
    this.run = function(network_id, social_id, request_ids, conn) {
        var options = null;
        if (conn) {
            options = {ts_id: conn.id}
        }
        mgr.core.dataGate.getQueryChainer()
            .add(_models.ServiceRequest.using(social_id).findAll({attributes: ['id', 'service_id', 'data'], where: {id: request_ids}}, options))
            .add(_models.ServiceRequest.using(social_id).delete({where: {id: request_ids}, limit: 'ALL'}, options))
            .run()
            .success(function(res) {
                var need = res[0].length;
                var curr = 0;
                for (var i in res[0]) {
                    var request = res[0][i];

                    var _executor = _self.manager.core.executorFactory.getExecutor(request.service_id);
                    if (!_executor) {
                        _logger.error("invalid executor " + request.service_id);
                        _self.error = "invalid executor";
                        return _self.emit("error");
                    }
                    if (_executor.hasOwnProperty("clear")) {
                        _executor.addListener("complete", function() {
                            curr++;
                            _self.checkComplete(curr, need);
                        });
                        _executor.addListener("error", function() {
                            _self.error = _executor.error;
                            return _self.emit("error");
                        });
                        _executor.clear(network_id, social_id, JSON.parse(request.data), conn);
                    } else {
                        curr++;
                        _self.checkComplete(curr, need);
                    }
                } // END for (var i in res[0]) {
            })
            .error(function(error) {
                _self.error = error;
                _self.emit("error");
            });
    };

    this.checkComplete = function(curr, need) {
        if (curr >= need) {
            _self.emit("complete");
        }
    }
};

module.exports = ServicesDeleteQuery;