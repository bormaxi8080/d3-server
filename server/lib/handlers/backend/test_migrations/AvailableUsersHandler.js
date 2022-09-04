var crypto = require('crypto');
var async = require('async');
var Mixer = require("../../../core/Mixer");
var Utils = require("../../../core/Utils");
var EventEmitter = require("events").EventEmitter;
var _ = require('underscore');

var AvailableUsersHandler = function(core, next) {
    this._core = core;
    this._next = next;
    this._logger = core.logger;
};

AvailableUsersHandler.prototype.sendResult = function(code, body) {
    this.task.reply(code, {}, JSON.stringify(body));
    this.emit('complete');
};

AvailableUsersHandler.prototype.handle = function(task) {
    var self = this;
    this.task = task;

    var require_params = ['level_from', 'level_to', 'count', 'migration_from', 'migration_to'];
    var _params = this.validate_params(task.post, require_params);
    if (!_params || _params.hasOwnProperty('validate_errors')) {
        return this.sendResult(500, {status: 'error', msg : _params.validate_errors});
    }

    var shards = this._core._cfg.db().shards;
    var userModel = this._core.modelFactory.models.User;
    var conditions = ['(level BETWEEN ? AND ?) AND revision BETWEEN ? AND ?',
        _params.level_from, _params.level_to, _params.migration_from, _params.migration_to];

    var current_count = 0;
    var dataGate = self._core.dataGate;
    var users = [];

    async.eachSeries(Object.keys(shards), function(shard_id, callback) {
        if (current_count >= _params.count) {
            return callback();
        }

        userModel.using_shard(shard_id).findAll({
            where: conditions,
            attributes: ['id', 'revision', 'social_id', 'social_id', 'map_owner', 'map_room'],
            limit: _params.count
        })
        .success(function(found_users) {
            _.each(found_users || [], function(user, id) {
                if (current_count < _params.count) {
                    users.push({
                        id: user.id,
                        shard: shard_id,
                        revision: user.revision,
                        location: user.getLocation(),
                        social_id: user.social_id
                    });
                    current_count++;
                }
            });
            callback();
        })
        .error(callback)
    }, function(err) {
        if (err) {
            self._logger.error(error)
            self.sendResult(500, { status: 'error', msg: error.message });
        } else {
            self.sendResult(200, { status: 'ok', msg: 'OK', available_users: current_count, users: users });
        }
    });
};

AvailableUsersHandler.prototype.validate_params = function(params, require_params) {
    if (Utils.hasBlankFields(params, require_params)) {
        params.validate_errors = 'Params (' + require_params + ') cannot be blank'
        return params;
    }

    if (parseInt(params.level_from) > parseInt(params.level_to)) {
        params.validate_errors = 'level_to cannot be less then level_from'
        return params;
    }

    if (parseInt(params.migration_from) > parseInt(params.migration_to)) {
        params.validate_errors = 'migration_to cannot be less then migration_from'
        return params;
    }

    return params;
}


Mixer.mix(AvailableUsersHandler.prototype, EventEmitter.prototype);
module.exports = AvailableUsersHandler;
