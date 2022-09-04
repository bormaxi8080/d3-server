var ExecuteNextTriggerCommand = function() { };

ExecuteNextTriggerCommand.toString = function() {
    return "execute_next_trigger"
};

ExecuteNextTriggerCommand.prototype.execute = function(args) {
    context.case.checkActiveCase();
    var triggers = context.case.triggers();
    var first_trigger = triggers.shift();
    context.storage.set_property(context.case.triggersProp(), triggers);

    if (first_trigger) {
        for (var key in first_trigger) {
            Executor.run(key, first_trigger[key])
        }
    } else {
        throw new LogicError("Нет триггеров для выполнения (ExecuteNextTriggerCommand)")
    }
};
