var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var CallChainer = require("../../core/CallChainer");
var QueryCall = require('../../core/Utils').QueryCall;
var JSONUtils = require('../../data/JSONUtils');
var PrepareUserData = require('../../data/PrepareUserData');
var EventEmitterExt = require("../../core/EventEmitterExt");

var ResetUserHandler = function(core, next) {
    this._core = core;
    var _self = this;
    var _next = next;

    var _task;
    var _params;
    var _user;

    var clearServices = function(network_id, social_id, services) {
        var to_delete = [];
        for (var service_id in services)
            for (var operation_id in services[service_id])
                to_delete.push(operation_id);
        return QueryCall(core.dataGate, "saveServiceChanges", [network_id, social_id, to_delete]);
    };

    this.handle = function(task) {
        _task = task;
        _params = _task.post;
        _user = _task.user;
        var sessionData = _task.data;
        var services = sessionData.getUnusedServices();
        var worldData = PrepareUserData.prepareWorld(this._core, _task.post.social_id);
        worldData.map = PrepareUserData.prepareMap(this._core, _task.post.social_id);

        sessionData.setChanges(worldData, []);
        sessionData.flush(_task.post.social_id, 0)
            .success(function() {
                sessionData.store()
                    .success(function(res) {
                        clearServices(_task.post.social_network, _task.post.social_id, services)
                            .success(function(res) {
                                // BEG корявая чистка данных
                                // Некрасиво, но по-человечески с sequelize удалять сложно...
                                var sequelize = _self._core.modelFactory.dbBasis.shards[_user.shard].connectorManager.sequelize;
                                var n_id = _task.post.social_network;
                                var s_id = _task.post.social_id;

                                // TODO использовать какой-нибудь chainer
                                var sql_1 = "DELETE FROM user_share WHERE share_id IN (SELECT id FROM share WHERE social_id='" + s_id + "' AND network_id=" + n_id + ")";
                                var sql_2 = "DELETE FROM share                    WHERE social_id='" + s_id + "' AND network_id=" + n_id;
                                var sql_3 = "DELETE FROM service_requests         WHERE social_id='" + s_id + "' AND network_id=" + n_id;
                                var sql_4 = "UPDATE users set revision='" + worldData.options.last_version + "' WHERE  id=" + _user['id'];
                                var sql_5 = "DELETE FROM room_data                WHERE room_id > 0 AND user_id=" + _user.id;
                                sequelize.query(sql_1, null, { raw: true})
                                    .success(function(data) {
                                        sequelize.query(sql_2, null, { raw: true})
                                            .success(function(data) {
                                                sequelize.query(sql_3, null, { raw: true})
                                                    .success(function(data) {
                                                        sequelize.query(sql_4, null, { raw: true})
                                                            .success(function(data) {
                                                                sequelize.query(sql_5, null, { raw: true})
                                                                    .success(function(data) {
                                                                        sendResult(200, 'OK');
                                                                    })
                                                                    .error(function(error) {
                                                                        sendResult(500, "ERROR. " + error);
                                                                    })
                                                            })
                                                            .error(function(error) {
                                                                sendResult(500, "ERROR. " + error);
                                                            })
                                                    })
                                                    .error(function(error) {
                                                        sendResult(500, "ERROR. " + error);
                                                    })
                                            })
                                            .error(function(error) {
                                                sendResult(500, "ERROR. " + error);
                                            })
                                    })
                                    .error(function(error) {
                                        sendResult(500, "ERROR. " + error);
                                    });
                                // END корявая чистка данных
                            })
                            .error(function(error) {
                                sendResult(500, "ERROR. " + error);
                            });
                    })
                    .error(function(error) {
                        sendResult(500, "ERROR. " + error);
                    });
            })
            .error(function(error) {
                sendResult(500, "ERROR. " + error);
            });
    };

    var sendResult = function(code, body) {
        _task.reply(code, {}, body);
        _task.next = _next;
        _self.emit('complete', _task);
    };
};

Mixer.mix(ResetUserHandler.prototype, EventEmitter.prototype);
module.exports = ResetUserHandler;
