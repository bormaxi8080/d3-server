/**
 * Модуль переключения текущей комнаты пользователя
 */

var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var Logger = require("../../core/Logger");

var SwitchRoomHandler = function(core, next) {
    this._core = core;
    this._next = next;
};

SwitchRoomHandler.prototype.handle = function(task) {
    var self = this;

    var _map_social_id = task.cmd_params.map_social_id;
    var _map_room_id = task.cmd_params.room_number;

    var curLocation = task.current_location;

    task.error = null;

    if (!_map_social_id || (_map_social_id == curLocation.map_social_id && _map_room_id == curLocation.current_room)) {
        task.next = self._next;
        self.emit("complete", task);
        return;
    }
    task.data.switchRoom(_map_social_id, _map_room_id)
        .success(function(){
            task.next = self._next;
            self.emit("complete", task);
        })
        .error(function(error){
            task.next = "error";
            task.error = error;
            self.emit("complete", task);
        });
};

Mixer.mix(SwitchRoomHandler.prototype, EventEmitter.prototype);

module.exports = SwitchRoomHandler;
