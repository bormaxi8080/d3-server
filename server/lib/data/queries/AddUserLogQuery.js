var AddUserLogQuery = function(mgr)
{
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = null;
    this.error = null;

    this.run = function(network_id, social_id, reason, log) {
        _models.User
            .using(social_id)
            .find({ where: {social_network: network_id, social_id: social_id}})
            .success(function(user) {
                if (!user)
                {
                    onError('Пользователь не найден!');
                    return;
                }
                _models.UserLog
                    .using(social_id)
                    .create({user_id: user.id, reason: reason, data: log})
                    .success(function(row) {_self.emit('complete');})
                    .error(onDBError);
            })
            .error(onDBError);
    };

    var onDBError = function(error) {
        onError('DB error: ' + error);
    };

    var onError = function(error) {
        _self.error =  error;
        _self.emit("error");
    };
};

module.exports = AddUserLogQuery;