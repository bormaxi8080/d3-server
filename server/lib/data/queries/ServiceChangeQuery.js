var EventEmitterExt = require("../../core/EventEmitterExt");

var serviceChange = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(network_id, social_id, request_id, requestParams, conn) {
        request_id = parseInt(request_id);
        var shard_id = _self.manager.core.dataGate.getShardFor(social_id);
        _models.ServiceRequest.using_shard(shard_id).find({attributes: ['id', 'service_id', 'data'], where: {id: request_id}}, {ts_id: conn.id})
            .success(function(request) {
                var old_data = JSON.parse(request.data);
                var new_data = JSON.parse(request.data);
                new_data.response = requestParams
                request.data = JSON.stringify(new_data);
                mgr.core.dataGate.getQueryChainer()
                    .add(request.save(['data']))
                    .add(changeRequest(network_id, social_id, request.service_id, old_data, new_data, conn))
                    .run()
                    .success(function() {
                        return _self.emit("complete");
                    })
                    .error(function(error) {
                        _self.error = error;
                        return _self.emit("error");
                    })
            })
            .error(function(error) {
                _self.error = error;
                _self.emit("error");
            });
    };

    var changeRequest = function(network_id, social_id, service_id, old_data, new_data, conn) {
        return new EventEmitterExt(function(emitter) {
            var _executor = _self.manager.core.executorFactory.getExecutor(service_id);
            if (_executor.hasOwnProperty("change")) {
                _executor.addListener("complete", function() {
                    emitter.emit("success", _executor.result)
                });
                _executor.addListener("error", function() {
                    emitter.emit("error", _executor.error)
                });
                _executor.change(network_id, social_id, old_data, new_data, conn);
            }
            else
                return emitter.emit("success", new_data);
        }).run();
    };
};

module.exports = serviceChange;