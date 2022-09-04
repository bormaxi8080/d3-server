var PushNotifier = require('../../core/PushNotifier');

var SendGiftExecutor = function(core) {
    var self = this;

    this.execute = function(network_id, social_id, params, conn) {
        self.result =  {
            response: params,
            expires_date: params['expires_date'] || 0
        };
        if (params.type == "levelup") {
            PushNotifier.push_to_user(core, network_id, social_id, "receive_levelup_gift", function() {});
        }
        self.emit('complete');
    };
};

module.exports = SendGiftExecutor;
