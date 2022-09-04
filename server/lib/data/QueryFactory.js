
var Mixer = require('../core/Mixer');
var EventEmitter = require('events').EventEmitter;

var QueryFactory = function(core) {
    this.core = core;
    this.queries = {};
};

QueryFactory.prototype.init = function(models, cache) {
    if (this.models || this.cache)
        throw new Error('query factory is already initialized!');
    if (!models || !cache)
        throw new Error('invalid args!');

    this.models = models;
    this.cache = cache;
};

QueryFactory.prototype.add = function(name, klass) {
    if (this.queries[name])
        throw new Error('query "' + name + '" is already exist');

    if (!klass.prototype.emit) // TODO fix HACK
        Mixer.mix(klass.prototype, EventEmitter.prototype);
    this.queries[name] = klass;
};

QueryFactory.prototype.addQueries = function(queries) {
    for (var query in queries) {
        this.add(query, queries[query])
    }
};

QueryFactory.prototype.set = function(name, klass) {
    if (!this.queries[name])
        throw new Error('query "'+name+'" is not exist');

    if (!klass.prototype.emit) // TODO fix HACK
        Mixer.mix(klass.prototype, EventEmitter.prototype);
    this.queries[name] = klass;
};

QueryFactory.prototype.getQuery = function(name) {
    var query = this.queries[name];
    if (!query) {
        this.core.logger.error('unknown query "'+name+'"!');
        throw new Error('unknown query "' + name + '"');
    }
    return new query(this)
};

QueryFactory.prototype.hasQuery = function(name) {
    return !!this._queries[name];
};

module.exports = QueryFactory;