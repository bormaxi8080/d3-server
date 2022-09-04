var QueryUtils = require('../QueryUtils');
var EventEmitterExt = require('../../core/EventEmitterExt');
var CallChainer = require('../../core/CallChainer');
var QueryCall = require('../../core/Utils').QueryCall;
var JSONUtils = require('../JSONUtils');

var FlushData = QueryUtils.Wrapper(function(user, world, conn) {
    var _config = this.manager.core.config();
    var _dataGate = this.manager.core.dataGate;

    var worldData = JSONUtils.copy(world);
    delete worldData.map;

    var chainer = _dataGate.getQueryChainer();
    if (!_config.db().no_changelogs)
        chainer.add(QueryCall(_dataGate, 'clearChangeLog', [user, conn]));
    if (world.map.options.location.map_social_id == user.social_id)
        chainer.add(QueryCall(_dataGate, 'setRoomData', [user, world.map.options.location.current_room, world.map, conn]));
    chainer.add(QueryCall(_dataGate, 'setWorldData', [user, worldData, conn]));

    return chainer.run()
});

module.exports = FlushData;
