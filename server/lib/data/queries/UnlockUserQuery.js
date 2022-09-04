
var UnlockUserQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;

    this.result = null;
    this.error = null;
    this.bindedOnDBError = this.onDBError.bind(this, null);
}

UnlockUserQuery.prototype.run = function(user, session_id) {
    var self = this;
    this.manager.core.dataGate
    .begin(user.shard)
    .success(function(conn) {
        var connBindedOnDBError = self.onDBError.bind(self, conn);
        self.models.Session
        .using_shard(user.shard)
        .find({ where: {user_id: user.id}, for: "UPDATE"}, {ts_id: conn.id})
        .success(function(session) {
            if (session && session.session_id == session_id) {
                session.locked = null;
                session.save(["locked"], {ts_id: conn.id})
                .success(function() {
                    conn.commit()
                    .success(function() {
                        self.result = session.session_id;
                        return self.emit("complete");
                    })
                    .error(connBindedOnDBError);
                })
                .error(connBindedOnDBError);
            } else {
                return onError(conn, 'Session not found');
            }
        })
        .error(connBindedOnDBError);
    })
    .error(self.bindedOnDBError);
};

UnlockUserQuery.prototype.onDBError = function(conn, error) {
    this.onError(conn, 'DB error: ' + error);
};

UnlockUserQuery.prototype.onError = function(conn, error) {
    if (conn)
        conn.rollback();
    this.error = error;
    return this.emit("error");
};

module.exports = UnlockUserQuery;