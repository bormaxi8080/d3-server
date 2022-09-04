var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var taskUtils = require('./utils.js');

var SequelizeSharded = null;
var _ = null;
var dbShards = null;

var PROJECT_PATH = fs.realpathSync(__dirname + '/../');

var coreMigrationsPath;
var projectMigrationsPath;
var dbCfg;
var cacheCfg;

// Делаем так, чтобы при неустановленом sequelize и pg не было проблем с jake depends
var init = function(isMigrate) {
    process.chdir(PROJECT_PATH);
    _ = require('underscore')
    SequelizeSharded = require("../lib/core/data/SequelizeSharded");
    var config_path = path.join(process.cwd(), 'config');
    var Config = require("../lib/core/Config");
    coreMigrationsPath = path.normalize(path.join(__dirname, '../migrations'));
    projectMigrationsPath = path.normalize(path.join(PROJECT_PATH, 'migrations/scheme'));
    dbCfg = Config.db_config(config_path);
    cacheCfg = Config.cache_config(config_path);

    //if task equal migrate then disable pool connection
    if (isMigrate)
        delete dbCfg.db.common.params.pool;
    dbShards = new SequelizeSharded(dbCfg);
};

var echoCmd = function(msg) {
    return "echo " + (!process.platform.match(/^win/) ? '"' + msg + '"' : msg)
};

var EventEmitter = require('events').EventEmitter;
var checkDB = function(cfg) {
    var emitter = new EventEmitter();
    var db = dbCfg.db[cfg.db_cfg];
    var cmd = "";
    if (db.password)
        cmd += 'PGPASSWORD=' + db.password + ' ';
    cmd += 'psql -U ' + db.username + ' -h ' + db.params.host + ' -p ' + db.params.port + ' -c "\\echo test" ' + cfg.db;
    exec(cmd, function(error, stdout, stderr) {
        if (error || !stdout.match('test'))
            emitter.emit('error');
        else
            emitter.emit('success');
    });
    return emitter;
};

namespace('db', function() {
    desc('Проверка соединения с базами данных');
    task('validate_db', [], function() {
        init();
        var db_recs = [];
        for (var id in dbCfg.shards)
            db_recs.push({id: id, cfg: dbCfg.shards[id]});
        for (var extra_id in dbCfg.extra)
            db_recs.push({id: extra_id, cfg: dbCfg.extra[extra_id]});

        var checkNextDB = function() {
            if (!db_recs.length) {
                console.log(taskUtils.green+"validate_db done"+taskUtils.reset);
                return complete();
            }

            var db_rec = db_recs.shift();
            checkDB(db_rec.cfg)
                .on('success', function() {
                    console.log(taskUtils.green+"validate_db done for ",db_rec.id,taskUtils.green);
                    checkNextDB();
                })
                .on('error', function() {
                    fail("failed to connect to " + db_rec.id);
                });
        };
        checkNextDB();
    }, true);

    desc('Проверка соединения с кэшом');
    task('validate_cache', [], function() {
        init();
        if (cacheCfg.disabled)
            return complete();
        init();
        var Memcached = require('memcached');
        var memcached = new Memcached( cacheCfg.host, {poolSize: 100, retries: 1});
        memcached.version( function( err, result ){
            if( err )
                fail('memcached error');
            else {
                console.log(taskUtils.green+"validate_cache done"+taskUtils.reset);
                complete();
            }
            memcached.end();
        });
    }, true);

    desc('Пересоздание баз данных');
    task('recreate', ['drop', 'create', 'migrate'], function(params) {
        init();
        console.log(taskUtils.green + "recreate done" + taskUtils.reset);
        complete();
    }, true);


    desc('Очистка кэша');
    task('flush_cache', [], function() {

        init();

        var hostList = cacheCfg.host.slice();

        var flushOnce = function()
        {
            if (hostList.length == 0)
            {
                return complete();
            }

            var host = hostList.pop();
            var hostStr = host.split(":").join(" ");

            jake.exec(
                echoCmd('flush_all') + '| nc ' + hostStr + ' -w 1',
                function()
                {
                    console.log(taskUtils.green + hostStr + " flush_cache done" + taskUtils.reset);
                    flushOnce();
                },
                {stderr: true}
            );
        };

        flushOnce();
    }, true);

    desc('Удаление баз данных');
    task('drop', [], function(hard) {
        hard = (hard == true || hard == "true");
        init();

        var db_recs = [];
        for (var id in dbCfg.shards)
            db_recs.push({id: id, cfg: dbCfg.shards[id]});
        for (var extra_id in dbCfg.extra)
            db_recs.push({id: extra_id, cfg: dbCfg.extra[extra_id]});

        var dropNextDB = function() {
            if (!db_recs.length) {
                console.log('drop done');
                return complete();
            }

            var db_rec = db_recs.shift();
            console.log('dropping "' + db_rec.id + '" in db "' + db_rec.cfg.db + '"');
            checkDB(db_rec.cfg)
                .on('success', function() {
                    if (hard) {
                        var db = dbCfg.db[db_rec.cfg.db_cfg];
                        var cmd = echoCmd('DROP DATABASE IF EXISTS ' + db_rec.cfg.db + ';') + " | ";
                        if (db.password)
                            cmd += 'PGPASSWORD=' + db.password;
                        cmd += ' psql -U ' + db.username + ' -h ' + db.params.host + ' -p ' + db.params.port + ' postgres';
                        jake.exec(cmd, function() {
                            dropNextDB();
                        }, {stderr: true});
                    }
                    else {
                        dbShards.shards[db_rec.id].getQueryInterface().dropAllTables()
                            .success(function() {
                                console.log('all tables in "' + db_rec.id + '" is dropped');
                                dropNextDB();
                            })
                            .error(function(error) {
                                fail('failed to drop tables in "' + db_rec.id + '": ' + error);
                            })
                    }
                })
                .on('error', function() {
                    console.log('skipped unexisting "' + db_rec.id + '"');
                    dropNextDB();
                });
        };
        dropNextDB();
    }, true);


    desc('Создание баз данных');
    task('create', [], function(params) {
        init();

        var db_recs = [];
        for (var id in dbCfg.shards)
            db_recs.push({id: id, cfg: dbCfg.shards[id]});
        for (var extra_id in dbCfg.extra)
            db_recs.push({id: extra_id, cfg: dbCfg.extra[extra_id]});

        var createNextDB = function() {
            if (!db_recs.length) {
                console.log('create done');
                return complete();
            }

            var db_rec = db_recs.shift();
            console.log('creating "' + db_rec.id + '" in db "' + db_rec.cfg.db + '"');
            checkDB(db_rec.cfg)
                .on('success', function() {
                    console.log('skipped existing "' + db_rec.id + '"');
                    createNextDB();
                })
                .on('error', function() {
                    var db = dbCfg.db[db_rec.cfg.db_cfg];
                    var cmd = echoCmd('CREATE DATABASE ' + db_rec.cfg.db + ';') + " | ";
                    if (db.password)
                        cmd += 'PGPASSWORD=' + db.password;
                    cmd += ' psql -U ' + db.username + ' -h ' + db.params.host + ' -p ' + db.params.port + ' postgres';
                    jake.exec(cmd, function(res) {
                        createNextDB();
                    }, {stderr: true});
                });
        };
        createNextDB()
    }, true);

    desc('Инициализация баз данных');
    task('seed', [], function(params) {
        init();
        return complete();
    }, true);

    desc('Миграции баз данных');
    task('migrate', [], function(params) {
        init(); //send method init(isMigrate) for create db connect without pool connection

        var db_recs = [];
        for (var id in dbCfg.shards)
            db_recs.push({id: id, path: coreMigrationsPath});
        for (var extra_id in dbCfg.extra)
            db_recs.push({id: extra_id, path: path.join(projectMigrationsPath, "extra", extra_id)});
        var db_rec = null;

        var fibers = require('fibers');
        fibers(function() {
            var fiber = fibers.current;
            var conns = {};
            var conn = null;
            var lastErr = null;

            for (var i in db_recs) {
                if (lastErr)
                    break;
                db_rec = db_recs[i];

                console.log('START migrate "' + db_rec.id + '"');

                var dbShard = dbShards.shards[db_rec.id];

                dbShards.transaction(db_rec.id, function(ts, err) {
                    if (!err)
                        conns[db_rec.id] = ts;
                    else
                        lastErr = err;
                    fiber.run();
                });
                fibers.yield();
                if (lastErr)
                    break;

                var migratorOptions = { path: db_rec.path };
                var migrator = dbShard.getMigrator(migratorOptions);

                migrator
                    .migrate(null, {ts_id: conns[db_rec.id].id})
                    .success(function() {
                        console.log('COMPLETE migrate "' + db_rec.id + '"');
                        fiber.run();
                    })
                    .error(function(err) {
                        lastErr = err;
                        fiber.run();
                    });
                fibers.yield();
            }

            if (!lastErr) {
                for (var i in db_recs) {
                    if (lastErr)
                        break;
                    db_rec = db_recs[i];
                    conn = conns[db_rec.id];
                    if (!conn)
                        continue;
                    conn.commit(function(ts, err) {
                        lastErr = err;
                        fiber.run();
                    });
                    fibers.yield();
                }
            }

            if (lastErr) {
                for (var i in db_recs) {
                    db_rec = db_recs[i];
                    conn = conns[db_rec.id];
                    if (!conn)
                        continue;
                    conn.rollback(function(ts, err) {
                        fiber.run();
                    });
                    fibers.yield();
                }

                return fail('ERROR while migrate "' + db_rec.id + '": ' + lastErr);
            }

            return complete();
        }).run();
    }, true);

    desc('Проверка на невыполненные миграции')
    task('undone_migrations', [], function(){
        init();

        var fibers = require('fibers');
        fibers(function(){
            var fiber = fibers.current;
            var conns = {};
            var conn = null;
            var lastErr = null;
            var previous_count_migrations = null;
            var previous_shard = null;

            for (var id in dbCfg.shards) {
                if (lastErr)
                    break;

                var dbShard = dbShards.shards[id];

                var migratorOptions = { path: coreMigrationsPath };
                var migrator = dbShard.getMigrator(migratorOptions);

                migrator
                    .getUndoneMigrations(function(err, migrations){
                        if (err) {
                            lastErr = err;
                            fiber.run();
                        }
                        else {
                            if (previous_count_migrations != null && previous_count_migrations != migrations.length) {
                                console.log('-1');
                                lastErr = 'Failed! Shard ' + previous_shard + ' have ' + previous_count_migrations
                                    + ' undone migrations. But shard ' + id + ' have ' + migrations.length + ' undone migrations';
                            }
                            previous_count_migrations = migrations.length;
                            previous_shard = id;
                            fiber.run();
                        }
                    });
                fibers.yield();
            }
            if (!lastErr)
                console.log(previous_count_migrations)
            return complete();
        }).run();

    }, true);

    desc('Откат миграции до указаной (включительно). (jake db:rollback[date]) date - дата из имени файла. Формат - YYYYMMDDHHmmss.');
    task('rollback', [], function(param) {
        init();

        var from = null;
        if (param && param.match(/^\d{14}$/)) {
            from = param;
        }
        else {
            throw new Error('ERROR. Bad date to db:downgrade');
        }

        var db_recs = [];
        for (var id in dbCfg.shards)
            db_recs.push({id: id, path: coreMigrationsPath});
        for (var extra_id in dbCfg.extra)
            db_recs.push({id: extra_id, path: path.join(projectMigrationsPath, "extra", extra_id)});
        var db_rec = null;

        var fibers = require('fibers');
        fibers(function() {
            var fiber = fibers.current;
            var conns = {};
            var conn = null;
            var lastErr = null;

            for (var i in db_recs) {
                if (lastErr)
                    break;
                db_rec = db_recs[i];

                console.log('START rollback db "' + db_rec.id);

                dbShards.transaction(db_rec.id, function(ts, err) {
                    if (!err)
                        conns[db_rec.id] = ts;
                    else
                        lastErr = err;
                    fiber.run();
                });
                fibers.yield();
                if (lastErr)
                    break;

                var dbShard = dbShards.shards[db_rec.id];
                var migratorOptions = {
                    method: 'down',
                    path: db_rec.path,
                    from: from
                };

                var migrator = dbShard.getMigrator(migratorOptions);

                dbShard.migrator.findOrCreateSequelizeMetaDAO(null, {ts_id: conns[db_rec.id].id})
                    .success(function(Meta) {
                        Meta.find({ order: 'id DESC' }, {ts_id: conns[db_rec.id].id})
                            .success(function(meta) {
                                if (meta) {
                                    var opts = _.extend(meta, migratorOptions);
                                    migrator = dbShard.getMigrator(opts, true);
                                    migrator.migrate(opts, {ts_id: conns[db_rec.id].id})
                                        .success(function() {
                                            console.log('COMPLETE downgrade db ' + db_rec.id);
                                            fiber.run()
                                        })
                                        .error(function(err) {
                                            lastErr = err;
                                            fiber.run()
                                        })
                                }
                                else {
                                    console.log('No migrations for downgrade db ' + db_rec.id);
                                    fiber.run()
                                }
                            })
                            .error(function(err) {
                                lastErr = err;
                                fiber.run()
                            })
                    })
                    .error(function(err) {
                        lastErr = err;
                        fiber.run()
                    })
                fibers.yield();
            }

            if (!lastErr) {
                for (var i in db_recs) {
                    if (lastErr)
                        break;
                    db_rec = db_recs[i];
                    conn = conns[db_rec.id];
                    if (!conn)
                        continue;
                    conn.commit(function(ts, err) {
                        lastErr = err;
                        fiber.run();
                    });
                    fibers.yield();
                }
            }

            if (lastErr) {
                for (var i in db_recs) {
                    db_rec = db_recs[i];
                    conn = conns[db_rec.id];
                    if (!conn)
                        continue;
                    conn.rollback(function(ts, err) {
                        fiber.run();
                    });
                    fibers.yield();
                }

                return fail('ERROR while downgrade ' + db_rec.id + ': ' + lastErr);
            }

            return complete();
        }).run();
    }, true);

    desc('Отчистка БД');
    task('truncate', [], function() {
        init();

        console.log('truncate tables');
        var silent = true; // false - для вывода доп. информации

        var Fiber = require('fibers');

        Fiber(function() {
            var fiber = Fiber.current;
            var shard_id;
            var shard;
            var sqls = [];

            for (shard_id in dbCfg.shards) {
                if (!silent) console.log(shard_id);

                shard = dbShards.shards[shard_id];
                sqls = [];
                shard.query('SELECT * FROM pg_catalog.pg_tables', null, { raw: true })
                    .on('success', function(result) {
                        for (var i in result) {
                            if (result[i]['schemaname'] == 'public') {
                                if (result[i]['tablename'] == 'SequelizeMeta') continue; // ??? м.б. пердусмотеть возможность пропускать по списку?
                                sqls.push('truncate ' + result[i]['tablename']);
                            }
                        }
                        fiber.run();
                    })
                    .on('error', function(err) {
                        console.log('ERROR.', err);
                        fiber.run();
                    });
                // END shard.query

                Fiber.yield();

                for (i in sqls) {
                    shard.query(sqls[i], null, { raw: true })
                        .on('success', function(result) {
                            if (!silent) console.log('  [ok]', sqls[i]);
                            fiber.run();
                        })
                        .on('error', function(err) {
                            console.log('ERROR.', err);
                            fiber.run();
                        });
                    // END shard.query(sqls[i], null, { raw: true })
                    Fiber.yield();
                }
            }

            if (!silent) console.log('complete truncate tables');
            complete();
        }).run();

    }, true);

    desc('решардинг');
    task('reshard', ["create", "migrate"], function(from) {
        init();
        var EventEmitterExt = require(path.join(process.cwd(), "../SqWare/node/lib/core/EventEmitterExt"));
        var CallChainer = require(path.join(process.cwd(), "../SqWare/node/lib/core/CallChainer"));
        try {
            var fromCfg = require(path.join(process.cwd(), from));
            var shards_from = Object.keys(fromCfg.shards);
            var dbShardsFrom = new SequelizeSharded(fromCfg);

            var models = {
                ChangeLog: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/ChangeLog")),
                Payment: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/Payment")),
                RoomData: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/RoomData")),
                SavedStates: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/SavedStates")),
                ServiceRequest: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/ServiceRequest")),
                Session: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/Session")),
                Share: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/Share")),
                User: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/User")),
                UserLog: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/UserLog")),
                UserShare: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/UserShare")),
                WorldData: require(path.join(process.cwd(), "../SqWare/node/lib/data/models/WorldData"))
            };
            var user_tables = [
                "ChangeLog",
                "Payment",
                "RoomData",
                "SavedStates",
                "Session",
                "UserLog",
                "WorldData"
            ];
            var other_tables = [
                "ServiceRequest",
                "Share",
                "UserShare"
            ];
            var name = null;
            var fromModels = {};
            for (name in models)
                fromModels[name] = models[name].get(dbShardsFrom);
            var toModels = {};
            for (name in models)
                toModels[name] = models[name].get(dbShards);

            var Fiber = require('fibers');
            var shardChainer = new SequelizeSharded.Utils.QueryChainer();
            shards_from.forEach(function(source_shard_id) {
                shardChainer.add(new EventEmitterExt(function(emitter) {
                    var groupChainer = new SequelizeSharded.Utils.QueryChainer();
                    groupChainer.add(new EventEmitterExt(function(emitter) {
                        fromModels.User.using_shard(source_shard_id).findAll({}, {})
                            .success(function(users) {
                                Fiber(function() {
                                    var fiber = Fiber.current;
                                    users.forEach(function(user) {
                                        console.log("reshading user", user.social_id);
                                        if (dbShardsFrom.getShardFor(user.social_id) != source_shard_id) {
                                            console.log("USER IS NOT IN VALID SHARD!!!");
                                            return;
                                        }
                                        user = user.toJSON();
                                        var userID = user.id;
                                        delete user.id;
                                        var target_shard_id = dbShards.getShardFor(user.social_id);
                                        dbShards.transaction(target_shard_id, function(conn, err) {
                                            if (err)
                                                return fail(err);
                                            toModels.User.using_shard(target_shard_id).create(user, null, { ts_id: conn.id })
                                                .success(function(user) {
                                                    new CallChainer()
                                                        .add(function(emitter) {
                                                            var tables = user_tables.length;
                                                            user_tables.forEach(function(name) {
                                                                fromModels[name].using_shard(source_shard_id).findAll({where: {user_id: userID}})
                                                                    .success(function(datas) {
                                                                        if (datas.length <= 0) {
                                                                            if (--tables <= 0)
                                                                                emitter.emit('success');
                                                                            return;
                                                                        }
                                                                        var count = datas.length;
                                                                        datas.forEach(function(data) {
                                                                            data = data.toJSON();
                                                                            data.user_id = user.id;
                                                                            delete data.id;
                                                                            toModels[name].using_shard(target_shard_id).create(data, null, {ts_id: conn.id})
                                                                                .success(function() {
                                                                                    if (--count <= 0) {
                                                                                        if (--tables <= 0)
                                                                                            emitter.emit('success');
                                                                                    }
                                                                                })
                                                                                .error(fail.bind(null));
                                                                        })
                                                                    })
                                                                    .error(fail.bind(null));
                                                            })
                                                        })
                                                        .add(function(emitter) {
                                                            conn.commit(function(ts, err) {
                                                                if (err)
                                                                    fail(err);
                                                                else
                                                                    emitter.emit('success');
                                                            });
                                                        })
                                                        .run()
                                                        .success(function() {
                                                            fiber.run()
                                                        })
                                                        .error(fail.bind(null));
                                                })
                                                .error(fail.bind(null));
                                        });
                                        Fiber.yield();
                                    });
                                    emitter.emit('success');
                                }).run();
                            })
                    }).run());
                    groupChainer.add(new EventEmitterExt(function(emitter1) {
                        fromModels.ServiceRequest.using_shard(source_shard_id).findAll({}, { })
                            .success(function(requests) {
                                Fiber(function() {
                                    var fiber = Fiber.current;
                                    requests.forEach(function(request) {
                                        request = request.toJSON();
                                        var target_shard_id = dbShards.getShardFor(request.social_id);
                                        delete request.id;
                                        toModels.ServiceRequest.using_shard(target_shard_id).create(request)
                                            .success(function() {
                                                fiber.run();
                                            })
                                            .error(fail.bind(null));
                                        Fiber.yield();
                                    });
                                    emitter1.emit('success');
                                }).run()
                            })
                    }).run());
                    groupChainer.add(new EventEmitterExt(function(emitter) {
                        fromModels.Share.using_shard(source_shard_id).findAll({}, { })
                            .success(function(shares) {
                                Fiber(function() {
                                    var fiber = Fiber.current;
                                    shares.forEach(function(share) {
                                        share = share.toJSON();
                                        var shareID = share.id;
                                        delete share.id;
                                        var target_shard_id = dbShards.getShardFor(share.social_id);
                                        toModels.Share.using_shard(target_shard_id).create(share)
                                            .success(function(share) {
                                                fromModels.UserShare.using_shard(source_shard_id).findAll({share_id: shareID})
                                                    .success(function(user_shares) {
                                                        var count = user_shares.length;
                                                        if (count <= 0) {
                                                            fiber.run();
                                                            return;
                                                        }
                                                        Fiber(function() {
                                                            var fiber = Fiber.current;
                                                            user_shares.forEach(function(user_share) {
                                                                user_share = user_share.toJSON();
                                                                user_share.share_id = share.id;
                                                                delete user_share.id;
                                                                toModels.UserShare.using_shard(target_shard_id).create(user_share)
                                                                    .success(function() {
                                                                        fiber.run();
                                                                    })
                                                                    .error(fail.bind(null));
                                                                Fiber.yield();
                                                            });
                                                        }).run();
                                                    })
                                                    .error(fail.bind(null));
                                            })
                                            .error(fail.bind(null));
                                        dbShards.transaction(target_shard_id, function(conn, err) {
                                            if (err)
                                                return fail(err);
                                        });
                                        Fiber.yield();
                                    });
                                    emitter.emit('success');
                                }).run();
                            })
                    }).run());
                    groupChainer.run()
                        .success(function(){
                            emitter.emit('success');
                        })
                        .error(emitter.emit.bind(emitter, 'error'));
                }).run());
                shardChainer.run()
                    .success(function() {
                        complete();
                    })
                    .error(fail.bind(null));
            });
        }
        catch (e) {
            fail(e.message)
        }
    }, true);

    desc('Чистка просроченных сервисов');
    task('clear_services', [], function() {
        init();

        var model_f = require(path.join(process.cwd(), "../SqWare/node/lib/data/models/ServiceRequest"));
        var model = model_f.get(dbShards);

        var shards_count = 0;
        var shards_processed = 0;
        var shard_id;
        var ts = (new Date()).getTime();

        var checkComplete = function () {
            shards_processed++;
            if (shards_processed == shards_count) {
                console.log('-- complete --');
                complete();
            }
        };

        for (shard_id in dbCfg.shards) {
            shards_count++;
        }

        console.log('shards_count:', shards_count);
        for (shard_id in dbCfg.shards) {
            // TODO сделать по аналогии с ServicesDeleteQuery.js, т.е. с учетом _executor
            model.using_shard(shard_id).delete({where: 'expires_date > 0 and expires_date < ' + ts, limit: "ALL"}, {shard_id: shard_id})
                .success(function(result, dop) {
                    console.log(this.query.options.shard_id + ' removed ' + dop.rowCount + ' rows.');
                    checkComplete();
                })
                .error(function(error) {
                    console.log(error);
                })
        }
    }, true);
});