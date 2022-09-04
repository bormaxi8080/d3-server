var _ = require('underscore');
var async = require('async');

var HybridIDSetQuery = function(mgr) {
    this.manager = mgr;
};

HybridIDSetQuery.prototype.run = function(link_code, link_id, hybrid_id, callback) {
    var self = this;
    var models = this.manager.models;
    var dataGate = this.manager.core.dataGate;
    var link_shard = dataGate.getShardFor(link_id);
    var hybrid_shard = dataGate.getShardFor(hybrid_id);

    var connections = {};
    var queries = [];

    var begin_transaction = function(shard_id, fn) {
        dataGate.begin(shard_id)
        .success(function(conn) {
            connections[shard_id] = conn;
            fn();
        }).error(fn);
    }

    var commit_transaction = function(shard_id, fn) {
        connections[shard_id].commit()
        .success(function() {
            delete connections[shard_id];
            fn();
        }).error(fn);
    };

    var shards = _.uniq([link_shard, hybrid_shard]);
    var begins = shards.map(function(shard_id) { return begin_transaction.bind(self, shard_id) });
    var commits = shards.map(function(shard_id) { return commit_transaction.bind(self, shard_id) });

    queries.push(function(fn) {
        models.HybridMap.using_shard(link_shard).create(
            { link_code: link_code, link_id: link_id, hybrid_id: hybrid_id },
            null,
            { ts_id: connections[link_shard].id }
        ).success(function(hybrid_map) {
            fn(null, hybrid_map);
        }).error(fn);
    });

    queries.push(function(map, fn) {
        models.HybridID.using_shard(hybrid_shard).find(
            { where: { uid: map.hybrid_id } },
            { ts_id: connections[hybrid_shard].id }
        ).success(function(rec) {
            fn(null, rec);
        }).error(fn);
    });

    queries.push(function(rec, fn) {
        if (!rec)
            return fn({ error: 'undefined hybrid id'}, null);

        var links = JSON.parse(rec.links);
        if (link_code in links)
            return fn({ error: 'duplicate'}, null);

        links[link_code] = link_id;
        rec.links = JSON.stringify(links);
        rec.save(['links'], { ts_id: connections[hybrid_shard].id })
        .success(function(rec) {
            fn(null, rec);
        }).error(fn);
    });

    async.series(begins, function(err) {
        if (err) {
            rollback();
            return callback(err, null);
        }

        async.waterfall(queries, function(err, rec) {
            if (err) {
                rollback();
                return callback(err, null);
            }

            async.series(commits, function(err) {
                if (err) {
                    rollback();
                }
                return callback(err, rec);
            });
        });
    });

    function rollback() {
        for (var shard_id in connections) {
            connections[shard_id].rollback()
        }
    }
};

module.exports = HybridIDSetQuery;
