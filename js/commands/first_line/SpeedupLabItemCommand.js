var SpeedupLabItemCommand = function () {};

SpeedupLabItemCommand.toString = function () {
    return "speedup_lab_item";
};

SpeedupLabItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "lab_item");
    context.system.check_key(args, "time");

    context.case.checkActiveCase();
    context.case.checkTriggers();

    var lab_item_id = args.lab_item;
    var time = parseInt(args.time);

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state != "analyzing") {
        throw new LogicError("Неподходящий стейт для ускорения исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    }

    var speedup_cost = context.case.analyzeSpeedupCost(lab_item_id, time);
    if (context.player.get_real_balance() < speedup_cost) {
        throw new LogicError("Недостаточное колличество кэша для ускорения исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    }

    context.track.event("lab_item_speedup", context.case.activeCase(), null, lab_item_id, context.case.analyzeTimeLeft(lab_item_id, time));
    context.player.reduce_real_balance(speedup_cost);
    context.storage.set_property(context.case.analyzedItemsProp(lab_item_id) + ".end", time);
    context.track.speedup("lab_research", {real_balance: speedup_cost});
};
