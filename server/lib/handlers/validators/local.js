crypto = require("crypto");

var AuthValidatorLocal = {

    /**
     * Validate VK network
     * @param params
     * @param network
     * @return {Boolean}
     */
    validate: function(params, network)
    {
//        var bool = (params.app_id == network["app_id"]);
//        if (!bool) return false;
        var str = params.app_id + "_" + params.social_id + "_" + network["secret_key"];
        var md5 = crypto.createHash("md5").update(str).digest("hex");
        return (md5 == params.auth_key);
        return true;
    }
};

module.exports = AuthValidatorLocal;