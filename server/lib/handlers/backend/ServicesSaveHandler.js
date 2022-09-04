var Mixer = require("../../core/Mixer");
var QueryCall = require("../../core/Utils.js").QueryCall;
var EventEmitter = require("events").EventEmitter;
var tv4 = require("../../tv4.js").tv4;
var path = require("path");
var fs = require("fs");

var SCHEMAS_PATH = '../js/defs/schema/services';
var VALIDATE_BY_TEMPLATES = false; // Валидировать сервисы по шаблону
/*
 * Возвращаем json
 */
var ServicesSaveHandler = function(core) {
    var _self = this;
    var _schemas = null;
    var _conn = null;
    var _task = null;

    var _warns = [];
    var _errors = [];
    var _services = null;

    this.handle = function(task) {
        _task = task;

        try {
            _services = JSON.parse(task.post.services || "{}");
        } catch (e) {
            sendError(e.message);
            return;
        }

        if (_schemas || !VALIDATE_BY_TEMPLATES) {
            run();
        } else {
            // Схемы еще не загружены при включенной валидации
            _schemas = {};

            var folder = path.normalize(SCHEMAS_PATH);
            var files_filtered = [];

            fs.readdir(folder, function(err, files) {
                if (err) {
                    sendError(err.message);
                    return;
                }

                for (var i = 0; i < files.length; i++) {
                    if (path.extname(files[i]) == '.json') {
                        files_filtered.push(files[i]);
                    }
                }

                function parseNext() {
                    if (!files_filtered.length) {
                        run();
                        return
                    }

                    var fname = files_filtered.shift();

                    fs.readFile(path.join(folder, fname), 'utf-8', function(err, data) {
                        if (err) {
                            _warns.push({'error': err.message})
                        } else {
                            _schemas[path.basename(fname, '.json')] = JSON.parse(data);
                        }
                        parseNext();
                    });
                }

                parseNext();
            });
        }
    }; // END this.handle = function(task) {

    var run = function() {
        for (var svc_id in _services) {
            if (typeof(_services[svc_id]) != 'object') {
                _errors.push({
                    'service_name': svc_id,
                    'service_data': _services[svc_id],
                    'error':        'Not Object'
                });
            }

            if (VALIDATE_BY_TEMPLATES) {
                if (_schemas[svc_id]) {
                    for (var op_id in _services[svc_id]) {
                        var svc_request = _services[svc_id][op_id];
                        var resultObj = tv4.validateResult(svc_request, _schemas[svc_id]);

                        if (!resultObj.valid) {
                            _errors.push({
                                'service_name': svc_id,
                                'service_id':   op_id,
                                'service_data': svc_request,
                                'error':        resultObj.error
                            });
                        }
                    }
                } else {
                    _warns.push({
                        'service_name': svc_id,
                        'error':        'Schema for validate not found.'
                    });
                }
            } // END if (VALIDATE_BY_TEMPLATES)
        }

        if (_errors.length > 0) {
            sendResult(200, {'warns': _warns, 'errors': _errors});
            return;
        }

        var shard_id = core.dataGate.getShardFor(_task.post.social_id);
        core.dataGate.begin(shard_id)
            .success(function(conn) {
                _conn = conn;
                QueryCall(core.dataGate, "getUnusedServices", [_task.post.social_network, _task.post.social_id, _conn])
                    .success(function(_unused) {
                        var deleted = [];
                        var created = [];
                        var changed = {};

                        for (var svc_id in _unused) {
                            for (var op_id in _unused[svc_id]) {
                                if (_services[svc_id] && _services[svc_id][op_id]) {
                                    if (_self.comparable_with_etalon(_services[svc_id][op_id], _unused[svc_id][op_id])) {
                                        // Сервис не изменился, просто дропаем из списка
                                        delete _services[svc_id][op_id];
                                    } else {
                                        // Сервис изменился, надо дропнуть из списка
                                        changed[op_id] = _services[svc_id][op_id].result;
                                        delete _services[svc_id][op_id];
                                    }
                                } else {
                                    // В новом списке нет такого сервиса. Удаляем.
                                    deleted.push(op_id);
                                }
                            }
                        }

                        for (svc_id in _services) {
                            for (op_id in _services[svc_id]) {
                                var svc_request = _services[svc_id][op_id];
                                if (deleted.indexOf(op_id) < 0)
                                    deleted.push(op_id);
                                created.push({
                                    service_id: svc_id,
                                    social_id: _task.post.social_id,
                                    params: svc_request.result
                                });
                            }
                        }

                        if (deleted.length <= 0 && created.length <= 0 && Object.keys(changed).length <= 0) {
                            return sendSuccess();
                        }

                        QueryCall(core.dataGate, "saveServiceChanges", [_task.post.social_network, _task.post.social_id, deleted, created, changed, _conn])
                            .success(function() {
                                _conn.commit()
                                    .success(sendSuccess)
                                    .error(sendError)
                            })
                            .error(function(error) {
                                _conn = null;       // rollback делается внутри saveServiceChanges
                                sendError(error);
                            })
                    }) // END .success(function(_unused) {
                    .error(sendError);
            })
            .error(sendError);
        // END core.dataGate.begin(shard_id)
    }; // END var run =


    var sendError = function (error) {
        if (_conn) _conn.rollback();
        sendResult(200, {'status': 'error', 'error': "ERROR. " + error})
    };

    var sendSuccess = function () {
        sendResult(200, {'status': 'ok'})
    };

    var sendResult = function(code, body) {
        if (typeof(body) == 'object') {
            body = JSON.stringify(body);
        }
        _task.reply(code, {}, body);
        _task.next = null;
        _self.emit('complete', _task);
    }
};

/**
 * Рекурсивно сравнивает хэши
 * Сравниваются только ВСЕ поля
 *
 * @param etalon        Эталон - набор свойств которые точно должны быть, и быть именно такими
 * @param comparable    Сравнимое - то, что проверяем на эдентичность
 *
 * @return  {Boolean}   true, если все поля эталона так же присутствуют в сравнимом и равны полям сравнимого
 */
ServicesSaveHandler.prototype.comparable_with_etalon = function(etalon, comparable) {
    if (null === etalon) {
        return (null === comparable) || ("undefined" === typeof(comparable));
    }

    if ("undefined" === typeof(etalon)) {
        return ("undefined" === typeof(comparable)) || (null === comparable);
    }

    if (typeof(etalon) != typeof(comparable)) return false;

    // сравниваем строки или числа
    if ((typeof(etalon) === "number") && isNaN(etalon) && isNaN(comparable)) return true;

    if ((typeof(etalon) === "string") || (typeof(etalon) === "number") || (typeof(etalon) === "boolean")) {
        return (etalon === comparable);
    }

    // сравниваем 2 массива
    if (Array === etalon.constructor) {
        if (Array !== comparable.constructor) return false;

        var len = etalon.length;
        if (len != comparable.length) return false;

        while (len--) {
            if (!(this.comparable_with_etalon(etalon[len], comparable[len]))) return false;
        }

        return true;
    }

    // сравниваем 2 хэша
    var name;
    for (name in etalon) {
        if (!(name in comparable)) return false;
        if (!(this.comparable_with_etalon(etalon[name], comparable[name]))) return false;
    }

    return true;
};

Mixer.mix(ServicesSaveHandler.prototype, EventEmitter.prototype);
module.exports = ServicesSaveHandler;
