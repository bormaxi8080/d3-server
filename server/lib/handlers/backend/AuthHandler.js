var crypto = require('crypto');

var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var AuthHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
};

AuthHandler.prototype.sendResult = function(code, body) {
    this.task.reply(code, {}, body);
    this.emit('complete', 'error');
};

AuthHandler.prototype.sig = function(params) {
    var str = Object.keys(params).sort().map(function(key) {
        return key + "=" + params[key];
    }).join("") + this.core.config().app().backend_secret;
    return crypto.createHash('md5').update(str, "utf-8").digest("hex");
};

AuthHandler.prototype.handle = function(task) {
    this.task = task;
    params = task.post;

    if (!params || !params['internal_sig']) {
        this.sendResult(200, JSON.stringify({error_code: 'bad_params'}));
    }


    var sig_have = params['internal_sig'];
    delete params['internal_sig'];
    var sig_must = this.sig(params);

    if (sig_must != sig_have) {
        this.logger.debug("Incorrect authorization; Expected: " + sig_must + "; Received: " + sig_have);
        this.sendResult(200, JSON.stringify({error_code: 'bad_params'}));
    } else {
        task.next = this.next;
        this.emit('complete', task);
    }
};

Mixer.mix(AuthHandler.prototype, EventEmitter.prototype);

module.exports = AuthHandler;
