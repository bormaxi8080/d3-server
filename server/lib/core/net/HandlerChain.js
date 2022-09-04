/**
 * Конвеерный обработчик запросов.
 */

var Task = function(request, response) {
    this.request = request;
    this.response = response;
    this.data = null;
    this.next = null;
};

module.exports = function () {
    this.handlers = {};
    var _handlers = this.handlers;
    var _initial = null;
    var onChainComplete = null;
    var _self = this;

    var startNext = function(handler, task) {
        if (typeof(handler) === "function") {
            task = handler.call(null, task);
            onHandlerComplete(task);
        } else {
            handler.once("complete", onHandlerComplete);
            handler.handle(task);
        }
    };

    var onHandlerComplete = function(task) {
        if (!task || (task && task.next == null)) {
            _self.onChainComplete();
            return;
        }

        var next = task.next;

        if (!(next in _handlers)) throw new Error("Next handler "+next+" not found!");

        startNext(_handlers[next], task);
    };

    this.setStartHandler = function(name, handler) {
        this.addHandler(handler, name);
        _initial = handler;
    };

    this.addHandler = function(name, handler) {
        _handlers[name] = handler;
    };

    this.handle = function(request, response, onChainComplete) {
        var task = new Task(request, response);
        _self.onChainComplete = onChainComplete;
        startNext(_initial, task);
    };

};