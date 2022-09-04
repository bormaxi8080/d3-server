/**
 * Модуль для сохранения данных пользователя в базе
 */

var JSONUtils = require("../JSONUtils");

/**
 * @constructor
 */
var setWorldData = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(_user, data, conn) {
        conn = conn || {};

        var user = {};
        JSONUtils.extract(data, user, _self.manager.core.config().db().mapping.user);
        data = JSONUtils.unmap(data, user, _self.manager.core.config().db().mapping.user, false);
        user.map_owner = _user.location.map_social_id;
        user.map_room = _user.location.current_room;
        var userSaveFields = Object.keys(user);
        user.id = _user.id;

        var world = {};
        data = JSONUtils.unmap(data, world, _self.manager.core.config().db().mapping.world, false, true);
        world.data = JSON.stringify(data);
        var worldSaveFields = Object.keys(world);
        world.user_id = _user.id;


        user = _models.User.using_shard(_user.shard).build(user, {isNewRecord: false});
        world = _models.WorldData.using_shard(_user.shard).build(world, {isNewRecord: false});

        var chainer = _self.manager.core.dataGate.getQueryChainer();
        if (userSaveFields.length > 0)
            chainer.add(user.save(userSaveFields, {ts_id: conn.id}));
        if (worldSaveFields.length > 0)
            chainer.add(world.save(worldSaveFields, {ts_id: conn.id}));
        chainer.run()
            .success(function() {
                _self.emit('complete');
            })
            .error(function(error) {
                _self.error = 'DB error: ' + error;
                _self.emit("error");
            });
    }
};
module.exports = setWorldData;

