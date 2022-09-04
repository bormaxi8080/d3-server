var QueryUtils = require('../QueryUtils');
var EventEmitterExt = require('../../core/EventEmitterExt');

var migrateData = QueryUtils.Wrapper(function(from_rev, data) {
    var core = this.manager.core;
    core.logger.info('migrating data from ' + from_rev + '...');
    return new EventEmitterExt(function(emitter) {
        if (!core.dataGate.migration.execute(from_rev, data.world, data.rooms, core.config()))
            return emitter.emit('error', 'data migration failed');
        delete data.world.map;
        emitter.emit('success');
    }).run()
});

module.exports = migrateData;
