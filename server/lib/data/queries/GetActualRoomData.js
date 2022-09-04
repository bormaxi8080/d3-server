var QueryUtils = require('../QueryUtils');
var EventEmitterExt = require('../../core/EventEmitterExt');
var CallChainer = require('../../core/CallChainer');
var QueryCall = require('../../core/Utils').QueryCall;
var JSONUtils = require('../JSONUtils');

var GetActualRoomData = QueryUtils.Wrapper(function(network_id, social_id, room_id) {
    var cqueries = this.manager.core.cqueries;
    var _config = this.manager.core.config();
    var _dataGate = this.manager.core.dataGate;
    var _logger = this.manager.core.logger;

    var neighbours_cfg = _config.app().npc_neighbours;
    if (social_id in neighbours_cfg) {
        return new EventEmitterExt(function(emitter) {
            _logger.info("getting NPC room...");
            emitter.emit('success', JSONUtils.clone(neighbours_cfg[social_id].rooms[room_id]));
        }).run();
    }

    var map_user = null;
    var roomData = null;

    return new CallChainer()
        .add(function(emitter) {
            _logger.info('getting map user...');
            cqueries.getUser.run(network_id, social_id, null, function(err, user) {
                if (err) {
                    return emitter.emit('error', error);
                }
                if (!user) {
                    return emitter.emit('error', 'Пользователь не найден')
                }
                map_user = user;
                emitter.emit('success');
            })
        })
        .add(function(emitter) {
            if (_config.cache().disabled)
                return emitter.emit('success');
            _logger.info('getting map user cache...');
            QueryCall(_dataGate, 'getCache', [network_id, social_id])
                .done(function(err, cache) {
                    if (err)
                        _logger.error("[getCache]" + err);
                    if (cache && cache.data.map.options.location.current_room == room_id && cache.data.map.options.location.map_social_id == social_id) {
                        _logger.info('getting room data from map user cache...');
                        roomData = cache.data.map;
                    }
                    else
                        _logger.info('no map user cache or no required room there...');
                    emitter.emit('success');
                })
        })// get map user from cache
        .add(function(emitter) {
            if (roomData)
                return emitter.emit('success', roomData);
            _logger.info('getting map data from db ...', map_user.location, social_id, room_id);
            _dataGate.begin(map_user.shard)
                .success(function(conn) {
                    var chainer = _dataGate.getQueryChainer();
                    if (!_config.db().no_changelogs && (map_user.location.map_social_id == social_id && map_user.location.current_room == room_id))
                        chainer.add(QueryCall(_dataGate, 'getChangeLog', [map_user, conn]));
                    chainer.add(QueryCall(_dataGate, 'getWorldData', [map_user, conn]));
                    chainer.add(QueryCall(_dataGate, 'getRoomData', [map_user, room_id, conn]))
                        .run()
                        .success(function(res) {
                            if (_config.db().no_changelogs || map_user.location.map_social_id != social_id || map_user.location.current_room != room_id)
                                res.unshift([]);
                            var changes = res[0];
                            var data = res[1];
                            data.map = res[2];
                            conn
                                .commit()
                                .success(function() {
                                    data = JSONUtils.setArray(data, changes);
                                    emitter.emit('success', data.map);
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
        })// get data from db
        .run();
});

module.exports = GetActualRoomData;
