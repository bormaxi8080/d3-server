var ClickTaskCommand = function() {};

ClickTaskCommand.toString = function() {
    return "click_task";
};

ClickTaskCommand.prototype.execute = function(args) {
    context.system.check_key(args, "index");
    var index = parseInt(args.index);
    context.system.check_int_positive_or_0(index);
    context.case.checkActiveCase();
    context.case.checkTriggers();

    var tasks = context.case.tasks();
    if (index >= tasks.length) {
        throw new LogicError("Индекс задачи должен находить в интервале [0.." + (tasks.length - 1) + "]!\ncase_id: " + context.case.activeCase() + "; index: " + index);
    }
    context.tasks.handle(tasks[index]);
};
