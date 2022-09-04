var CheckUserQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
    this.dataGate = mgr.core.dataGate;
    this.core = mgr.core;
};

CheckUserQuery.prototype.run = function(network_id, social_id, callback) {
    var netcfg = this.core.config().app().networks_map.hybrid;
    if (!netcfg || netcfg.id != network_id) {
        return callback(null, null)
    }

    this.models.HybridID
    .using(social_id)
    .find(social_id)
    .success(function(res) {
        if (res) {
            callback(null, JSON.parse(res.links));
        } else {
            callback({error_code: "unknown_user"}, null);
        }
    })
    .error(function(err) {
        callback(err, null);
    });
}

module.exports = CheckUserQuery;
