var path = require('path');
var fs = require('fs');

var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var EventEmitterExt = require("../../core/EventEmitterExt");
var CallChainer = require("../../core/CallChainer");
var QueryCall = require("../../core/Utils").QueryCall;
var Utils = require("../../core/Utils");

MigrationsTestHandler = function (core, next) {
    var _self = this;
    this._core = core;
    this._next = next;

    var _task;
    var _dataGate = core.dataGate;
    var _models = this._core.modelFactory._models;

    var _dir_logs = path.normalize('logs/migrate_test/'); // TODO вынести в настройки и брать из конфига
    var _fname;

    var _users_count = null;
    var _processed_count = null;

    var generate_log_file_name = function() {
        var moment = require('moment');
        return 'migrations_test.' + moment().format('YYYYMMDD_HHmmss') + '.log';
    };

    var to_log = function (social_id, level, message) {
        var line  = social_id + ', ' + level + ', ' + message + "\n";
        // Подумать как лучше. Т.к. appendFile скорее всего каждый раз открывает файл.
        fs.appendFileSync(_dir_logs + _fname, line); // сделаем синхронно, чтобы небыло проблем с переименованием
    };

    var log_migrate_func = function (message) {
        fs.appendFileSync(_dir_logs + _fname + '.full', message + "\n");
    };


    var update_process_count =  function() {
        _processed_count++;
        if (_processed_count == _users_count) {
            // Complete
            var fname = path.normalize(_dir_logs + '/' + _fname);
            fs.renameSync(fname, fname + '.done');
        }
    };


    this.handle = function (task) {
        _task = task;
        var params = task.post;
        var result = {status: 'OK'};
        var shard_id;
        var fname;

        Utils.ensureDirSync(_dir_logs);

        if (params['cmd'] == 'start') {
            shard_id = params.shard_id;

            if (!shard_id) {
                sendError('MigrationsTestHandler. params.shard_id is empty.');
                return;
            }

            // проверить, что такой шард существует.
            if (!(shard_id in this._core._cfg.db().shards)) {
                sendError(200, 'MigrationsTestHandler. shard with shard_id "' + shard_id + '" not found.');
                return;
            }

            // Тут надо провести необходимую подготовку
            _fname = generate_log_file_name();

            // Список пользователей.
            _models.User.using_shard(shard_id).findAll({attributes:['id', 'social_network', 'social_id', 'revision']}) // TODO м.б. where/order/limit: 1, ?
            .success(function(users) {
                _users_count = users.length;
                _processed_count = 0;

                if (_users_count == 0) {
                    // Нет пользователей для мигрирования
                    sendError('No users on shard ' + shard_id + '.');
                    return;
                }

                result['fname'] = _fname;
                result['fname_full'] = _fname + '.full';
                result['users_count'] = _users_count;
                sendResult(200, result);

                for (var i in users) {
                    var u = users[i];
                    if (u['revision'] && u['revision'] >= _dataGate.migration.last_version) {
                        to_log(u['social_id'], 'INFO', 'have last_version.')
                        update_process_count();
                        continue;
                    }

                    // ???Возможно, есть смысл забирать даные сразу навсех пользователей, а не по 1.
                    // Но тут надо померять запуск в несколько потоков и схему распределения
                    // Плюс у нас есть вариант, что пользователь может быть уже мигрированным
                    // Транзакции можно убрать, т.к. мы только читаем.

                    runMigrates (shard_id, u['id']);
                }
            })
            .error(function(error) {sendError('DB error: ' + error);});
        } else if (params['cmd'] == 'get_list') {
            result['list']  = formList();
            sendResult(200, result);
        } else if (params['cmd'] == 'get_log') {
            fname = path.normalize(_dir_logs + '/' + params['fname']);

            if (!fs.existsSync(fname)) {
                if (!fs.existsSync(fname + '.done')) {
                    sendError('File "' + fname + '" not found.');
                    return;
                } else {
                    fname = fname + '.done';
                }
            }

            result['fname'] = fname;
            result['body']  = fs.readFileSync(fname, 'utf8');
            sendResult(200, result);
        } else if (params['cmd'] == 'rm_log') {
            fname = path.normalize(_dir_logs + '/' + params['fname']);

            if (!fs.existsSync(fname)) {
                if (!fs.existsSync(fname + '.done')) {
                    sendError('File "' + fname + '" not found.');
                    return;
                } else {
                    fname = fname + '.done';
                }
            }

            fs.unlinkSync(fname);
            result['fname'] = fname;
            result['list']  = formList();
            sendResult(200, result);
        } else {
            sendError('Unknown cmd.');
        }
    };

    var runMigrates = function(shard_id, user_id) {
        _dataGate.begin(shard_id)
            .success(function(conn) {
                _models.User.using_shard(shard_id)
                    .find({where: {id: user_id}}, {ts_id: conn.id})
                    .success(function(user) {
                        var _user = {shard: shard_id, id: user.id, location: user.getLocation(), social_id: user.social_id};
                        // Не лочим пользователя, т.к. мы не исзменяем данные
                        QueryCall(_dataGate, "stateGet", [_user, conn])
                            .success(function(data) {
                                var from_rev = user.revision || data.world.options.last_version;
                                var is_test = true;

                                to_log(user['social_id'], 'INFO', 'start migrate from ' + from_rev);

                                if (!_self._core.dataGate.migration.execute(from_rev, data.world, data.rooms, _self._core.batchRunnerMigrationFactory, _self._core.config(), is_test, to_log, log_migrate_func)) {
                                    to_log(user['social_id'], 'FAIL', 'migrating from ' + from_rev);
                                } else {
                                    to_log(user['social_id'], 'INFO', 'migrated success');
                                }
                                update_process_count();
                                conn.commit();
                            })
                            .error(function(error) {
                                conn.rollback();
                                update_process_count();
                                sendError('DB error: ' + error);
                            });
                        // END QueryCall(_dataGate, "stateGet", [_user, conn])
                    })
                    // if error on _models.User.using_shard(shard_id).find
                    .error(function(error) {
                        conn.rollback();
                        update_process_count();
                        sendError('DB error: ' + error);
                    });
                // END _models.User.using_shard(shard_id)
            })
            // if error on _dataGate.begin(shard)
            .error(function(error) {
                update_process_count();
                sendError('DB error: ' + error);
            });
        // END _dataGate.begin(shard_id)
    }; // END var runMigrates = function(shard_id, user_id) {

    var formList = function() {
        var log_list = fs.readdirSync(_dir_logs);
        var list = [];

        for (var i in log_list) {
            if (log_list[i].indexOf('migrations_test') != -1) {
                list.push(log_list[i]);
            }
        }
        list.sort().reverse();

        return list;
    };

    var sendError = function (msg) {
        var result = {
            status: 'ERROR',
            msg: msg
        };

        sendResult(200, result);
    };

    var sendResult = function (code, body) {
        if (typeof body == 'object') {
            body = JSON.stringify(body);
        }
        _task.reply(code, {}, body);
        _self.emit('complete', null);
     };

}; // END MigrationsTestHandler

Mixer.mix(MigrationsTestHandler.prototype, EventEmitter.prototype);

module.exports = MigrationsTestHandler;
