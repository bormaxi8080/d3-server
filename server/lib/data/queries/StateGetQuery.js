var QueryWrapper = require('../QueryUtils').Wrapper;
var QueryCall = require('../../core/Utils').QueryCall;
var CallChainer = require('../../core/CallChainer');
var JSONUtils = require("../JSONUtils");
var EventEmitterExt = require("../../core/EventEmitterExt");

var stateGet = QueryWrapper(function(user, conn) {
    conn = conn || {};
    var dataGate = this.manager.core.dataGate;
    var configDB = this.manager.core.config().db();
    var models = this.manager.models;

    var changes = [];
    var roomsData = null;
    var worldData = null;
    return new CallChainer()
        .add(function(emitter) {
            var chainer = dataGate.getQueryChainer();
            if (!configDB.no_changelogs)
                chainer.add(QueryCall(dataGate, 'getChangeLog', [user, conn]));
            chainer.add(QueryCall(dataGate, 'getWorldData', [user, conn]));
            chainer.run()
                .success(function(res) {
                    if (configDB.no_changelogs)
                        res.unshift([]);
                    changes = res[0];
                    worldData = res[1];
                    emitter.emit('success', worldData);
                })
                .error(emitter.emit.bind(emitter, 'error'));
        })// get data from db
        .add(function(emitter) {
            models.RoomData.using_shard(user.shard).all({where: {user_id: user.id}}, {ts_id: conn.id})
                .success(function(rooms) {
                    var chainer = dataGate.getQueryChainer();
                    for (var i in rooms) {
                        chainer.add(new EventEmitterExt((function(room, emitter) {
                            JSONUtils.unpack(room.data, function(error, unpacked) {
                                if (error)
                                    return emitter.emit('error', error);
                                var roomData = JSONUtils.map(unpacked, room, configDB.mapping.room);
                                if (user.location.map_social_id == user.social_id &&
                                    user.location.current_room == room.room_id) {
                                    worldData.map = roomData;
                                    worldData = JSONUtils.setArray(worldData, changes);
                                    roomData = worldData.map;
                                    delete worldData.map;
                                }
                                emitter.emit('success', roomData);
                            })
                        }).bind(null, rooms[i])).run());
                    }
                    chainer.run()
                        .success(function(res) {
                            roomsData = {};
                            for (var i in rooms)
                                roomsData[rooms[i].room_id] = res[i];
                            emitter.emit('success', {world: worldData, rooms: roomsData});
                        })
                        .error(emitter.emit.bind(emitter, 'error'));
                })
                .error(emitter.emit.bind(emitter, 'error'));
        })
        .run()
});

module.exports = stateGet;