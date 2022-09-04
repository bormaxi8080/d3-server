var EventEmitterExt = require("./../core/EventEmitterExt");
var CallChainer = require("./../core/CallChainer");
var PrepareUserData = require("./PrepareUserData");

var QueryCall = require("../core/Utils").QueryCall;

var SessionData = function(core, network_id, social_id, user, session_id, locked_till, world) {
    this.core = core;
    this.user = user;
    this.network_id = network_id;
    this.social_id = social_id;
    this.session_id = session_id;
    this.locked_till = locked_till;
    this.world = world;

    this.dataGate = core.dataGate;
    this.models = core.models;
    this.config = core.config();
    this.logger = core.logger;

    this.world = world;
    this.num_changes = 0;

    this.unused_services = null;
    this.new_services = null;
    this.used_services = null;
    this.changes = [];
}

SessionData.prototype.unlock = function() {
    this.logger.info('unlocking processed user...');
    return QueryCall(this.dataGate, "unlockUser", [this.user, this.session_id]);
};

SessionData.prototype.fetch = function(map_social_id, current_room) {
    var self = this;
    var user = this.user;
    return new CallChainer().add(function(emitter) {
        if (!self.session_id) {
            return emitter.emit('error', "user isn't locked");
        }
        if (map_social_id != user.location.map_social_id || current_room != user.location.current_room) {
            QueryCall(self.dataGate, "ensureData", [user, self.network_id, self.social_id])
            .success(function(res){
                self.world = res.data;
                self.num_changes = res.num_changes;
                self.switchRoom(map_social_id, current_room)
                .success(function(){
                    return emitter.emit('success');
                })
                .error(emitter.emit.bind(emitter, "error"));
            })
            .error(emitter.emit.bind(emitter, "error"));
        } else {
            return emitter.emit('success');
        }
    }).add(function(emitter) {
        if (self.world) {
            return emitter.emit('success');
        }
        QueryCall(self.dataGate, "ensureData", [user, self.network_id, self.social_id])
        .success(function(res) {
            self.world = res.data;
            self.num_changes = res.num_changes;
            emitter.emit('success');
        })
        .error(function(error) {emitter.emit('error', error)});
    }).add(function(emitter) {
        QueryCall(self.dataGate, "getUnusedServices", [self.network_id, self.social_id])
        .success(function(unused) {
            self.unused_services = unused;
            emitter.emit('success');
        })
        .error(function(error) {emitter.emit('error', error);});
    }).run();
};

SessionData.prototype.store = function() {
    var self = this;
    var user = this.user;
    var changes = this.changes;
    self.logger.info("storing processed user changes (+" + (changes ? changes.length : 0) + "=" + (this.num_changes || 0) + ")...");

    var conn = null;
    return new CallChainer().add(function(emitter) {
        if (self.locked_till <= Date.now()) {
            return emitter.emit('error', "user lock is invalid");
        }

        if (changes && changes.length > 0) {
            self.dataGate.begin(user.shard)
            .success(function(_conn) {
                var operation = null;
                if (self.config.db().no_changelogs) {
                    operation = QueryCall(self.dataGate, "flushData", [user, self.world, _conn]);
                } else {
                    operation = QueryCall(self.dataGate, "addChangeLog", [user, self.changes, _conn]);
                }
                operation
                .success(function() {
                    conn = _conn;
                    emitter.emit("success", conn);
                })
                .error(function(error) {
                    conn && conn.rollback();
                    emitter.emit("error", error);
                })
            })
            .error(function(error) {
                emitter.emit("error", error);
            })
        } else {
            emitter.emit('success', null);
        }
    }).add(function(emitter) {
        var use_services = [];
        for (var svc_id in self.used_services)
            for (var op_id in self.used_services[svc_id])
                use_services.push(op_id)
        QueryCall(self.dataGate, "saveServiceChanges", [self.network_id, self.social_id, use_services, self.new_services, null, conn])
        .success(function(res) {
            emitter.emit("success", res);
        })
        .error(function(error) {
            conn && conn.rollback();
            emitter.emit("error", error);
        })
    }).add(function(emitter) {
        if (conn) {
            conn.commit()
            .success(function(res) {
                emitter.emit("success", res);
            })
            .error(function(error) {
                conn && conn.rollback();
                return emitter.emit('error', error);
            });
        } else {
            emitter.emit("success");
        }
    }).add(function(emitter) {
        if (self.config.cache().disabled)
            return emitter.emit('success');
        self.logger.info('storing data into cache...');
        QueryCall(self.dataGate, "setCache", [self.network_id, self.social_id, {
            num_changes: self.num_changes,
            data: self.world}
        ])
        .done(function(err) {
            if (err) {
                self.logger.error("[setCache]" + err);
            }
            emitter.emit('success');
        })
    }).run();
};

SessionData.prototype.switchRoom = function(target_social_id, target_room_id) {
    var self = this;
    self.logger.info('switching user room to (social_id: ' + target_social_id + ', room_id:' + target_room_id + ')');
    var newRoomData = null;
    return new EventEmitterExt(function(emitter) {
        new CallChainer().add(function(emitter) {
            var query = null;
            if (target_social_id == self.social_id) {
                query = QueryCall(self.dataGate, 'getRoomData', [self.user, target_room_id]);
            } else {
                query = QueryCall(self.dataGate, 'getActualRoomData', [self.network_id, target_social_id, target_room_id]);
            }
            query
            .success(function(data) {
                newRoomData = data;

                if (newRoomData) {
                    emitter.emit('success');
                } else {
                    var roomData = PrepareUserData.prepareMap(self.core, self.social_id, target_room_id);
                    if (roomData) {
                        QueryCall(self.dataGate, 'createRoomData', [self.user, target_room_id, roomData])
                        .success(function(room){
                            newRoomData = room.data;
                            emitter.emit('success')
                        })
                        .error(function(error){
                            emitter.emit('error', error);
                        })
                    }
                }

            })
            .error(function(error) {
                emitter.emit('error', error);
            })
        }).add(function(emitter) {
            self.flush(target_social_id, target_room_id)
                .success(emitter.emit.bind(emitter, 'success'))
                .error(emitter.emit.bind(emitter, 'error'))
        })
        .run().success(function() {
            self.world.map = newRoomData;
            emitter.emit('success');
        })
        .error(emitter.emit.bind(emitter, 'error'))
    }).run();
};

SessionData.prototype.flush = function(map_social_id, current_room) {
    var self = this;
    var location = arguments.length >= 2 ? {
        map_social_id: arguments[0],
        current_room: arguments[1]
    } : {
        map_social_id: self.social_id,
        current_room: self.world.map.options.location.current_room
    };
    return new EventEmitterExt(function(emitter) {
        QueryCall(self.dataGate, 'flushChangeLogs', [self.user, self.social_id, self.world, location])
        .success(function() {
            self.num_changes = 0;
            self.changes = [];
            self.world.map.options.location = location;
            QueryCall(self.dataGate, 'flushExtra', [self.network_id, self.social_id, self.world, location])
                .error(function(error) { self.logger.error("Failed to flushExtra: " + error)});
            emitter.emit('success');
        })
        .error(emitter.emit.bind(emitter, 'error'))
    }).run()
};

SessionData.prototype.getWorld = function() {
    return this.world;
};

SessionData.prototype.setWorld = function(world) {
    this.world = world;
};

SessionData.prototype.getSessionID = function() {
    return this.session_id;
};

SessionData.prototype.getUnusedServices = function() {
    return this.unused_services;
};

SessionData.prototype.getNumChanges = function() {
    return this.num_changes;
};

SessionData.prototype.setChanges = function(world, changes, new_services, used_services) {
    this.world = world;
    this.num_changes -= this.changes.length;
    this.changes = changes instanceof  Array ? changes : [];
    this.num_changes += this.changes.length;
    this.new_services = new_services;
    this.used_services = used_services;
};

SessionData.prototype.expand_lock = function(duration) {
    var self = this;
    return new EventEmitterExt(function(emitter) {
        if (self.locked_till <= Date.now()) {
            return emitter.emit('error', "user lock is invalid");
        }
        QueryCall(self.dataGate, 'lockUserExt', [self.user, duration])
        .success(function() {
            self.locked_till += duration;
            emitter.emit('success');
        })
        .error(emitter.emit.bind(emitter, 'error'));
    }).run()
};

module.exports.lock = function(core, network_id, social_id, sq_session_id, init, no_migrate, callback) {
    var timeout = core.config().db().lock_timeout || 10000;
    var logger = core.logger;

    core.cqueries.ensureUser.run(network_id, social_id, no_migrate, function(err, user_data) {
        if (err) { return callback(err, null) }
        var user = user_data.user;
        var world = user_data.world;
        logger.info("locking processed user...");
        core.cqueries.lockUser.run(user, sq_session_id, init, timeout, function(err, session_id) {
            if (err) { return callback(err, null) }
            callback(null, new SessionData(core, network_id, social_id, user, session_id, Date.now() + timeout / 2, world))
        });
    });
};
