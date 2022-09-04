var AddLabItemCommand = function() {};

AddLabItemCommand.toString = function() {
    return "add_lab_item";
};

AddLabItemCommand.prototype.execute = function(lab_item_id) {
    context.case.checkLabItemDefined(lab_item_id);
    if (context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем уже есть!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }
    var lab_item = { state: "new", index: context.case.foundLabItemsCount() };
    context.storage.set_property(context.case.foundLabItemsProp(lab_item_id), lab_item);
    Executor.run(PushTaskCommand, {type: "analyze", object_id: lab_item_id});
};
