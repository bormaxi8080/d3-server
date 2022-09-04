var JSONUtils = require("../JSONUtils");

/**
 * @constructor
 */
var createRoomData = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;


    this.run = function(user, room_id, room_data) {
        var room = {};
        room_data = JSONUtils.unmap(room_data, room, _self.manager.core.config().db().mapping.room);
        JSONUtils.pack(room_data, function(error, packed) {
            if (error) {
                _self.error = error;
                _self.emit('complete');
                return;
            }

            room.data = packed;
            room.user_id = user.id;
            room.room_id = room_id;
            var saveFields = Object.keys(room);

            room = _models.RoomData.using_shard(user.shard).build(room, {isNewRecord: true});

            room.save(saveFields)
                .success(function(new_room) {
                    //return room with unpacked data
                    if (new_room) {
                        new_room.data = room_data;
                        _self.result = new_room;
                        _self.emit('complete');
                    } else {
                        _self.error = 'Cannot create room';
                        _self.emit("error");
                    }
                })
                .error(function(error) {
                    _self.error = 'DB error: ' + error;
                    _self.emit("error");
                });
        })
    }
};

module.exports = createRoomData;