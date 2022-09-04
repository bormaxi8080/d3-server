var Mixer = require("../../core/Mixer");
var QueryCall = require("../../core/Utils.js").QueryCall;
var EventEmitter = require("events").EventEmitter;

var fs = require("fs");
var path = require("path");

var LOGS_DIR  = path.normalize('logs/'); // Возможно стоит вынести настройки в конфиг
var MIN_LINES = 10;
var MAX_LINES = 10*1000*1000;
var MAX_STDOUT_BYTES = 1024*1024*50;

var ServerLogsHandler = function(core) {
    var _self = this;
    var _logs_dir = LOGS_DIR;

    this.handle = function(task) {
        var c = parseInt(task.post.count);
        if (c > MAX_LINES) c = MAX_LINES;
        if (c < MIN_LINES) c = MIN_LINES;

        // TODO собрать по конфигам? (но в конфигах про этот файл инфы сейчас нет)
        var fname = path.normalize(_logs_dir + task.post.fname);

        fs.exists (fname, function(exists) {
            if (!exists) {
                sendResult(task, 200, {'status': 'ERROR', 'msg': 'File not found. ' + fname});
                return;
            }
            cmd = 'tail -n ' + c + ' ' + fname;
            if (task.post.grep) {
                cmd += ' | grep ' + task.post.grep_d + ' "' + task.post.grep.replace(/\"/g, '\\"') + '"';
            }

            var exec = require('child_process').exec;
            exec(cmd, {maxBuffer: MAX_STDOUT_BYTES}, function(error, stdout, stderr) {
                if (stderr) {
                    sendResult(task, 200, {'status': 'ERROR', 'msg': stderr});
                } else {
                    sendResult(task, 200, {'status': 'OK', 'data': stdout});
                }
            }); // END exec(cmd, {},
        }); // END fs.exists(fname
    };

    var sendResult = function(task, code, body) {
        if (typeof body == 'object') {
            body = JSON.stringify(body);
        }
        task.reply(code, {}, body);
        task.next = null;
        _self.emit('complete', task);
    }
};

Mixer.mix(ServerLogsHandler.prototype, EventEmitter.prototype);
module.exports = ServerLogsHandler;
