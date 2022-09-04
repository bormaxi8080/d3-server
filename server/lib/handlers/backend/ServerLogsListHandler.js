var Mixer = require("../../core/Mixer");
var QueryCall = require("../../core/Utils.js").QueryCall;
var EventEmitter = require("events").EventEmitter;

var fs = require("fs");
var path = require("path");

var ServerLogsHandler = function(core) {
    var _self = this;
    var _task;
    // Было бы круто, еслибы папка с логами настраивалась в конфиге
    var _logs_dir = path.normalize('logs/');

    this.handle = function(task) {
        _task = task;

        var result = {'status': 'OK', 'data': []};

        list = fs.readdir(_logs_dir, function(err, list) {
            for (i in list) {
                var p = path.normalize(_logs_dir + '/' + list[i]);
                if (fs.statSync(p).isFile()) { // асинхронно, но будет как-то совсем некрасиво
                    result.data.push(list[i]);
                }
            }
            result.data.sort();

            sendResult(200, result);
        }); // END list = fs.readdir(_logs_dir
    };

    var sendResult = function(code, body) {
        if (typeof body == 'object') {
            body = JSON.stringify(body);
        }
        _task.reply(code, {}, body);
        _task.next = null;
        _self.emit('complete', _task);
    }
};

Mixer.mix(ServerLogsHandler.prototype, EventEmitter.prototype);
module.exports = ServerLogsHandler;
