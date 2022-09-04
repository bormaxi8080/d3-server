var AddItemCommand = function() { };

AddItemCommand.toString = function() {
    return "add_item";
}

AddItemCommand.prototype.execute = function(item_id, count) {
    if (!context.defs.has_def("items.item_types." + item_id)) {
        throw new LogicError("Неизвестный идентификатор предмета " + item_id);
    }

    context.player.set_item_count(item_id, context.player.get_item_count(item_id) + count);
};
