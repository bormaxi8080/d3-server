/**
 * Модуль для сохранения данных пользователя в базе
 */

var JSONUtils = require("../JSONUtils");

/**
 * @constructor
 */
var setRoomData = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    /**
     * Сохранить
     *
     * @param user     {String}     Идентификатор пользователя и шарда
     */
    this.run = function(user, room_id, data, conn) {
        conn = conn || {};
        var room = {};
        data = JSONUtils.unmap(data, room, _self.manager.core.config().db().mapping.room);
        JSONUtils.pack(data, function(error, packed) {
            if (error) {
                _self.error = error;
                _self.emit('complete');
                return;
            }

            room.data = packed;
            var saveFields = Object.keys(room);
            room.user_id = user.id;
            room.room_id = room_id;

            room = _models.RoomData.using_shard(user.shard).build(room, {isNewRecord: false});

            room.save(saveFields, {ts_id: conn.id})
                .success(function() {
                    _self.emit('complete');
                })
                .error(function(error) {
                    _self.error = 'DB error: ' + error;
                    _self.emit("error");
                });
        })
    }
};

module.exports = setRoomData;