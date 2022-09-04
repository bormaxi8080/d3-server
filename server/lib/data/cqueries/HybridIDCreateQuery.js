var HybridIDCreateQuery = function(mgr) {
    this.manager = mgr;
};

HybridIDCreateQuery.prototype.run = function(hybrid_id, callback) {
    this.manager.models.HybridID
    .using(hybrid_id)
    .create({ uid: hybrid_id })
    .success(function(res) {
        callback(null, res.uid);
    }).error(function(err) {
        callback(err, null);
    });
};

module.exports = HybridIDCreateQuery;
