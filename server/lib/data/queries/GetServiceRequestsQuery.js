/**
 * Модуль получения сервис реквестов
 */

/**
 * @constructor
 */
var QueryCall = require("../../core/Utils").QueryCall;

var getServiceRequests = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;
    var _dataGate = mgr.core.dataGate;

    this.result = null;
    this.error = null;

    /**
     * Запуск.
     */
    this.run = function(network_id, social_id) {
        process.nextTick(function() {
            _models.ServiceRequest
                .using(social_id)
                .findAll({ where: {network_id: network_id, social_id: social_id }})
                .success(function(requests) {
                    var requestsResult = [];
                    // TODO убрать удаление истекших сервисов в сохранение изменений (для транзакционности)
                    var ts = Date.now()
                    var expired = [];
                    for (var i = 0; i < requests.length; i++) {
                        if (requests[i].expires_date && requests[i].expires_date < ts) {
                            // Сервис слетел по Expire. Удаляем.
                            expired.push(requests[i].id);
                        } else {
                            requestsResult.push(requests[i].toJSON());
                        }
                    }
                    if (expired.length) {
                        QueryCall(_dataGate, 'servicesDelete', [network_id, social_id, expired]);
                    }

                    _self.result = requestsResult;
                    _self.emit("complete");
                })
                .error(function(error) {
                    _self.error = "DB error: " + error;
                    _self.emit("error");
                });
        });
    };
};

module.exports = getServiceRequests;