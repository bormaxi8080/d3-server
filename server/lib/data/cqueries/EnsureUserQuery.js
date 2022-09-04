var EnsureUserQuery = function(mgr) {
    this.manager = mgr;
    this.logger = mgr.core.logger;
    this.core = mgr.core;
};

EnsureUserQuery.prototype.run = function(network_id, social_id, no_migrate, callback) {
    var self = this;
    this.logger.info('getting processed user...');
    this.core.cqueries.getUser.run(network_id, social_id, no_migrate, function(err, user) {
        if (err) { return callback(err, null) }

        if (user) {
            var till = Math.ceil((user.banned ? user.banned.getTime() - Date.now() : 0) / 1000);
            if (till > 0) {
                return callback({error_code: "user_banned", till: till}, null);
            } else {
                return callback(null, {user: user, world: null});
            }
        } else {
            self.core.cqueries.checkUser.run(network_id, social_id, function(err, links) {
                if (err) { return callback(err, null) }
                self.core.cqueries.createUser.run(network_id, social_id, function(err, user_data) {
                    return callback(err, user_data);
                });
            });
        }
    });
};

module.exports = EnsureUserQuery;
