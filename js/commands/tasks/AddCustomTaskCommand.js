var AddCustomTaskCommand = function() {};

AddCustomTaskCommand.toString = function() {
    return "add_custom_task";
};

AddCustomTaskCommand.prototype.execute = function(custom_task_id) {
    context.system.check_string(custom_task_id, "custom_task_id");
    var performed_custom_tasks = context.case.performedCustomTasks();
    if (performed_custom_tasks.indexOf(custom_task_id) >= 0) {
        throw new LogicError("Задача с данным идентификатором уже была добавлена!\ncase_id: " + context.case.activeCase() + "; custom_task_id: " + custom_task_id);
    }

    var custom_tasks = context.case.customTasks();
    if (!(custom_task_id in custom_tasks)) {
        throw new LogicError("Задача с данным идентификатором не найдена!\ncase_id: " + context.case.activeCase() + "; custom_task_id: " + custom_task_id);
    }
    performed_custom_tasks.push(custom_task_id);
    context.storage.set_property(context.case.performedCustomTasksProp(), performed_custom_tasks);
    var task = custom_tasks[custom_task_id];

    context.system.check_key(task, "cost");
    context.system.check_key(task, "on_click");
    context.system.check_key(task, "img");
    context.system.check_key(task, "action_text");
    context.system.check_key(task, "target_text");

    Executor.run(PushTaskCommand, {
        type: "custom",
        object_id: custom_task_id,
        img: task.img,
        action_text: task.action_text,
        target_text: task.target_text,
        cost: parseInt(task.cost)
    });

};
