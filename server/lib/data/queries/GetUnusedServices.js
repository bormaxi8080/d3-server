var QueryUtils = require("../QueryUtils");
var EventEmitterExt = require("../../core/EventEmitterExt");
var CallChainer = require("../../core/CallChainer");
var QueryCall = require("../../core/Utils").QueryCall;

var getUnusedServices = QueryUtils.Wrapper(function(network_id, social_id, conn) {
    var _core = this.manager.core;
    var _logger = this.manager.core.logger;

    _logger.info('getting unused service requests...');

    return new EventEmitterExt(function(emitter) {
        QueryCall(_core.dataGate, 'getServiceRequests', [network_id, social_id, conn])
            .success(function(requests) {
                var unused_services = {};
                requests.forEach(function(request) {
                    var service_requests = unused_services[request.service_id];
                    if (!service_requests)
                        unused_services[request.service_id] = service_requests = {};
                    var data = JSON.parse(request.data);
                    service_requests[request.id] = {
                        "operation_id": request.id,
                        "result": data.response,
                        "error": typeof(data.response) != "object"
                    };
                });
                emitter.emit("success", unused_services);
            })
            .error(emitter.emit.bind(emitter, "error"));
    }).run();
});

module.exports = getUnusedServices;
