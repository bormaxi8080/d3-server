var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var multipart = require('./multipart.js');
var sync_request = require('./sync_request.js')
var ROOT_PATH = path.resolve(path.join(__dirname, '..'));

var Server = module.exports = function(config) {
    this.url = config.url;
    this.config = _.extend({
        download: true,
        logic: true
    }, config);
    if (this.config.logic) {
        this.create_context = this.load_js(config.tmp_path, config);
    }
    return this;
};

Server.by_id = function(server_id) {
    var config = require(path.join(ROOT_PATH, 'profile', 'servers.json'))[server_id];
    if (!config) {
        throw new Error("Server " + server_id + " not found in servers.json!");
    }
    config.tmp_path = path.join(ROOT_PATH, 'tmp', server_id);
    return new Server(config);
};

Server.prototype.load_js = function(tmp_path) {
    mkdirp.sync(tmp_path);
    var js_path = path.join(tmp_path, 'all.js');
    if (this.config.download) {
        var js_content = sync_request("GET", "http://" + this.url + "/static/assets/mobile/all.js");
        var exportable_js = "module.exports = function(env) {\n" + js_content + "\nreturn createContext(env)\n};";
        fs.writeFileSync(js_path, exportable_js);
    }
    return require(js_path);
};

Server.prototype.backend_auth = function(params) {
    var str = Object.keys(params).sort().map(function(key) {
        var value = params[key];
        if (typeof params[key] === 'object') {
            value = JSON.stringify(value);
        }
        return key + "=" + value;
    }).join("") + this.config.backend_secret;
    return crypto.createHash('md5').update(str).digest("hex");
};

Server.prototype.backend_request = function(route, params) {
    var route_url = "http://" + this.url + route;
    params.internal_sig = this.backend_auth(params);
    return sync_request("POST", route_url, multipart(params));
};

Server.prototype.available_users = function(options) {
    var res = this.backend_request("/backend/test-migrations/available-users", options);
    return JSON.parse(res);
};

Server.prototype.download_dump = function(options) {
    var res = this.backend_request("/backend/test-migrations/download-dump", options);
    return JSON.parse(res);
};

Server.prototype.migrate = function(options) {
    var res = this.backend_request("/backend/test-migrations/migrate", options);
    return JSON.parse(res);
};

Server.prototype.version = function() {
    if (!this._version) {
        this._version = sync_request("GET", "http://" + this.url + "/static/VERSION");
    }
    return this._version;
};
