var GetUserQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.dataGate = mgr.core.dataGate;
};

GetUserQuery.prototype.run = function(network_id, social_id, no_migrate, callback) {
    var self = this;
    var shard_id = self.dataGate.getShardFor(social_id);

    this.models.User
    .using_shard(shard_id)
    .find({ where: { social_network: network_id, social_id: social_id } })
    .success(function(user) {
        if (!user) {
            return callback(null, null);
        }

        var result = {
            social_id: social_id,
            id: user.id,
            shard: shard_id,
            banned: user.banned,
            revision: user.revision,
            location: user.getLocation()
        };

        if (no_migrate) {
            return callback(null, result);
        }

        if (user.revision >= self.dataGate.migration.getLastVersion()) {
            return callback(null, result);
        }

        self.manager.core.cqueries.migrateUser.run(network_id, social_id, function(err, res) {
            if (res) {
                result.revision = res;
            }
            callback(err, result);
        });
    })
    .error(function(err) {
        callback(err, null);
    });
};

module.exports = GetUserQuery;
