var SetForensicItemStateCommand = function() {};

SetForensicItemStateCommand.toString = function() {
    return "set_forensic_item_state";
};

// Accepts hash: { "forensic_item": "item_1", "state": "state_1" }
SetForensicItemStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "forensic_item");
    context.system.check_key(args, "state");

    var forensic_item_id = args.forensic_item;
    var new_state = args.state;

    context.case.checkForensicItemDefined(forensic_item_id);
    if (!context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }

    var forensic_item_def = context.case.forensicItems(forensic_item_id);
    if (!(new_state in forensic_item_def.states)) {
        throw new LogicError("Попытка установить неправильный стейт для судебного предмета!\ncase_id: " + context.case.activeCase() +
            "; forensic_item_id: " + forensic_item_id + "; new_state: " + new_state);
    }

    context.storage.set_property(context.case.foundForensicItemsProp(forensic_item_id) + ".state", new_state);

    Executor.run(DeleteTasksCommand, "examine", forensic_item_id);
    if (forensic_item_def.states[new_state].minigame) {
        Executor.run(PushTaskCommand, {type: "examine", object_id: forensic_item_id});
    };
};
