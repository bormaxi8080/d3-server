var SharingExecutor = function(core) {
    var _self = this;

    this.execute = function(network_id, social_id, params, conn) {
        var _query = core.dataGate.getQuery('shareAdd');
        _query.addListener('complete', function() {
            _query.removeAllListeners();
            _self.result = _query.result;
            _self.emit('complete');
        });
        _query.addListener('error', function() {
            _query.removeAllListeners();
            _self.error = _query.error;
            _self.emit('error');
        });
        _query.run(network_id, social_id, params, conn);
    };
};

module.exports = SharingExecutor;