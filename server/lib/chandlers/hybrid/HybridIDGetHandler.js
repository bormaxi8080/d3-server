var crypto = require('crypto');

var HybridIDGetHandler = function(core) {
    this.core = core;
    this.logger = core.logger;
};

HybridIDGetHandler.prototype.handle = function(task, callback) {
    var self = this;
    var link_code = task.post.link_code;
    var link_id = task.post.link_id;
    var netcfg = this.core.config().app().networks_map.hybrid;
    var cqueries = this.core.cqueries;

    if (task.post.create.toString() === 'true') {
        var hybrid_id = crypto.createHash('md5').update(
            link_code + '_' + link_id + '_' + Date.now()
        ).digest('hex');

        cqueries.createHybridID.run(hybrid_id, function(err, created_new_user_id) {
            if (err) {
                handle_error(err, 'ERROR. Query error.');
                return callback(err, null);
            }

            if (link_code == netcfg.local) {
                reply_success(created_new_user_id);
                return callback(err, null);
            } else {
                cqueries.setHybridID.run(link_code, link_id, hybrid_id, function(err, rec) {
                    if (err) {
                        handle_error(err, 'ERROR. Query error.');
                    } else {
                        reply_success(created_new_user_id);
                    }
                    return callback(err, null);
                });
            }
        });
    } else {
        cqueries.getHybridID.run(link_code, link_id, function(err, uid) {
            if (err) {
                handle_error(err, 'ERROR. Query error.');
            } else {
                reply_success(uid);
            }
            return callback(err, null);
        });
    }

    function reply_success(uid) {
        var body = 'null';
        if (uid) {
            var hybrid_key = crypto.createHash('md5').update(uid + '_' + netcfg.secret_key).digest('hex');
            body = { uid: uid, key: hybrid_key };
        }
        task.reply(200, {}, body);
    }

    function handle_error(err, msg) {
        if (err) self.logger.error('HybridIDGetHandler error:', err);
        task.reply(200, {}, { error_code: 'hybrid_error' });
    }
};

module.exports = HybridIDGetHandler;
