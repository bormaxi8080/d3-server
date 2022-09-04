var LockUserQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(user, duration) {
        _models.Session.using_shard(user.shard).QueryInterface
            .update(null, "sessions", {locked:{toString: function(){return "locked + interval '"+duration+" milliseconds'";}}}, {user_id:user.id})
            .success(function(){
                //_self.result = session.session_id;
                return _self.emit('complete');
            })
            .error(function(error){
                _self.error = error;
                return _self.emit("error");
            });
    };
};

module.exports = LockUserQuery;
