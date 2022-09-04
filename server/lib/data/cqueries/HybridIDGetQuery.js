var HybridIDGetQuery = function(mgr) {
    this.manager = mgr;
    this.models = mgr.models;
};

HybridIDGetQuery.prototype.run = function(link_code, link_id, callback) {
    this.models.HybridMap
    .using(link_id)
    .find({ where: { link_code: link_code, link_id: link_id }})
    .success(function(res) {
        if (!res)
            return callback(null, null);
        callback(null, res.hybrid_id);
    })
    .error(function(err) {
        callback(err, null);
    });
};

module.exports = HybridIDGetQuery;
