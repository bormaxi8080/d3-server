var AddForensicItemCommand = function() {};

AddForensicItemCommand.toString = function() {
    return "add_forensic_item";
};

AddForensicItemCommand.prototype.execute = function(forensic_item_id) {
    context.case.checkForensicItemDefined(forensic_item_id);
    if (context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем уже есть!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }
    var forensic_item_def = context.case.forensicItems(forensic_item_id);
    var initial_state = forensic_item_def.initial_state;
    var forensic_item = { state: initial_state, index: context.case.foundForensicItemsCount() }
    context.storage.set_property(context.case.foundForensicItemsProp(forensic_item_id), forensic_item);

    if (forensic_item_def.states[initial_state].minigame) {
        Executor.run(PushTaskCommand, {type: "examine", object_id: forensic_item_id});
    };
};
