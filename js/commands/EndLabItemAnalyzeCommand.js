var EndLabItemAnalyzeCommand = function() {};

EndLabItemAnalyzeCommand.toString = function() {
    return "end_lab_item_analyze";
};

EndLabItemAnalyzeCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');
    context.case.checkActiveCase();

    var lab_item_id = args.lab_item;
    var time = parseInt(args.time);

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item_def = context.case.labItems(lab_item_id);
    var lab_item = context.case.foundLabItems(lab_item_id);

    var analyzed_items = context.case.analyzedItems();
    if (!(lab_item_id in analyzed_items)) {
        throw new LogicError("Предмет не находится в процессе исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var end_time = analyzed_items[lab_item_id].end;
    if (end_time > time) {
        throw new LogicError("Исследование предмета еще не завершено!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    context.storage.set_property(context.case.analyzedItemsProp(lab_item_id), null);

    var new_state = "done"
    context.storage.set_property(context.case.foundLabItemsProp(lab_item_id) + ".state", new_state);

    Executor.run(ShowLabItemAnalyzeResultCommand, args);
    Executor.run(PushTriggersCommand, lab_item_def.on_analyze);
    Executor.run(DeleteTasksCommand, "analyze", lab_item_id);
};
