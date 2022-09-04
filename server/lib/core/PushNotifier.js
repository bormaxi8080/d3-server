var async = require('async');
var request = require('request');
var querystring = require('querystring');
var QueryCall = require("./Utils").QueryCall;

var PushNotifier = module.exports = {};

PushNotifier.messages = {
    "receive_levelup_gift" : "Ваш друг получил новый уровень и поделился энергией с вами. Заберите подарок.",
    "unlock_request_received" : "Вашему другу требуются рекомендации для продолжения расследования. Зайдите в игру и отправьте их!",
    "unlock_request_accepted" : "Поступила рекомендация от вашего друга. Пора приступить к следующему делу."
};

PushNotifier.send = function(core, token_map, tag, callback) {
    var push_config = core.config().app().push_notifier[token_map.token_type];
    var type = push_config.type;
    var msg = {
        message_type: type,
        app: push_config.app_name,
        device_token: token_map.token,
        tag: tag
    };

    if (type == 'ApplePushWorker') {
        msg.message = this.messages[tag];
    } else if (type == 'NewAndroidGcmWorker') {
        msg.data = JSON.stringify({title: app, message: this.messages[tag]});
    } else {
        var err = "Unknown push notifier type: " + type;
        core.logger.error(err);
        return callback(err);
    }

    var url = "http://messanger.sqtools.ru/send?" + querystring.stringify(msg);
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null);
        } else {
            callback(error ? error : "Response status: " + response.statusCode);
        }
    });
};

PushNotifier.push_to_user = function(core, network_id, social_id, tag, callback) {
    var onError = function(err) {
        if (err) {core.logger.error("Error sending push notifications: " + err); }
    }
    QueryCall(core.dataGate, 'getTokens', [network_id, social_id])
    .success(function(tokens) {
        async.each(tokens, function(token, callback) {
            PushNotifier.send(core, token, tag, callback);
        }, function (err) {
            onError(err);
            callback();
        });
    })
    .error(function(err) {
        onError(err);
        callback();
    })
};
