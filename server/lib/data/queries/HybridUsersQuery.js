var QueryWrapper = require('../QueryUtils').Wrapper;
var QueryCall = require('../../core/Utils').QueryCall;
var EventEmitterExt = require('../../core/EventEmitterExt');

var getHybridUsers = QueryWrapper(function(users) {
    var dataGate = this.manager.core.dataGate;
    var models = this.manager.models;

    return new EventEmitterExt(function(emitter) {
        var shards = {};
        var code;
        for (code in users) {
            var code_users = users[code];
            code_users.forEach(function(user_id) {
                var shard_id = dataGate.getShardFor(user_id);
                var shard = shards[shard_id]
                if (!shard)
                    shards[shard_id] = shard = {};
                if (!shard[code])
                    shard[code] = [];
                shard[code].push(user_id);
            });
        }

        var chainer = dataGate.getQueryChainer();
        for (var shard_id in shards) {
            var shard_codes = shards[shard_id];
            var shard = models.HybridMap.using_shard(shard_id);
            for(code in shard_codes) {
                chainer.add(shard.findAll({attributes: ['link_code', 'link_id', 'hybrid_id'], where:{link_code: code, link_id: shard_codes[code]}}));
            }
        }

        chainer.run()
            .success(function(result){
                var res = {}
                result.forEach(function(users){
                    if (!users)
                        return;
                    users.forEach(function(user){
                        var code_res = res[user.link_code];
                        if (!code_res)
                            res[user.link_code] = code_res = {};
                        code_res[user.link_id] = user.hybrid_id;
                    });
                });
                emitter.emit("success", res);
            })
            .error(emitter.emit.bind(emitter, "error"));
    }).run()
});

module.exports = getHybridUsers;
