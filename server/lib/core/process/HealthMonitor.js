var _ = require('underscore');
var fs = require('fs');
var async = require('async');
var path = require('path');
var exec = require('child_process').exec;
var Memcached = require('memcached');

var MIGRATIONS_PATH = path.join(__dirname, '../../../migrations');

var compact = function(array) {
    return array.filter(function(result) { return !!result; });
};

var HealthMonitor = function(core) {
    this.core = core;
    this.logger = core.logger;
    this.bootstrap = core.bootstrap;
};

HealthMonitor.prototype.check = function(callback) {
    var self = this;
    async.series({
        db_connect: this.check_db_connect.bind(this),
        db_access:  this.check_db_access.bind(this),
        db_migrations: this.check_migrations.bind(this),
        memcached_access: this.check_memcached_access.bind(this)
    }, function(err, results) {
        var result = {
            errors: (err ? [err] : []),
            request_counter: self.bootstrap._requestCounter
        };
        _.each(results, function(errors, name) {
            if (errors.length) {
                result.errors = result.errors.concat(errors);
                result[name] = 'FAIL'
            } else {
                result[name] = 'OK'
            }
        });

        return callback(result);
    });
};

HealthMonitor.prototype.check_db_connect = function(callback) {
    var echo_cmd = function(msg) {
        return "echo " + (!process.platform.match(/^win/) ? '"' + msg + '"': msg)
    };

    var db_config = this.core._cfg.db();
    async.mapSeries(Object.keys(db_config.shards), function(shard_id, cb) {
        var cmd = '';
        var db = db_config.db[db_config.shards[shard_id].db_cfg];

        cmd += echo_cmd("\\echo test") + ' | ';
        if (db.password) {
            cmd += 'PGPASSWORD=' + db.password;
        }
        cmd += ' psql -U ' + db.username + ' -h ' + db.params.host
        cmd += ' -p ' + db.params.port + ' ' + db_config.shards[shard_id].db;

        exec(cmd, function(error, stdout, stderr) {
            if (error || !stdout.match('test')) {
                cb(null, 'db_error. Cannot connect to shard ' + shard_id);
            } else {
                cb(null, null);
            }
        });
    }, function(err, results) {
        callback(null, compact(results));
    });
};

HealthMonitor.prototype.check_db_access = function(callback) {
    var self = this;
    var sql = 'SELECT 1';
    var shards = this.core._cfg.db().shards;
    async.mapSeries(Object.keys(shards), function(shard_id, cb) {
        var sequelize = self.core.modelFactory.dbBasis.shards[shard_id].connectorManager.sequelize;
        sequelize.query(sql, null, { raw: true, shard_id: shard_id })
        .success(function(data) {
            cb(null, null);
        })
        .error(function(error) {
            cb(null, 'db_access. Shard_id: ' + this.options.shard_id + '. Error: ' + error, 'FAIL')
        });
    }, function(err, results) {
        callback(null, compact(results));
    });
};

HealthMonitor.prototype.check_migrations = function(callback) {
    var self = this;
    if (!fs.existsSync(MIGRATIONS_PATH)) {
        callback(null, ['migrations. Folder not found.']);
    } else {
        var list = fs.readdirSync(MIGRATIONS_PATH);
        var max_val = '';
        for (var i in list)  {
            var splitted = list[i].split('-', 2);
            if ((splitted.length == 2) && (splitted[0].length == 14)) {
                if (max_val < splitted[0]) {
                    max_val = splitted[0];
                }
            }
        }

        if (max_val) {
            var shards = this.core._cfg.db().shards;
            var sql = 'SELECT "to" FROM "SequelizeMeta" ORDER BY "id" DESC LIMIT 1'; // В sequelize есть разница между select и SELECT

            async.mapSeries(Object.keys(shards), function(shard_id, cb) {
                var sequelize = self.core.modelFactory.dbBasis.shards[shard_id].connectorManager.sequelize;
                sequelize.query(sql, null, { raw: true, shard_id: shard_id})
                .success(function(data) {
                    if (data.length == 0) {
                        cb(null , 'Migrations not found on shard ' + this.options.shard_id + '.');
                    } else if (data[0]['to'] < max_val) {
                        cb(null, 'Not last migration on shard ' + this.options.shard_id + '.');
                    } else {
                        cb(null, null);
                    }
                })
                .error(function(error) {
                    cb('db_error. Shard_id: ' + this.options.shard_id + '. Error: ' + error);
                });
            }, function(err, results) {
                callback(null, compact(results));
            });
        } else {
            callback(null, []);
        }
    }
};

HealthMonitor.prototype.check_memcached_access = function(callback) {
    var cache_cfg = this.core._cfg.cache();
    var memcached = new Memcached(cache_cfg.host, { poolSize: 100 });
    memcached.version(function(err, res) {
        if (err) {
            callback(null , ['memcached. Error: ' + err])
        } else {
            callback(null, [])
        }
        memcached.end();
    });
};

module.exports = HealthMonitor;
