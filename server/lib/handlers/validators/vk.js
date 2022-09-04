crypto = require("crypto");
var Utils = require("../../core/Utils");

var AuthValidatorVK = {

    /**
     * Validate VK network
     * @param params
     * @param network
     * @return {Boolean}
     */
    validate: function(params, network)
    {
        if (!Utils.hasFields(params, ["auth_key", "app_id"]))
            return false;

        if (params.app_id != network["app_id"])
            return false;

        var str = params.app_id + "_" + params.social_id + "_" + network["secret_key"];
        var md5 = crypto.createHash("md5").update(str).digest("hex");
        return (md5 == params.auth_key);
    }
};

module.exports = AuthValidatorVK;