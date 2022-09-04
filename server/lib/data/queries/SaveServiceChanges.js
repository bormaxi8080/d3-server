var QueryUtils = require('../QueryUtils');
var EventEmitterExt = require('../../core/EventEmitterExt');
var CallChainer = require('../../core/CallChainer');
var QueryCall = require('../../core/Utils').QueryCall;
var JSONUtils = require('../JSONUtils');

var saveServiceChanges = QueryUtils.Wrapper(function(network_id, social_id, used_services, new_services, changed_services, conn) {
    var _core = this.manager.core;
    var _config = _core.config();
    var dataGate = _core.dataGate;
    var _logger = this.manager.core.logger;

    _logger.info('applying service requests changes...');
    return new EventEmitterExt(function(emitter) {
        if ((!new_services || new_services.length <= 0) &&
            (!used_services || used_services.length <= 0) &&
            (!changed_services || Object.keys(changed_services).length <= 0))
            return emitter.emit('success');

        var clear_used = (used_services && used_services.length > 0);
        var edit_changed = (changed_services && Object.keys(changed_services).length > 0);

        var shards = {};
        var service;
        var shard_id;
        var s;
        for (s in new_services) {
            service = new_services[s];
            shard_id = dataGate.getShardFor(service.social_id);
            if (!shards[shard_id])
                shards[shard_id] = [];
            shards[shard_id].push(service);
        }
        var self_shard = dataGate.getShardFor(social_id);
        if (clear_used || edit_changed) {
            if (!shards[self_shard])
                shards[self_shard] = [];
        }

        var chainer = dataGate.getQueryChainer();
        var shard_ids = Object.keys(shards).sort();
        shard_ids.forEach(function(shard_id) {
            if (!conn || shard_id != self_shard)
                chainer.add(dataGate.begin(shard_id));
            else chainer.add(new EventEmitterExt(function(emitter) {
                emitter.emit('success', conn);
            }).run());
        });
        chainer.run()
            .success(function(conns) {
                var chainer = dataGate.getQueryChainer();

                var _conn = null;
                // clear used
                var usedChainer = dataGate.getQueryChainer();
                if (clear_used) {
                    _conn = conns[shard_ids.indexOf(self_shard)];
                    for (var op_index in used_services)
                        usedChainer.add(QueryCall(dataGate, 'serviceClear', [network_id, social_id, used_services[op_index], _conn]))
                }
                chainer.add(usedChainer.run());

                var changeChainer = dataGate.getQueryChainer();
                if (edit_changed) {
                    _conn = conns[shard_ids.indexOf(self_shard)];
                    for (var operation_id in changed_services)
                        changeChainer.add(QueryCall(dataGate, 'serviceChange', [network_id, social_id, operation_id, changed_services[operation_id], _conn]))
                }
                chainer.add(changeChainer.run());

                var newChainer = dataGate.getQueryChainer();
                shard_ids.forEach(function(shard_id, index) {
                    var conn = conns[index];
                    var services = shards[shard_id];
                    services.forEach(function(service) {
                        newChainer.add(QueryCall(dataGate, 'serviceExecute', [network_id, service.social_id, service.service_id, service.params, conn]))
                    })
                });
                chainer.add(newChainer.run());

                chainer.run()
                    .success(function(res) {
                        var chainer = dataGate.getQueryChainer();
                        conns.forEach(function(__conn) {
                            if (!conn || __conn.shard != conn.shard)
                                chainer.add(__conn.commit())
                        });
                        chainer
                            .run()
                            .success(function() {
                                emitter.emit('success');
                            })
                            .error(emitter.emit.bind(emitter, 'error'));
                    })
                    .error(function(err) {
                        conns.forEach(function(conn) {
                            conn.rollback();
                        });
                        emitter.emit('error', err);
                    })
            })
            .error(emitter.emit.bind(emitter, 'error'));
    }).run();
});

module.exports = saveServiceChanges;
