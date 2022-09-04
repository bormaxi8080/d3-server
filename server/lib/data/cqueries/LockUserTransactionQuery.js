var QueryCall = require('../../core/Utils').QueryCall;
var QueryWrap = require('../QueryUtils').Wrapper;

var LockUserTransactionQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.core = mgr.core;
};

LockUserTransactionQuery.prototype.run = function(user, conn, callback) {
    this.models.Session
    .using_shard(user.shard)
    .find({ where: {user_id: user.id}, for: "update"}, {ts_id: conn.id})
    .success(function(session) {
        if (session) {
            if (session.locked && Date.now() < session.locked.getTime()) {
                return callback({error_code: "session_locked"});
            }
            session.session_id = "";
            session.save(['session_id'], {ts_id: conn.id})
            .success(function(res) {
                callback(null, res)
            })
            .error(callback);
        } else {
            callback(null, null)
        }
    })
    .error(callback);
};

module.exports = LockUserTransactionQuery;
