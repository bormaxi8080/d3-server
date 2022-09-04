var Mixer = require("../../core/Mixer");
var QueryCall = require("../../core/Utils.js").QueryCall;
var EventEmitter = require("events").EventEmitter;

var path = require("path");
var fs = require("fs");

var SCHEMAS_PATH = '../js/defs/schema/services';

var ServicesGetTemplatesHandler = function(core, next) {
    var _self = this;
    var _schemas = null;

    this.handle = function(task) {
        var warns = [];

        if (_schemas) {
            sendResult(task, 200, JSON.stringify(_schemas));
        } else {
            var folder = path.normalize(SCHEMAS_PATH);
            var files_filtered = [];

            _schemas = {};

            fs.readdir(folder, function(err, files) {
                if (err) {
                    sendResult(task, 500, {'status': 'error', 'error': err.message});
                    return;
                }

                for (var i = 0; i < files.length; i++) {
                    if (path.extname(files[i]) == '.json') {
                        files_filtered.push(files[i]);
                    }
                }

                function parseNext() {
                    if (!files_filtered.length) {
                        sendResult(task, 200, JSON.stringify(_schemas));
                        return
                    }

                    var fname = files_filtered.shift();

                    fs.readFile(path.join(folder, fname), 'utf-8', function(err, data) {
                        if (err) {
                            warns.push({'error': err.message})
                        } else {
                            var d = JSON.parse(data);
                            if (d['default']) {
                                _schemas[path.basename(fname, '.json')] = d['default'];
                            } else {
                                _schemas[path.basename(fname, '.json')] = {};
                            }
                        }
                        parseNext();
                    });
                }

                parseNext();
            }); // END fs.readdir(folder, function(e, f) {
        }
    };

    var sendResult = function(task, code, body) {
        task.reply(code, {}, body);
        task.next = next;
        _self.emit('complete', task);
    }
};

Mixer.mix(ServicesGetTemplatesHandler.prototype, EventEmitter.prototype);
module.exports = ServicesGetTemplatesHandler;
