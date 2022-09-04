var JSONUtils = require("../JSONUtils");
var PrepareUserData = require("../PrepareUserData");

var CreateUserQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.dataGate = mgr.core.dataGate;
    this.cfg = mgr.core.config();
};

CreateUserQuery.prototype.run = function(network_id, social_id, callback) {
    var self = this;
    var worldData = PrepareUserData.prepareWorld(this.manager.core, social_id);
    var roomData = PrepareUserData.prepareMap(this.manager.core, social_id);

    var user = {
        social_network: network_id,
        social_id: social_id,
        revision: worldData.options.last_version
    };

    var mappings = this.cfg.db().mapping;
    worldData = JSONUtils.unmap(worldData, user, mappings.user);

    var world = {};
    worldData = JSONUtils.unmap(worldData, world, mappings.world);
    world.data = JSON.stringify(worldData);

    var room = {
        room_id: 0
    };
    roomData = JSONUtils.unmap(roomData, room, mappings.room);
    JSONUtils.pack(roomData, function(error, packed) {
        if (error) {
            return callback(error, null);
        }
        room.data = packed;

        var shard_id = self.dataGate.getShardFor(social_id);
        self.dataGate.begin(shard_id)
        .success(function(conn) {
            var connOnDBError = self.onDBError.bind(self, callback, conn);
            self.models.User
            .using_shard(shard_id)
            .create(user, null, {ts_id: conn.id})
            .success(function(user) {
                world.user_id = user.id;
                room.user_id = user.id;
                self.dataGate.getQueryChainer()
                    .add(self.models.WorldData.using_shard(shard_id).create(world, null, {ts_id: conn.id}))
                    .add(self.models.RoomData.using_shard(shard_id).create(room, null, {ts_id: conn.id}))
                    .run()
                    .success(function() {
                        conn.commit()
                        .success(function() {
                            worldData.map = roomData;
                            callback(null, {
                                user: {
                                    social_id: social_id,
                                    id: user.id,
                                    shard: shard_id,
                                    banned: !!user.banned,
                                    location: user.getLocation()
                                },
                                world: worldData
                            });
                        })
                        .error(connOnDBError);
                    })
                    .error(connOnDBError);
            })
            .error(connOnDBError);
        })
        .error(function(err) {
            self.onDBError(callback, null, err);
        });
    });
};

CreateUserQuery.prototype.onDBError = function(callback, conn, error) {
    if (conn)
        conn.rollback();
    callback('DB error: ' + error, null);
};

module.exports = CreateUserQuery;