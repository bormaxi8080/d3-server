var ClickLabItemCommand = function() {};

ClickLabItemCommand.toString = function() {
    return "click_lab_item";
};

ClickLabItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');

    var lab_item_id = args.lab_item
    var time = parseInt(args.time)

    context.case.checkActiveCase();
    context.case.checkTriggers();

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state === "new") {
        Executor.run(StartLabItemAnalyzeCommand, args)
    } else if (lab_item.state === "done") {
        Executor.run(ShowLabItemAnalyzeResultCommand, args)
    } else if (lab_item.state === "analyzing") {
        var left_time = context.case.analyzeTimeLeft(lab_item_id, time)
        if (left_time == 0) {
            Executor.run(EndLabItemAnalyzeCommand, args)
        } else {
            context.events.notify("speedup_lab_item", lab_item_id);
            Executor.run(SpeedupLabItemCommand, args);
        }
    } else {
        throw new LogicError("Неизвестный стейт лабораторного предмета!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    };
};
