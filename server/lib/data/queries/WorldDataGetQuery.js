/**
 * Модуль для получения данных пользователя из базы
 */

var JSONUtils = require("../JSONUtils");

/**
 * @constructor
 */
var getWorldData = function(mgr) {
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
    this.run = function(user, conn) {
        conn = conn || {};

        process.nextTick(function(){
            _self.manager.core.dataGate.getQueryChainer()
                .add(_models.User.using_shard(user.shard).find(user.id, {ts_id: conn.id}))
                .add(_models.WorldData.using_shard(user.shard).find({where:{user_id: user.id}}, {ts_id: conn.id}))
                .run()
                .success(function(res) {
                    if (res[0] && res[1]) {
                        _self.result = JSON.parse(res[1].data);
                        _self.result = JSONUtils.map(_self.result, res[0], _self.manager.core.config().db().mapping.user);
                        _self.result = JSONUtils.map(_self.result, res[1], _self.manager.core.config().db().mapping.world);
                    }
                    _self.emit('complete');
                })
                .error(function(error) {
                    _self.error = 'DB error: ' + error;
                    _self.emit("error");
                });
        });

    };
};
module.exports = getWorldData;
