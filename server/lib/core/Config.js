
var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var yaml = require("js-yaml");

if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

var Config = function(configData) {
    var _config = configData;
    var _adminNetworkId = null;

    this.version = function() {
        return _config["_version"];
    };

    this.findNetworkById = function(network_id) {
        var networks = _config["app"]['networks'];
        var network = null;
        network_id = parseInt(network_id);

        for (var id in networks) {
            if (network_id == parseInt(id)) {
                network = networks[id];
                break;
            }
        }

        if (network == null) {
            throw new Error("Network not found");
        }

        return network;
    };

    this.app = function() {
        return _config["app"];
    };

    this.services = function() {
        return _config["services"];
    };

    this.db = function() {
        return _config["db"];
    };

    this.cache = function() {
        return _config["cache"];
    };

    this.init_world = function() {
        return _config["init_world"];
    };

    this.init_room = function() {
        return _config["init_room"];
    };

    this.manifest_main = function() {
        return _config["manifest_main"];
    };


    this.batch_runner = function() {
        return _config["app"]["batch_runner"];
    };
};

Config.custom_config = function(config_path, type) {
    var file_path = path.join(config_path, process.env.NODE_ENV, type);
    return yaml.safeLoad(fs.readFileSync(file_path, 'utf8'));
};

Config.app_config = function(config_path) {
    var common_path = path.join(config_path, 'common.yml');
    return _.extend(
        yaml.safeLoad(fs.readFileSync(common_path, 'utf8')),
        this.custom_config(config_path, 'app.yml')
    );
};

Config.db_config = function(config_path) {
    return this.custom_config(config_path, 'db.yml');
};

Config.cache_config = function(config_path) {
    return this.custom_config(config_path, 'cache.yml');
};

module.exports = Config;