var PushTriggersCommand = function() { };

PushTriggersCommand.toString = function() {
    return "push_triggers"
};

PushTriggersCommand.prototype.execute = function(new_triggers) {
    var triggersProp = context.case.triggersProp();

    if (!Array.isArray(new_triggers)) {
        throw new LogicError('Параметр new_triggers должен быть массивом');
    }

    for (var i in new_triggers) {
        if (new_triggers[i] == null) {
            throw new LogicError('Триггеры в new_triggers должны быть объектами');
        }
    }

    context.storage.set_property(triggersProp, context.case.triggers().concat(new_triggers));
};
