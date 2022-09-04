var QueryWrapper = require('../QueryUtils').Wrapper;
var QueryCall = require('../../core/Utils').QueryCall;

var stateSet = QueryWrapper(function(user, data, conn) {
    var dataGate = this.manager.core.dataGate;
    var configDB = this.manager.core.config().db();

    var chainer = dataGate.getQueryChainer();
    if (!configDB.no_changelogs)
        chainer.add(QueryCall(dataGate, 'clearChangeLog', [user, conn]));
    chainer.add(QueryCall(dataGate, 'setWorldData', [user, data.world, conn]));
    for (var id in data.rooms)
        chainer.add(QueryCall(dataGate, 'setRoomData', [user, id, data.rooms[id], conn]));
    return chainer.run()
});

module.exports = stateSet;