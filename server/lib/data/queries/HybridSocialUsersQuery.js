var QueryWrapper = require('../QueryUtils').Wrapper;
var QueryCall = require('../../core/Utils').QueryCall;
var EventEmitterExt = require('../../core/EventEmitterExt');

var getHybridSocialUsers = QueryWrapper(function(users, filter) {
    var dataGate = this.manager.core.dataGate;
    var models = this.manager.models;

    return new EventEmitterExt(function(emitter) {
        var shards = {};
        users.forEach(function(user_id) {
            var shard_id = dataGate.getShardFor(user_id);
            var shard = shards[shard_id];
            if (!shard)
                shards[shard_id] = shard = [];
            shard.push(user_id);
        });

        var chainer = dataGate.getQueryChainer();
        for (var shard_id in shards) {
            var shard = models.HybridID.using_shard(shard_id);
            chainer.add(shard.findAll({attributes: ['uid', 'links'], where:{uid: shards[shard_id]}}));
        }

        chainer.run()
            .success(function(result){
                var res = {};
                result.forEach(function(users){
                    if (!users)
                        return;
                    users.forEach(function(user){
                        var user_res = res[user.uid];
                        var links = JSON.parse(user.links)
                        for (var code in links) {
                            if (filter.indexOf(code) < 0)
                                return;
                            if (!user_res)
                                res[user.uid] = user_res = {};
                            user_res[code] = links[code];
                        }
                    });
                });
                emitter.emit("success", res);
            })
            .error(emitter.emit.bind(emitter, "error"));
    }).run()
});

module.exports = getHybridSocialUsers;
