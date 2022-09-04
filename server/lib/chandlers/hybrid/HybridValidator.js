var authorizers = {
    DEV: require('../../handlers/hybrid/authorizers/fake'),
    LC: require('../../handlers/hybrid/authorizers/fake'),
    GC: require('../../handlers/hybrid/authorizers/fake'),
    FB: require('../../handlers/hybrid/authorizers/fb'),
    VK: require('../../handlers/hybrid/authorizers/vk')
};

var HybridValidator = function(code, id, key, netcfg, callback) {
    if (!(code in authorizers))
        return callback({ error: 'unknown authorization network'}, null);

    if (!id || !key)
        return callback({ error: 'invalid params'}, null);

    var codecfg = netcfg.accounts[code];
    if (!codecfg)
        return callback({ error: 'invalid config'}, null);

    authorizers[code](code, id, key, codecfg)
        .success(function(res) {
            callback(null, res);
        }).error(callback);
};

module.exports = HybridValidator;
