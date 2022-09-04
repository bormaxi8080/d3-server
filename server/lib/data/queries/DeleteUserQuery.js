var DeleteUserQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(user) {
        //TODO wrap in TRANSACTION BEGIN/END
        var chainer = _self.manager.core.dataGate.getQueryChainer(user.shard);
        chainer.add(_models.User.using_shard(user.shard).delete({where: {id: user.id}, limit: "ALL"}));
        chainer.add(_models.Session.using_shard(user.shard).delete({where: {user_id: user.id}, limit: "ALL"}));
        chainer.add(_models.ChangeLog.using_shard(user.shard).delete({where: {user_id: user.id}, limit: "ALL"}));
        chainer.add(_models.ServiceRequest.using_shard(user.shard).delete({where: {user_id: user.id}, limit: "ALL"}));
        chainer.add(_models.WorldData.using_shard(user.shard).delete({where: {user_id: user.id}, limit: "ALL"}));
        chainer.add(_models.RoomData.using_shard(user.shard).delete({where: {user_id: user.id}, limit: "ALL"}));
        chainer.run()
            .success(function(result) {
                _self.emit('complete');
            })
            .error(onDBError);
    };

    var onDBError = function(error) {
        _self.error = "DB error: " + error;
        _self.emit("error");
    };
};

module.exports = DeleteUserQuery;