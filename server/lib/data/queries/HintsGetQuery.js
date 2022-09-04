var QueryWrapper = require('../QueryUtils').Wrapper;
var EventEmitterExt = require('../../core/EventEmitterExt');

var HintsGetQuery = QueryWrapper(function(hybrids) {
    var dataGate = this.manager.core.dataGate;
    var models = this.manager.models;

    var logger = this.manager.core.logger;
    return new EventEmitterExt(function(emitter) {
        var hybrid_by_shards = {};
        hybrids.map(function(hybrid_id){
            var shard_id = dataGate.getShardFor(hybrid_id);
            hybrid_by_shards[shard_id] = hybrid_by_shards[shard_id] || [];
            hybrid_by_shards[shard_id].push(hybrid_id);
        });

        var chainer = dataGate.getQueryChainer();
        for (var shard_id in hybrid_by_shards) {
            chainer.add(models.User.using_shard(shard_id).findAll({
                attributes: ['social_id', 'hints', 'last_day_start'],
                where: { social_id: hybrid_by_shards[shard_id] }
            }));
        }

        chainer.run().success(function(result) {
            var reset_time = new Date().setUTCHours(-24, 0, 0, 0);
            var res = {};
            result.forEach(function(records) {
                records.forEach(function(record) {
                    res[record.social_id] = (reset_time < record.last_day_start ? record.hints : 1);
                });
            });
            emitter.emit("success", res);
        }).error(function(error) {
            emitter.emit("error", err);
        });
    }).run();
});

module.exports = HintsGetQuery;
