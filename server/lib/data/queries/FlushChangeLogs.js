var QueryUtils = require('../QueryUtils');
var EventEmitterExt = require('../../core/EventEmitterExt');
var CallChainer = require('../../core/CallChainer');
var QueryCall = require('../../core/Utils').QueryCall;

var flushChangeLogs = QueryUtils.Wrapper(function(user, social_id, world, location) {
    var _dataGate = this.manager.core.dataGate;
    var _logger = this.manager.core.logger;
    _logger.info('flushing change log...');

    _logger.warn("save room " + (world.map.options.location.map_social_id == social_id));
    user.location = location ? location : world.map.options.location;
    return new EventEmitterExt(function(emitter) {
        _dataGate
            .begin(user.shard)
            .success(function(conn) {
                QueryCall(_dataGate, 'flushData', [user, world, conn])
                    .success(function() {
                        conn
                            .commit()
                            .success(function() {
                                emitter.emit('success');
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
    }).run();
});

module.exports = flushChangeLogs;