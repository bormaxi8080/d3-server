var EventEmitterExt = require("../../core/EventEmitterExt");

var authorizers = {
    DEV: require('./authorizers/fake'),
    LC: require('./authorizers/fake'),
    GC: require('./authorizers/fake'),
    FB: require('./authorizers/fb'),
    VK: require('./authorizers/vk')
};

var hybridValidate = function(code, id, key, netCfg) {
    return new EventEmitterExt(function(emitter) {
        if (!(code in authorizers))
            return emitter.emit('error', 'unknown authorization network');

        if (!id || !key)
            return emitter.emit('error', 'invalid params');

        var codeCfg = netCfg.accounts[code];
        if (!codeCfg)
            return emitter.emit('error', 'invalid config');

        authorizers[code](code, id, key, codeCfg)
            .success(emitter.emit.bind(emitter, 'success'))
            .error(emitter.emit.bind(emitter, 'error'))
    }).run();
};

module.exports = hybridValidate;