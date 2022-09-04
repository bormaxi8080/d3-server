var crypto = require('crypto');
var async = require('async');

var Mixer = require("../../core/Mixer");
var Utils = require("../../core/Utils");
var CallChainer = require("../../core/CallChainer");
var QueryCall = require("../../core/Utils").QueryCall;
var EventEmitter = require("events").EventEmitter;
var path = require('path');

var GetMoneyTransactionHandler = function(core, next) {
    this._core = core;
    this._next = next;
    this._logger = core.logger;
};

GetMoneyTransactionHandler.prototype.sendResult = function(code, body) {
    this.task.response.writeHead(code);
    this.task.response.end(JSON.stringify(body));
    this.emit('complete');
};

GetMoneyTransactionHandler.prototype.handle = function(task) {
    var self = this;
    this.task = task;

    var payment = this._core.modelFactory.models.Payment;
    var user = this._core.modelFactory.models.User;
    var shards = this._core.modelFactory.dbBasis.shards;
    var shards_array = [];
    for (name in shards) {
        if (name != 'rate')
            shards_array.push(name);
    }

    var shard_id = 0;
    var find_transaction_by_code = function(){
        async.waterfall([
        function(find_callback){
            payment.using_shard(shards_array[shard_id]).find({where: {payment_code: task.post.payment_code}}).
            success(function(result){
                if (result)
                    find_callback(null, result);
                else
                    find_callback(new Error('transaction not found'));
            }).
            error(function(err){
                find_callback(err);
            })
        },
        function(transaction, find_callback){
            var user_id = transaction.user_id;
            user.using_shard(shards_array[shard_id]).find({where: {id: user_id}})
                .success(function(user){
                    if (user) {
                        result = {transaction: transaction, user: user}
                        find_callback(null, result);
                    } else {
                        find_callback(new Error('user not found'))
                    }
                });
        }
        ],
        function(err, result){
            shard_id += 1;
            if (err && shards_array[shard_id])
                find_transaction_by_code();
            else {
               return self.sendResult(200, {result: result, err: err});
            }
        });
    }


    var find_transaction_by_user = function(social_id){
        async.waterfall([
            function(find_callback){
                user.using_shard(shard_id).find({where: {social_id: social_id}})
                    .success(function(user){
                        if (user) {
                            find_callback(null, user);
                        } else {
                            find_callback(new Error('user not found'))
                        }
                    });
            },
            function(user, find_callback){
                payment.using_shard(shard_id).findAll({where: {user_id: user.id}}).
                    success(function(result){
                        if (result)
                            find_callback(null, {user: user, transactions: result});
                        else
                            find_callback(new Error('transaction not found'));
                    }).
                    error(function(err){
                        find_callback(err);
                    })
            }
        ],
        function(err, result){
            if (err)
                self.sendResult(500, {result: {}, err: err.message});
            else
                self.sendResult(200, {result: result});
        });
    }

    if (task.post.payment_code){
        find_transaction_by_code();
    } else if (task.post.social_id){
        var shard_id = self._core.dataGate.getShardFor(task.post.social_id);
        find_transaction_by_user(task.post.social_id);
    } else {
        return self.sendResult(200, {result: {}, err: 'Bad params'});
    }
};

Mixer.mix(GetMoneyTransactionHandler.prototype, EventEmitter.prototype);
module.exports = GetMoneyTransactionHandler;
