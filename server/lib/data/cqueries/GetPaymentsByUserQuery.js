var async = require('async');

var GetPaymentsByUserQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.dataGate = mgr.core.dataGate;
};

GetPaymentsByUserQuery.prototype.run = function(social_id, callback) {
    var self = this;
    var shard_id = this.dataGate.getShardFor(social_id);

    var Payment = this.models.Payment;
    var User = this.models.User;

    var stack = [];

    stack.push(function(fn) {
        User.using_shard(shard_id).find({ where: { social_id: social_id } })
        .success(function(user) {
            if (!user) {
                return fn(new Error('User not found'));
            }
            fn(null, user);
        }).error(fn);
    });

    stack.push(function(user, fn) {
        Payment.using_shard(shard_id).findAll({ where: { user_id: user.id } })
        .success(function(payments) {
            if (!payments) {
                return fn(new Error('Payments not found for user ' + user.social_id));
            }
            fn(null, payments);
        }).error(fn);
    });

    async.waterfall(stack, function(err, results) {
        return callback(err, results);
    });
};

module.exports = GetPaymentsByUserQuery;
