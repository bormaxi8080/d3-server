var QueryUtils = require('../QueryUtils');
var EventEmitterExt = require('../../core/EventEmitterExt');
var CallChainer = require('../../core/CallChainer');
var QueryCall = require('../../core/Utils').QueryCall;
var JSONUtils = require('../JSONUtils');

var ensureData = QueryUtils.Wrapper(function(user, network_id, social_id) {
    var _config = this.manager.core.config();
    var _dataGate = this.manager.core.dataGate;
    var _logger = this.manager.core.logger;

    var chainer = new CallChainer();
    var result = null;
    if (!_config.cache().disabled)
        chainer.add(function(emitter) {
            _logger.info('getting processed user data from cache...');
            QueryCall(_dataGate, 'getCache', [network_id, social_id])
                .done(function(err, cache) {
                    if (err)
                        _logger.error("[getCache]" + err);
                    if (!err && cache && cache.data) {
                        result = {
                            num_changes: cache.num_changes,
                            data: cache.data
                        };
                    }
                    emitter.emit('success');
                })
        });
    chainer.add(function(emitter) {
        if (result)
            return emitter.emit('success', result);
        result = {};
        var changes = [];
        _logger.info('getting processed user data from db...');
        new CallChainer()
            .add(function(emitter) {
                  if (_config.db().no_changelogs)
                    return emitter.emit('success');
                QueryCall(_dataGate, 'getChangeLog', [user])
                    .success(function(changelog) {
                        changes = changelog;
                        emitter.emit('success');
                    })
                    .error(function(error) {
                        emitter.emit('error', error);
                    })
            })
            .add(function(emitter) {
                QueryCall(_dataGate, 'getWorldData', [user])
                    .success(function(data) {
                        if (data) {
                            result.data = data;
                            emitter.emit('success');
                        }
                        else
                            emitter.emit('error', 'У пользователя отсутствует мир!!!');
                    })
                    .error(function(error) {
                        emitter.emit('error', error);
                    })
            })
            .add(function(emitter) {
                _logger.info('getting processed user current room data {owner_id: ' + user.location.map_social_id + ', map_id: ' + user.location.current_room + '}');
                var query = null;
                if (user.location.map_social_id == social_id)
                    query = QueryCall(_dataGate, 'getRoomData', [user, user.location.current_room]);
                else
                    query = QueryCall(_dataGate, 'getActualRoomData', [network_id, user.location.map_social_id, user.location.current_room]);
                query
                    .success(function(data) {
                        result.data.map = data;
                        emitter.emit('success');
                    })
                    .error(function(error) {
                        emitter.emit('error', error);
                    });
            })
            .add(function(emitter) {
                result.num_changes = changes.length;
                result.data = JSONUtils.setArray(result.data, changes);
                emitter.emit('success');
            })
            .add(function(emitter) {
                _dataGate.begin(user.shard).success(function(conn) {
                    var query = QueryCall(_dataGate, 'flushData', [user, result.data, conn]);
                    query.success(function(data) {
                        conn.commit()
                        .success(function() {
                            result.num_changes = 0;
                            emitter.emit('success');
                        })
                        .error(function(error) {
                            conn.rollback();
                            emitter.emit('error', error);
                        })
                        emitter.emit('success');
                    }).error(function(error) {
                        emitter.emit('error', error);
                    });
                }).error(function(err) {
                    emitter.emit('error', error);
                });
            })
            .run()
            .success(function() {
                emitter.emit('success', result);
            })
            .error(function(error) {
                emitter.emit('error', error);
            });
    });
    return chainer.run();
});

module.exports = ensureData;
