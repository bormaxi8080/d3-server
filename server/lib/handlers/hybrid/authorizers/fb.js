var getJSONAuhorizer = require('./get_json');
var _ = require("underscore")

var fbAuhorizer = function(code, id, key, cfg) {
    var requestUrl = _.template(cfg.url)({code: code, id: id, key: key});
    return getJSONAuhorizer(requestUrl, function(status, data) {
        return (status == 200 && !data.error && data.id && data.id == id);
    });
};

module.exports = fbAuhorizer;