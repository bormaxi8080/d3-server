var hybridValidate = require('./HybridValidator');
var Utils = require('../../core/Utils');

var HybridIDSetHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
};

HybridIDSetHandler.prototype.handle = function(task, callback) {
    var self = this;
    var hybrid_id = task.post.social_id;

    if (!Utils.hasFields(task.post, ['link_code', 'link_id', 'link_key'])) {
        task.reply(200, {}, { error_code: 'Invalid link params' });
        return callback(null, null);
    }

    var netcfg = this.core.config().app().networks_map.hybrid;
    hybridValidate(task.post.link_code, task.post.link_id, task.post.link_key, netcfg, function(err, res) {
        if (err) {
            handleError(err, 'validate_link');
            return callback(null, self.next);
        }

        if (!res) {
            handleError("Failed to validate link", 'validate_link');
            return callback(null, self.next);
        } else {
            self.core.cqueries.setHybridID.run(task.post.link_code, task.post.link_id, hybrid_id, function(err, res) {
                if (err) {
                    handleError(err, 'hybrid_error');
                } else {
                    task.reply(200, {}, 'OK');
                }
                return callback(null, self.next);
            });
        }
    });

    function handleError(err, code) {
        if (err) self.logger.error('HybridIDSetHandler error:', err);
        task.reply(200, {}, { error_code: code });
    }
};


module.exports = HybridIDSetHandler;
