var _ = require('underscore');
var path = require('path');
var crypto = require('crypto');
var multipart = require('./multipart.js');
var sync_request = require('./sync_request.js');
var ROOT_PATH = path.resolve(path.join(__dirname, '..'));
var utils = require('./utils');

var Player = module.exports = function(server, config) {
    this.server = server;
    this.config = config || {};

    this.social_id = this.config.social_id || _.random(1, 100000000);
    this.social_network = this.config.social_network || 5;
    this.network = this.config.network || "GC";
    this.hybrid_id = null;
    this.sq_session_id = null;

    this.authorized = false;
    this.inited = false;

    this.init_result = null;
    this.batch = [];
    this.services = {};

    this.time_drift = 0;
    this.env = this.create_env();
    this.context = this.server.create_context(this.env);
    this.verbose = false;
    this.log = { command: {}, request: {}, gameplay: {} };

    return this;
};

Player.by_id = function(server, player_id) {
    var config = require(path.join(ROOT_PATH, 'profile', 'players.json'))[player_id];
    if (!config) {
        throw new Error("Player " + player_id + " not found in players.json!");
    }
    return new Player(server, config);
};

Player.prototype.create_env = function() {
    var that = this;
    return {
        getTime: function() { return Date.now() - that.time_drift },
        commit: function() {},
        rollback: function() {},
        createService: function() {},
        useService: function() {},
        updateHighscore: function(){}
    };
};

Player.prototype.time = function() {
    return this.env.getTime();
}

Player.prototype.authorize = function() {
    var hybrid_url = "http://" + this.server.url + "/get_hybrid"
    var request = {
        create: false,
        format: "json",
        link_id: this.social_id,
        link_code: this.network,
        link_key: this.network_auth_key(this.network, this.social_id)
    };

    var res = this.perform_request("POST", hybrid_url, multipart(request));
    if (res == "null") {
        request.create = true;
        res = this.perform_request("POST", hybrid_url, multipart(request));
    }

    var parsed = JSON.parse(res);
    if (parsed.uid) {
        this.authorized = true;
        this.hybrid_id = parsed.uid;
        return parsed;
    } else {
        throw new Error("Problem authorizing player " + this.social_id + ": " + res);
    }
};

Player.prototype.set_hybrid = function(new_network, new_social_id) {
    this.ensure_authorize();
    var set_hybrid_url = "http://" + this.server.url + "/set_hybrid"
    var request = _.extend(this.base_params(), {
        link_id: new_social_id,
        link_code: new_network,
        link_key: this.network_auth_key(new_network, new_social_id),
    });
    var res = this.perform_request("POST", set_hybrid_url, multipart(request));
};

Player.prototype.base_params = function() {
    return {
        format: "json",
        social_id: this.hybrid_id,
        auth_key: this.hybrid_auth_key(),
        social_network: this.social_network,
        sq_session_id: this.sq_session_id
    }
};

Player.prototype.ensure_authorize = function() {
    if (!this.authorized) { this.authorize() }
};

Player.prototype.hybrid_auth_key = function() {
    var str = this.hybrid_id + "_" + this.server.config.hybrid_secret;
    return crypto.createHash("md5").update(str, "utf-8").digest("hex");
};

Player.prototype.network_auth_key = function(network, social_id) {
    var str = network + "_" + social_id + "_" + this.server.config.network_secret[network];
    return crypto.createHash("md5").update(str, "utf-8").digest("hex");
};

Player.prototype.init = function() {
    this.ensure_authorize();
    var init_url = "http://" + this.server.url + "/process/init"
    var request = _.extend(this.base_params(), {
        gamedata: { batch: [] }
    });
    var res = this.perform_request("POST", init_url, multipart(request));
    this.init_result = JSON.parse(res);
    this.sq_session_id = this.init_result.options.sq_session_id;
    this.update_time_drift(this.init_result.options.server_time)
    this.context.setStorageDump(this.init_result.gamedata);
    this.batch = [];
    this.services = this.init_result.services;
    this.inited = true;
    return this.init_result;
};

Player.prototype.ensure_inited = function() {
    if (!this.inited) { this.init() }
};

Player.prototype.apply_batch = function() {
    this.ensure_inited();
    var apply_batch_url = "http://" + this.server.url + "/process/apply_batch";
    var request = _.extend(this.base_params(), {
        gamedata: { batch: this.batch }
    });
    var res = this.perform_request("POST", apply_batch_url, multipart(request));
    var batch_result = JSON.parse(res);
    if (batch_result.error_code) {
        throw new Error("apply_batch error on player " + this.social_id + ": " + res);
    }
    this.batch = [];
    this.append_services(batch_result.services);
    this.sq_session_id = batch_result.options.sq_session_id;
    this.update_time_drift(batch_result.options.server_time);
    return batch_result;
};

Player.prototype.update_time_drift = function(server_time) {
    this.time_drift = Date.now() - server_time + 2000;
};

Player.prototype.apply_triggers = function() {
    this.ensure_inited();
    while (this.context.case.triggers().length > 0) {
        this.execute("execute_next_trigger", {});
    };
    return this.apply_batch();
};

Player.prototype.log_item = function(type, item) {
    if (this.verbose) {
        console.log('player %s %s (%j)', this.social_id, type, item);
    }

    var log = this.log[type];
    if (log) {
        log[item.name] = log[item.name] || [];
        log[item.name].push(item);
    } else {
        console.log('Warning: log type ' + type + ' not found')
    }
};

Player.prototype.perform_request = function(method, url, data) {
    var res = null;
    var time_spent = utils.measure(function() {
        res = sync_request(method, url, data);
    });

    this.log_item('request', { name: url, time_spent: time_spent });
    return res;
};

Player.prototype.perform_command = function(command_name, args) {
    var self = this;
    var res = null;
    var time_spent = utils.measure(function() {
        res = self.context.execute(command_name, args);
    });
    this.log_item('command', { name: command_name, args: args, time_spent: time_spent });
    return res;
};

Player.prototype.execute = function(command_name, args) {
    var self = this;
    this.ensure_inited();
    args.time = this.env.getTime();
    var res = this.perform_command(command_name, args);
    if (res.error) {
        console.log("Error executing command \"" + command_name + "\" with parameters " + JSON.stringify(args) + " : " + res.error);
        console.log('gamedate', utils.inspect(this.context.getStorageDump(), true));
    }
    this.handle_changes(res.changes);
    delete res.changes;
    this.batch.push(res);
    utils.sleep(1);
};

Player.prototype.append_services = function(services) {
    for (var service_id in services) {
        this.services[service_id] = _.extend(this.services[service_id] || {}, services[service_id]);
    };
};

Player.prototype.apply_services = function() {
    this.ensure_inited();
    for (var service_id in this.services) {
        var operations = this.services[service_id];
        for (var operation_id in operations) {
            var operation = operations[operation_id];
            this.execute("use_service_result", {
                service_id: service_id,
                operation_id: parseInt(operation_id),
                result: operation.result,
                client_params: {
                    accept: true
                }
            });
        }
    }
    this.services = {};
    return this.apply_batch();
};

Player.prototype.reset = function() {
    this.ensure_authorize();
    utils.sleep(100);
    this.ensure_inited();
    utils.sleep(100);
    var reset_url = "http://" + this.server.url + "/backend/reset_user"
    var request = this.base_params();
    var res = this.perform_request("POST", reset_url, multipart(request));
    this.authorized = false;
    this.inited = false;
};

Player.prototype.query_request = function(query_route, players) {
    this.ensure_authorize();
    var hybrids = (players || []).map(function(p) {
        p.ensure_authorize();
        return p.hybrid_id;
    });
    var query_url = "http://" + path.join(this.server.url, query_route);
    var request = _.extend(this.base_params(), {
        hybrids: hybrids
    });
    var res = JSON.parse(this.perform_request("POST", query_url, multipart(request)));
    return res;
};

Player.prototype.highscores = function(players) {
    var res = this.query_request("/query/highscores", players);
    res[this.hybrid_id] = this.context.storage.get_property("highscores");
    return res;
};

Player.prototype.levels = function(players) {
    var res = this.query_request("/query/levels", players);
    res[this.hybrid_id] = this.context.storage.get_property("player.level");
    return res;
};

Player.prototype.appstore_buy = function(receipt, product_id) {
    this.ensure_inited();
    var query_url = "http://" + path.join(this.server.url, "/callback_appstore");
    var request = _.extend(this.base_params(), {
        receipt: receipt,
        product_id: product_id || ""
    });
    var res = JSON.parse(this.perform_request("POST", query_url, multipart(request)));
    this.append_services(res.services);
    return res;
}

Player.prototype.set_change_handler = function(handler) {
    this.change_handler = handler;
};

Player.prototype.handle_changes = function(events) {
    var self = this;
    if (this.change_handler && events) {
        events.forEach(this.change_handler);
    }
};

Player.prototype.set_token = function(token) {
    this.ensure_authorize();
    var request = _.extend(this.base_params(), {
        token: token,
        category: "default"
    });
    var query_url = "http://" + path.join(this.server.url, "/set_token");
    var res = JSON.parse(this.perform_request("POST", query_url, multipart(request)));
    return res;
};
