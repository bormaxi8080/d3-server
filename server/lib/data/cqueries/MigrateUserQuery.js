var QueryCall = require('../../core/Utils').QueryCall;
var JSONUtils = require("../JSONUtils");
var CallChainer = require('../../core/CallChainer');

var MigrateUser = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.dataGate = mgr.core.dataGate;
    this.logger = mgr.core.logger;
    this.core = mgr.core;
};

MigrateUser.prototype.run = function(network_id, social_id, callback) {
    var self = this;
    var shard_id = this.dataGate.getShardFor(social_id);

    this.logger.info('migrating user...');

    this.dataGate.begin(shard_id)
    .success(function(conn) {
        self.models.User
        .using_shard(shard_id)
        .find({where: {social_network: network_id, social_id: social_id}, for: "update"}, {ts_id: conn.id})
        .success(function(user) {
            if (user.revision && user.revision >= self.dataGate.migration.last_version) {
                return callback(null, user.revision);
            }

            user.shard = shard_id;
            user.location = user.getLocation();

            new CallChainer()
            .add(function(emitter) {
                self.logger.info('lock migrating user...');
                self.core.cqueries.lockUserTransaction.run(user, conn, function(err, res) {
                    if (err) {
                        emitter.emit('error', err)
                    }  else {
                        emitter.emit('success', res)
                    }
                })
            })
            .add(function(emitter) {
                self.logger.info('getting migrating user state from db...');
                QueryCall(self.dataGate, "stateGet", [user, conn])
                    .success(function(data) {
                        var from_rev = user.revision;
                        self.logger.info('migrating user from ' + from_rev + '...');
                        var orgData = JSONUtils.clone(data);
                        QueryCall(self.dataGate, "migrateData", [from_rev, data])
                        .success(function() {
                            self.logger.info('setting migrating user state to db...');
                            QueryCall(self.dataGate, "stateSet", [user, data, conn])
                            .success(function() {
                                self.logger.info('backup migrating user state...');
                                QueryCall(self.dataGate, "savedStatesSet", [user, "revision_" + from_rev, orgData, conn])
                                .success(emitter.emit.bind(emitter, 'success'))
                                .error(function(error) {
                                    emitter.emit('error', 'migrating user backup failed:', error);
                                })
                            })
                            .error(emitter.emit.bind(emitter, 'error'));
                        })
                        .error(emitter.emit.bind(emitter, 'error'));
                    })
                    .error(emitter.emit.bind(emitter, 'error'));
            })
            .add(function(emitter) {
                user.revision = self.dataGate.migration.last_version;
                user.save(['revision'], {ts_id: conn.id})
                .success(emitter.emit.bind(emitter, 'success'))
                .error(emitter.emit.bind(emitter, 'error'));
            })
            .add(function(emitter) {
                QueryCall(self.dataGate, 'setCache', [network_id, social_id, null])
                    .success(emitter.emit.bind(emitter, 'success'))
                    .error(emitter.emit.bind(emitter, 'error'));
            })
            .run()
            .success(function() {
                conn.commit()
                .success(function() {
                    callback(null, user.revision);
                })
                .error(callback);
            })
            .error(function(err) {
                conn.rollback();
                callback(err, null);
            });
        })
        .error(function(err) {
            conn.rollback();
            callback(err, null);
        });
    })
    .error(callback);
};

module.exports = MigrateUser;
