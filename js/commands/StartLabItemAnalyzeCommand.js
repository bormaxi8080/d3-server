var StartLabItemAnalyzeCommand = function() {};

StartLabItemAnalyzeCommand.toString = function() {
    return "start_lab_item_analyze";
};

StartLabItemAnalyzeCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');

    var lab_item_id = args.lab_item
    var time = parseInt(args.time)

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state != "new") {
        throw new LogicError("Неподходящий стейт для начала исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    }

    var analyzed_items = context.case.analyzedItems();
    if (lab_item_id in analyzed_items) {
        throw new LogicError("Предмет уже исследуется!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var new_analyzed_item = {
        end: (args.time + context.case.analyzeTime(lab_item_id) * 1000)
    }
    var new_state = "analyzing"

    context.storage.set_property(context.case.analyzedItemsProp(lab_item_id), new_analyzed_item);
    context.storage.set_property(context.case.foundLabItemsProp(lab_item_id) + ".state", new_state);
};
