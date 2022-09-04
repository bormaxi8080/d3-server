var getJSONAuhorizer = require('./get_json');
var _ = require("underscore")

var vkAuhorizer = function(code, id, key, cfg) {
    var requestUrl = _.template(cfg.url)({code: code, id: id, key: key});
    return getJSONAuhorizer(requestUrl, function(status, vk_answer) {
        return (vk_answer.hasOwnProperty('response')
            || (vk_answer.hasOwnProperty('error')
            && vk_answer['error'].hasOwnProperty('error_msg')
            && vk_answer['error']['error_msg'] == 'User authorization failed: access_token was given to another ip address.'));
    });
};

module.exports = vkAuhorizer;
