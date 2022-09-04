var url = require('url');
var http = require('http');
var fs = require('fs');

var Mixer = require("../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var CdnDownloadTask = function (file_url, dest, logger) {
    var _self = this;
    var _logger = logger;
    var file = null;

    _self.file_url = file_url;
    _self.dest = dest;

    this.start = function() {
        var url_parsed = url.parse(file_url);
        var options = {
            host: url_parsed.host,
            port: url_parsed.port ? url_parsed.port : 80,
            path: url_parsed.pathname
        };

        var request = http.get(options, onConnect);
        request.on('error', function(e){
            _logger.error('ERROR: CdnDownloadTask request error:', e.message);
            _self.emit('error', 500);
        })
    };

    var onFileClose = function () {
        file.removeListener('close', onFileClose);
        _self.res.removeListener('data', onData);
        _self.res.removeListener('end', onEnd);

        _self.emit('complete', dest);
    };

    var onConnect = function(res) {
        if (res.statusCode != 200) {
            _logger.error('ERROR: CdnDownloadTask error.', file_url);
            _self.emit('error', res.statusCode);
        } else {
            file = fs.createWriteStream(dest);
            file.addListener('close', onFileClose);
            _self.res = res;

            res.addListener('data', onData);
            res.addListener('end', onEnd);
        }
    };

    var onData = function (data) {
        file.write(data, 'binary');
    };

    var onEnd = function() {
        file.end();
    };
};

Mixer.mix(CdnDownloadTask.prototype, EventEmitter.prototype);

module.exports = CdnDownloadTask;
