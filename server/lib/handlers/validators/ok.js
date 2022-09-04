crypto = require("crypto");
var Utils = require("../../core/Utils");

var AuthValidatorOK = {

    /**
     * Validate OK network
     * @param params
     * @param network
     * @return {Boolean}
     */
    validate: function(params, network)
    {
        if (!Utils.hasFields(params, ["auth_key" , "sess_id" , "app_id"]))
            return false;

        var bool = (params.app_id == network["app_id"]);
        if (!bool) return false;

        var str = params.social_id + params.sess_id + network["secret_key"];
        var md5 = crypto.createHash("md5").update(str).digest("hex");
        return (md5 == params.auth_key);
    }
};

module.exports = AuthValidatorOK;