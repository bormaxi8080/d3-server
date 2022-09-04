var EventEmitterExt = require("../../../core/EventEmitterExt");
var https = require('https');
var url = require('url');
//var JSONUtils = require('../../../data/JSONUtils');

var getJSONAuhorizer = function(requestUrl, checker) {
    return new EventEmitterExt(function(emitter) {
        requestUrl = url.parse(requestUrl);
        var options = {
            host: requestUrl.hostname,
            port: requestUrl.port,
            path: requestUrl.path
        };
        var req = https.get(options, function(res) {
            var data = "";
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                data = JSON.parse(data);
                var authorized = checker(res.statusCode, data);
                emitter.emit("success", authorized);
            });
        });
        req.on('error', function(e) {
            //Logger.error('problem with request: ' + e.message); // прокинуть логгер.
            emitter.emit("error", "request error");
        });
    }).run()
};

module.exports = getJSONAuhorizer;
