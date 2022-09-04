var _ = require('underscore');
var HandlerCallbackWrapper = require('./HandlerCallbackWrapper');

var HandlerFactory = function() {
    this.handlers = {}
    this.chandlers = {}
};

HandlerFactory.prototype.add = function(name, handler, isCallbacked) {
    var storage = (isCallbacked ? this.chandlers : this.handlers);
    if (storage[name]) {
        throw new Error('Handler "' + name + '" already exists');
    }
    storage[name] = (isCallbacked ? handler : HandlerCallbackWrapper(handler))
};

HandlerFactory.prototype.addHandlers = function(handlers) {
    for (var handler in handlers) {
        this.add(handler, handlers[handler], false);
    }
};

HandlerFactory.prototype.addChandlers = function(chandlers) {
    for (var chandler in chandlers) {
        this.add(chandler, chandlers[chandler], true);
    }
};

HandlerFactory.prototype.get = function(name) {
    if (this.chandlers[name]) {
        return this.chandlers[name];
    } else if (this.handlers[name]) {
        return this.handlers[name];
    } else {
        throw new 'Handler "' + name + '" not found';
    }
};

HandlerFactory.prototype.list = function(name) {
    return _.extend(this.handlers, this.chandlers)
};

module.exports = HandlerFactory;