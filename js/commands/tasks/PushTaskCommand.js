var PushTaskCommand = function() {};

PushTaskCommand.toString = function() {
    return "push_task";
};

PushTaskCommand.prototype.execute = function(new_task) {
    context.system.check_key(new_task, "type");
    context.system.check_key(new_task, "object_id");
    var tasks = context.case.tasks();
    var task_exists = tasks.some(function(task) {
        return (task.type === new_task.type) && (task.object_id === new_task.object_id);
    });

    if (task_exists) {
        throw new LogicError("Такая задача уже существует: " + JSON.stringify(new_task));
    } else {
        context.storage.set_property(context.case.tasksProp(), tasks.concat([new_task]));
        context.events.showTablet();
    }
};
