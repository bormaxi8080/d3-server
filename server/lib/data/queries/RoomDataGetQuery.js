/**
 * Модуль для получения данных пользователя из базы
 */

var JSONUtils = require("../JSONUtils");

/**
 * @constructor
 */
var getRoomData = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    /**
     * Получить идентификатор
     *
     * @param network_id    {Number}    Идентификатор социальной сети
     * @param social_id     {String}     Идентификатор пользователя
     */
    this.run = function(user, room_id, conn) {
        conn = conn || {};
        _models.RoomData
            .using_shard(user.shard)
            .find({where: {user_id: user.id, room_id: room_id}}, {ts_id: conn.id})
            .success(function(room) {
                if (!room)
                    return _self.emit('complete');
                JSONUtils.unpack(room.data, function(error, unpacked) {
                    if (error) {
                        _self.error = error;
                        _self.emit('complete');
                        return;
                    }
                    _self.result = JSONUtils.map(unpacked, room, _self.manager.core.config().db().mapping.room);
                    _self.emit('complete');
                })
            })
            .error(function(error) {
                _self.error = 'DB error: ' + error;
                _self.emit("error");
            });
    };
};

module.exports = getRoomData;