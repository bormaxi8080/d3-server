HandlerCallbackWrapper = function(handler) {
    return function() {
        var args = Array.prototype.slice.call(arguments);
        this.handle = function(task, callback) {
            var handler_inst = new (handler.bind.apply(handler, [handler].concat(args)))();
            handler_inst.once('complete', function(task) {
                callback(null, task && task.next);
            });
            handler_inst.handle(task)
        };
    };
};

module.exports = HandlerCallbackWrapper;