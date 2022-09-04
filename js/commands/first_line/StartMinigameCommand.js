var StartMinigameCommand = function() {};

StartMinigameCommand.toString = function() {
    return "start_minigame";
};

StartMinigameCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "forensic_item");
    context.system.check_number_positive(args.time, 'time');

    var forensic_item_id = args.forensic_item;
    var time = parseInt(args.time);

    context.case.checkActiveCase();
    context.case.checkTriggers();
    context.case.checkForensicItemDefined(forensic_item_id);
    if (!context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }

    var forensic_item = context.case.foundForensicItems(forensic_item_id);
    var forensic_item_def = context.case.forensicItems(forensic_item_id);
    var state_def = forensic_item_def.states[forensic_item.state];
    if (!state_def.minigame) {
        throw new LogicError("Неподходящий стейт для начала миниигры!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id + "; forensic_item.state: " + forensic_item.state);
    }

    if (context.storage.has_property(context.case.activeMinigameProp)) {
        throw new LogicError("Миниигра уже начата!");
    }

    context.case.checkStarsCount(context.case.minigameCost(forensic_item_id));

    var active_minigame = {
        forensic_item: forensic_item_id,
        start: time
    };

    context.storage.set_property(context.case.activeMinigameProp, active_minigame);
};
