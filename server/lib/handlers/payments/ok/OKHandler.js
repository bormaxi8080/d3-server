var Mixer = require("../../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var okErrors = {
       1: 'Unknown error',
       2: 'Service temporary unavailable',
    1001: 'Payment is invalid and can not be processed',
    9999: 'Critical system failure, which can not be recovered',
     104: 'Invalid signature'
};

var OKHandler = function() {
};

OKHandler.prototype.writeResponse = function(response)
{
    response.writeHead(200, {"Content-Type": "application/xml"});
    response.end(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
            "<callbacks_payment_response xmlns=\"http://api.forticom.com/1.0/\">" +
            "true" +
            "</callbacks_payment_response>"
    );

    this.emit("complete", null);
};

OKHandler.prototype.writeError = function(response, code)
{
    var msg;

    response.writeHead(200, {"Content-Type": "application/xml"});
    response.writeHead({"invocation-error": code});

    if (code in okErrors) {
        msg = okErrors[code];
    } else {
        msg = 'Unknown error';
    }

    response.end(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
        "<ns2:error_response xmlns:ns2='http://api.forticom.com/1.0/'>" +
        "<error_code>" + code + "</error_code>" +
        "<error_msg>" + msg + "</error_msg>" +
        "</ns2:error_response>"
    );

    this.emit("complete", null);
};

Mixer.mix(OKHandler.prototype, EventEmitter.prototype);

module.exports = OKHandler;