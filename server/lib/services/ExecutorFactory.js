var Mixer = require('../core/Mixer');
var EventEmitter = require('events').EventEmitter;

var ExecutorFactory = function(core) {
    this.core = core;
    this.executors = {};
};

ExecutorFactory.prototype.addExecutors = function(executors) {
    for (var executor in executors) {
        this.add(executor, executors[executor]);
    }
};

ExecutorFactory.prototype.add = function(name, klass) {
    if (this.executors[name]) {
        throw new Error('executor "' + name + '" is already exists');
    }

    if (!klass.prototype.hasOwnProperty('emit'))
        Mixer.mix(klass.prototype, EventEmitter.prototype);
    this.executors[name] = klass;
};

ExecutorFactory.prototype.getExecutor = function(service_id) {
    var executor = this.executors[service_id];
    if (executor) {
        return new this.executors[service_id](this.core);
    } else {
        this.core.logger.error("unknown service " + service_id);
    }
};

ExecutorFactory.prototype.getNames = function() {
    return Object.keys(this.executors);
};

module.exports = ExecutorFactory;
