var async = require('async');
var QueryCall = require('../../core/Utils').QueryCall;

var StatesLoadHandler = function(core, next) {
    this.core = core;
    this.logger = core.logger;
};

StatesLoadHandler.prototype.handle = function(task, callback) {
    var self = this;

    this.task = task;

    var user = task.user;
    var params = task.post;
    var dataGate = this.core.dataGate;
    var cqueries = this.core.cqueries;
    var connection = null;

    var stack = [];

    stack.push(function(fn) {
        dataGate.begin(user.shard).success(function(conn) {
            connection = conn;
            fn(null);
        }).error(fn);
    });

    stack.push(function(fn) {
        cqueries.lockUserTransaction.run(user, connection, function(err, lock) {
            self.logger.info('lock user...');
            fn(err);
        });
    });

    stack.push(function(fn) {
        QueryCall(dataGate, "savedStatesGet", [user, params.id, connection])
        .success(function(data) {
            if (data.world && data.rooms) {
                self.logger.info('load full user state to db...');
                stateData = data;
            } else {
                self.logger.info('load partial user satte to db...');
                if (!data.map) {
                    return fn(new Error('inconsistent saved state!'));
                }
                var rooms = {};
                rooms[0] = data.map;
                delete data.map;
                stateData = {
                    world: data,
                    rooms: rooms
                };
            }
            fn(null, stateData);
        }).error(fn);
    });

    stack.push(function(data, fn) {
        QueryCall(dataGate, "migrateData", [user.revision, data])
        .success(function() {
            fn(null, data);
        }).error(fn);
    });

    stack.push(function(data, fn) {
        QueryCall(dataGate, "stateSet", [user, data, connection])
        .success(function() { fn(); })
        .error(fn);
    });

    stack.push(function(fn) {
        QueryCall(dataGate, "setCache", [params.social_network, params.social_id, null])
        .success(function() { fn(); })
        .error(fn);
    });

    stack.push(function(fn) {
        connection.commit()
        .success(function() { fn(); })
        .error(fn);
    });

    async.waterfall(stack, function(err) {
        if (err) {
            connection.rollback();

            self.handleError(err, 'user_state_load_failed');
            return callback(err, null);
        }

        self.replySuccess('OK');
        callback(null, null);
    });
};

StatesLoadHandler.prototype.replySuccess = function(body) {
    this.task.reply(200, {}, body);
};

StatesLoadHandler.prototype.handleError = function(err, message) {
    if (err) this.logger.error('StatesLoadHandler error', err);
    this.task.reply(200, {}, { error_code: message });
};

module.exports = StatesLoadHandler;
