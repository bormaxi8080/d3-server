var DeleteTasksCommand = function() {};

DeleteTasksCommand.toString = function() {
    return "delete_tasks";
};

DeleteTasksCommand.prototype.execute = function(type, object_id) {
    context.system.check_string(type);

    var tasks = context.case.tasks();
    var new_tasks = tasks.filter(function(task) {
        if (object_id) {
            return (task.type != type) || (task.object_id != object_id);
        } else {
            return (task.type != type);
        }
    });
    if (tasks.length != new_tasks.length) {
        context.storage.set_property(context.case.tasksProp(), new_tasks);
    }
};
