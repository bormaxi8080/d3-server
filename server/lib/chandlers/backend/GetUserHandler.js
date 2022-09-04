var async = require('async');
var util = require('util');

var GetUserHandler = function(core) {
    this.core = core;
    this.logger = core.logger;
};

// get user by social_id, nick, facebook_id, hybrid_id
GetUserHandler.prototype.handle = function(task, callback) {
    this.task = task;

    var self = this;
    var cqueries = this.core.cqueries;
    var params = task.post;
    var social_network = task.post.social_network;
    var network_code = task.post.network_code;
    var social_id = task.post.social_id;
    var networks = ['GC', 'LC', 'FB'];

    if (!network_code) {
        var err = new Error('Network not selected');
        this.handleError('network_code_not_set');
        return callback(null, null);
    }

    this.logger.info(util.format('get user from [%s] by [%s] ', network_code, social_id));

    if (network_code == 'Hybrid') {
        cqueries.getUser.run(social_network, social_id, true, function(err, user) {
            if (user) {
                self.replySuccess({
                    social_id:      user.social_id,
                    client_type:    user.client_type,
                    version:        user.version
                });
            } else {
                self.handleError(err, 'user_not_found');
            }
            return callback(err, null);
        });
    }

    else if (networks.indexOf(network_code) >= 0) {
        async.waterfall([
            function(fn) {
                cqueries.getHybridID.run(network_code, social_id, fn);
            },
            function(hybrid_id, fn) {
                if (hybrid_id) {
                    cqueries.getUser.run(social_network, hybrid_id, true, fn);
                } else {
                    var err = new Error('Hybrid id not found');
                    self.handleError(err, 'hybrid_id_not_found');
                    fn(err);
                }
            }
        ], function(err, user) {
            if (user) {
                self.replySuccess({
                    social_id:      user.social_id,
                    client_type:    user.client_type,
                    version:        user.version
                });
            } else {
                self.handleError(err, 'user_not_found');
            }
            return callback(err, null);
        });
    }

    else {
        var err = new Error('Unknown network code');
        self.handleError(err, 'unknown_network_code');
        return callback(err, null);
    }
};

GetUserHandler.prototype.replySuccess = function(msg) {
    this.task.reply(200, {}, msg);
};

GetUserHandler.prototype.handleError = function(err, msg) {
    if (err) this.logger.error('GetUserHandler error', err);
    this.task.reply(200, {}, { error_code: msg });
};

module.exports = GetUserHandler;
