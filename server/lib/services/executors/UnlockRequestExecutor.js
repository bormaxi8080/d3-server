var PushNotifier = require('../../core/PushNotifier');

var UnlockRequestExecutor = function(core) {
    var self = this;

    this.execute = function(network_id, social_id, params, conn) {
        self.result =  {
            response: params,
            expires_date: params['expires_date'] || 0
        };
        var tag = (params.request ? "unlock_request_received" : "unlock_request_accepted");
        PushNotifier.push_to_user(core, network_id, social_id, tag, function() {});
        self.emit('complete');
    };
};

module.exports = UnlockRequestExecutor;
