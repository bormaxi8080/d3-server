var QueryUtils = require('../QueryUtils');
var EventEmitterExt = require('../../core/EventEmitterExt');
var QueryCall = require('../../core/Utils').QueryCall;
var JSONUtils = require("../JSONUtils");
var CallChainer = require('../../core/CallChainer');

var GetActualWorldDataQuery = QueryUtils.Wrapper(function(network_id, social_id) {
    var cqueries = this.manager.core.cqueries;
    var _config = this.manager.core.config();
    var _dataGate = this.manager.core.dataGate;
    var _logger = this.manager.core.logger;

    var neighbours_cfg = _config.app().npc_neighbours;
    if (social_id in neighbours_cfg) {
        return new EventEmitterExt(function(emitter) {
            _logger.info("getting NPC world...");
            emitter.emit('success', JSONUtils.clone(neighbours_cfg[social_id].world));
        }).run();
    }

    var world_user = null;
    var worldData = null;

    return new CallChainer()
        .add(function(emitter) {
            _logger.info('getting world user...');
            cqueries.getUser.run(network_id, social_id, null, function(err, user) {
                if (err) {
                    return emitter.emit('error', error);
                }
                if (!user) {
                    return emitter.emit('error', 'Пользователь не найден')
                }
                world_user = user;
                emitter.emit('success');
            })
        })
        .add(function(emitter) {
            if (_config.cache().disabled)
                return emitter.emit('success');
            _logger.info('getting world user cache...');
            QueryCall(_dataGate, 'getCache', [network_id, social_id])
                .done(function(err, cache) {
                    if (err)
                        _logger.error("[getCache]" + err);
                    if (cache) {
                        _logger.info('returning world data from world user cache...');
                        worldData = cache.data;
                    }
                    else
                        _logger.info('no map user cache or no required room there...');
                    emitter.emit('success');
                })
        })
        .add(function(emitter) {
            if (worldData)
                return emitter.emit('success', worldData);
            _logger.info('getting world data from db ...');
            _dataGate.begin(world_user.shard)
                .success(function(conn) {
                    var chainer = _dataGate.getQueryChainer();
                    if (!_config.db().no_changelogs)
                        chainer.add(QueryCall(_dataGate, 'getChangeLog', [world_user, conn]))
                    chainer.add(QueryCall(_dataGate, 'getWorldData', [world_user, conn]))
                        .run()
                        .success(function(res) {
                            if (_config.db().no_changelogs)
                                res.unshift([]);
                            var changes = res[0];
                            var data = res[1];
                            conn
                                .commit()
                                .success(function() {
                                    emitter.emit('success', JSONUtils.setArray(data, changes));
                                })
                                .error(function(error) {
                                    conn.rollback();
                                    emitter.emit('error', error);
                                })
                        })
                        .error(function(error) {
                            conn.rollback();
                            emitter.emit('error', error);
                        })
                })
                .error(function(error) {emitter.emit('error', error);})
        })
        .run();
});

module.exports = GetActualWorldDataQuery;
