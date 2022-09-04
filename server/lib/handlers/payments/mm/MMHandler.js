var Mixer = require("../../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var MMHandler = function() {
};

MMHandler.prototype.writeResponse = function(response)
{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end(
        '{"status": "1"}'
    );

    this.emit("complete", null);
};

MMHandler.prototype.writeError = function(response, status, error_code)
{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end(
        '{"status": ' + status + ', "error_code" : ' + error_code + '}'
    );

    this.emit("complete", null);
};

Mixer.mix(MMHandler.prototype, EventEmitter.prototype);

module.exports = MMHandler;