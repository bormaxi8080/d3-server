var category_map = {
    "default": "ios"
};

var SetTokenHandler = function(core) {
    this.core = core;
}

SetTokenHandler.prototype.handle = function(task, callback) {
    var token = task.post.token;
    var category = task.post.category;
    var odin = task.post.odin;

    if (token === "") {
        task.reply(200, {}, JSON.stringify(true))
        return callback(null, null);
    }

    if ((typeof(token) != 'string') || token.length <= 0) {
        core.logger.error("Incorrect token type!");
        task.reply(200, {}, JSON.stringify({error_code: "bad_params"}))
        return callback(null, null);
    }

    var token_type = category_map[category];
    if (!token_type) {
        core.logger.error("Unknown token client category!");
        task.reply(200, {}, JSON.stringify({error_code: "bad_params"}))
        return callback(null, null);
    }

    var network_id = task.post.social_network;
    var social_id = task.post.social_id;
    this.core.cqueries.setToken.run(social_id, network_id, token, token_type, odin, function(err) {
        if (err) {
            task.reply(200, {}, JSON.stringify({error_code: "query_error"}));
        } else {
            task.reply(200, {}, JSON.stringify(true));
        }
        return callback(null, null);
    });
};

module.exports = SetTokenHandler;
