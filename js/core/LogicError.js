function LogicError(message) {
    this.name = "LogicError";
    this.message = message;
    this.stack = "Logic" + new Error(message).stack;
    this.toString = function () {return this.name + ": " + this.message};
}

LogicError.prototype = new Error();
