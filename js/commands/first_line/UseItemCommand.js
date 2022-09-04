var UseItemCommand = function() {};

UseItemCommand.toString = function() {
    return "use_item";
};

UseItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "item_type");

    var item_type = args.item_type;
    var count = context.player.get_item_count(item_type);
    if (count > 0) {
        var item_def = context.defs.get_def("items.item_types." + item_type);
        context.player.set_item_count(item_type, count - 1);
        context.energy.add(item_def.energy);
    } else {
        throw new LogicError("Невозможно использовать предмет: " + item_type);
    }
};
