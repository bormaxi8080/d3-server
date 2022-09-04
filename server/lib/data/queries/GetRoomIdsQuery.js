/**
 * @constructor
 */
var getRoomData = function(mgr) {
    var _self = this;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    /**
     * Получить список id комнат пользователя
     *
     * @param social_network
     * @param social_id
     */
    this.run = function(social_network, social_id) {
        var shard_id = mgr.core.dataGate.getShardFor(social_id);
        _models.User.using_shard(shard_id)
            .find({where: {social_network: social_network, social_id: social_id}, attributes: ['id']}, {raw: true})
            .success(function(user) {
                if (!user) {
                    _self.result = [];
                    _self.emit('complete');
                    return;
                }

                _models.RoomData.using_shard(shard_id)
                    .findAll({where: {user_id: user.id}, attributes: ['room_id']}, { raw: true })
                    .success(function(rows) {
                        var res = [];
                        if (rows) {
                            for (var i in rows) {
                                res.push(rows[i].room_id);
                            }
                        }
                        _self.result = res;
                        _self.emit('complete');
                    })
                    .error(function(error) {
                        _self.error = 'DB error: ' + error;
                        _self.emit("error");
                    });
            })
            .error(function(error) {
                _self.error = 'DB error: ' + error;
                _self.emit("error");
            });
    };
};

module.exports = getRoomData;