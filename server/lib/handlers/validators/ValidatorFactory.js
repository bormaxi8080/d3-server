var Utils = require("../../core/Utils");

exports.getValidator = function(config, social_network, logger) {
    var network = null;
    var validator = null;
    try {
        network = config.findNetworkById(social_network);
        validator = require("./" + network["name"].toLowerCase() + ".js");
    }
    catch (e) {
        logger.error("validator error");
    }

    return {
        validate: function(params) {
            if (!params) return false;
            if (!Utils.hasFields(params, ["social_network", "social_id"]))
                return false;

            return validator ? validator.validate(params, network) : false;
        }
    };
};