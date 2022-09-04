var crypto = require("crypto");
var AuthValidatorFactory = require("../handlers/validators/ValidatorFactory");

var AuthorizeHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
};

AuthorizeHandler.prototype.handle = function(task, callback) {
    var params = task.post;

    var validator = AuthValidatorFactory.getValidator(this.core.config(), params.social_network, this.logger);
    var result = validator.validate(params);

    if (!result) {
        this.logger.error("auth_failed");
        task.reply(200, {"Content-Type": "text/html"}, JSON.stringify({error_code: "auth_failed"}));
        return callback(null, null);
    } else {
        return callback(null, this.next);
    }
};

module.exports = AuthorizeHandler;
