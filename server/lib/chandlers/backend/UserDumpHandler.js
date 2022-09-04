var QueryCall = require("../../core/Utils").QueryCall;
var async = require('async');

var UserDumpHandler = function(core) {
    this.core = core;
    this.manager = core.queryFactory;
    this.models = this.manager.models;
    this.dataGate = core.dataGate;
    this.logger = core.logger;
    this.task = null;
};

UserDumpHandler.prototype.handle = function(task, callback) {
    var self = this;
    var params = task.post;

    this.task = task;
    this.social_network = params['social_network'];
    this.social_id = params['social_id'] || 0;
    this.to_social_id = params['to_social_id'] || 0;
    this.room_id = params['room_id'] || 0;

    if (this.social_id != 0) {
        this.shard_id = this.dataGate.getShardFor(this.social_id);
        this.loadDump({
            where: { social_id: this.social_id }
        }, function(err, dump) {
            if (err) {
                self.handleError(err, 'user_dump_error');
                return callback(err, null);
            }
            self.replySuccess(dump);
            callback(null, null);
        });
    } else {
        this.handleError(new Error('social_id_not_set'), 'user_dump_error');
        return callback(null, null);
    }
};

UserDumpHandler.prototype.replySuccess = function(body) {
    this.task.reply(200, {}, body);
};

UserDumpHandler.prototype.handleError = function(err, msg) {
    if (err) this.logger.error('UserDumpHandler error', err);
    this.task.reply(200, {}, { error_code: msg });
};

UserDumpHandler.prototype.loadDump = function(options, callback) {
    var self = this;
    var stack = [];

    stack.push(function(fn) {
        self.models.User.using_shard(self.shard_id)
        .find(options).success(function(res) {
            if (!res) return fn(new Error('User not found'), null);

            var user = {
              id: res.id,
              social_id: res.social_id,
              social_network: res.social_network,
              shard: self.shard_id,
              banned: res.banned,
              revision: res.revision,
              location: {
                  map_social_id: res.social_id, current_room: self.room_id
              }
            };

            fn(null, user);
        }).error(fn);
    });

    stack.push(function(user, fn) {
        QueryCall(self.dataGate, "ensureData",
            [user, user.social_network, user.social_id, user.social_id]
        ).success(function(res) {
            if (!res.data) {
                var err = new Error('User data is empty');
                self.handleError(err, 'user_dump_error');
            }
            var dump = res.data;

            self.changeSocialID(dump, self.social_id, self.to_social_id);
            fn(null, dump);
        }).error(fn);
    });

    async.waterfall(stack, function(err, dump) {
        if (err) {
            self.handleError(err, 'user_dump_error');
            return callback(err, null);
        }
        return callback(err, dump);
    });
};

UserDumpHandler.prototype.changeSocialID = function(dump, from_social_id, to_social_id) {
    if (to_social_id == 0) {
        return false;
    }

    for (var id in dump) {
        var item = dump[id];
        if (typeof item == 'object') {
            this.changeSocialID(item, from_social_id, to_social_id);
        } else if (item == from_social_id) {
            dump[id] = to_social_id;
        }
    }
};

module.exports = UserDumpHandler;
