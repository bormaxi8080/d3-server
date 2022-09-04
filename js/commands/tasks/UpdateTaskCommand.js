var UpdateTaskCommand = function() {};

UpdateTaskCommand.toString = function() {
    return "update_task";
};

UpdateTaskCommand.prototype.execute = function(type, object_id, update_fields) {
    var tasks = context.case.tasks();
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        if (task.type == type && task.object_id == object_id) {
            for (k in update_fields) {
                task[k] = update_fields[k]
            }
            context.storage.set_property(context.case.tasksProp() + "." + i.toString(), task);
            break;
        }
    }
};
