var crypto = require("crypto");

var LockUserQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.logger = mgr.core.logger;

    this.result = null;
    this.error = null;
};

LockUserQuery.prototype.createSessionId = function() {
    return crypto.randomBytes(32).toString("hex");
};

LockUserQuery.prototype.run = function(user, session_id, init, timeout, callback) {
    var self = this;
    this.manager.core.dataGate
    .begin(user.shard)
    .success(function(conn) {
        var connDBError = self.onDBError.bind(self, callback, conn);
        self.models.Session
        .using_shard(user.shard)
        .find({ where: {user_id: user.id}, for: "update"}, {ts_id: conn.id})
        .success(function(session) {
            var now = new Date();
            var lock_till = new Date(now.getTime() + timeout);
            if (session) {
                if (!session.locked || now.getTime() > session.locked.getTime()) {
                    var save_fields = ["locked"];
                    session.locked = lock_till;
                    if (init) {
                        session.last_visit = now;
                        save_fields.push("last_visit");
                        if (session.session_id != session_id || session_id.length == 0) {
                            save_fields.push("session_id");
                            session.session_id = self.createSessionId();
                        }
                    } else {
                        if (session_id != session.session_id) {
                            return self.onError(callback, conn, {error_code: "session_error"});
                        }
                    }
                    session.save(save_fields, {ts_id: conn.id})
                    .success(function() {
                        conn.commit()
                        .success(function() {
                            return callback(null, session.session_id);
                        })
                        .error(connDBError);
                    })
                    .error(connDBError);
                } else {
                    return self.onError(callback, conn, {error_code: "session_locked"});
                }
            } else {
                self.models.Session
                .using_shard(user.shard)
                .create({
                    user_id: user.id,
                    session_id: self.createSessionId(),
                    locked: lock_till,
                    last_visit: now
                }, null, {ts_id: conn.id})
                .success(function(session) {
                    conn.commit()
                    .success(function() {
                        return callback(null, session.session_id);
                    })
                    .error(connDBError);
                })
                .error(connDBError);
            }
        })
        .error(connDBError);
    })
    .error(function(err) {
        self.onDBError(callback, null, err);
    });
};

LockUserQuery.prototype.onDBError = function(callback, conn, error) {
    this.onError(callback, conn, 'DB error: ' + error);
};

LockUserQuery.prototype.onError = function(callback, conn, error) {
    if (conn)
        conn.rollback();
    callback(error, null);
};

module.exports = LockUserQuery;
