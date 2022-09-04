var _ = require('underscore');

var SavedStatesGetListQuery = function(mgr) {
    this.manager = mgr;
};

SavedStatesGetListQuery.prototype.run = function(user, callback) {
    var self = this;
    var models = this.manager.models;

    models.SavedStates
    .using_shard(user.shard)
    .findAll({
        attributes: ['id', 'comment', 'createdAt'],
        where: { user_id: user.id },
        order: 'comment'
    }).success(function(states) {
        var results = _.map(states, function(state) {
            return { id: state.id, comment: state.comment, created_at: state.createdAt };
        });
        callback(null, results);
    }).error(callback);
};

module.exports = SavedStatesGetListQuery;
