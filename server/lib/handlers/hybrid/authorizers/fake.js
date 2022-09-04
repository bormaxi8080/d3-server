var crypto = require("crypto");
var EventEmitterExt = require("../../../core/EventEmitterExt");

var fakeAuhorizer = function(code, id, key, cfg) {
    return new EventEmitterExt(function(emitter) {
        var link_key = crypto.createHash("md5").update(code + '_' + id + '_' + cfg.secret).digest("hex");
        emitter.emit('success', link_key == key);
    }).run()
};

module.exports = fakeAuhorizer;