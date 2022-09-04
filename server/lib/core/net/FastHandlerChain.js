var Task = require('./Task');
var domain = require('domain');

var FastHandlerChain = function(start, handlers) {
    this.start = start;
    this.handlers = handlers;
};

FastHandlerChain.prototype.handle = function(request, response, onChainComplete) {
    var self = this;
    var task = new Task(request, response);

    if (domain.active) {
        domain.active.task = task;
    }

    var iterator = function(err, next) {
        if (next) {
            var handler = self.handlers[next];
            if (!handler) {
                console.log(next)
                throw new Error("Next handler " + next + " not found!");
            }
            handler.handle(task, iterator);
        } else {
            task.reply(200, {}, err);
            onChainComplete();
        }
    };
    iterator(null, this.start);
};

module.exports = FastHandlerChain;