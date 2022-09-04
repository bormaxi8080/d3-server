var BuyPackCommand = function() {};

BuyPackCommand.toString = function() {
    return "buy_pack";
};

BuyPackCommand.prototype.execute = function(args) {
    context.system.check_key(args, "pack_type");
    var pack_id = args.pack_type;

    if (!context.defs.has_def("packs.pack_types." + pack_id)) {
        throw new LogicError("Неизвестный пак!\npack_type: " + pack_id);
    }

    var pack_def = context.defs.get_def("packs.pack_types." + pack_id);
    context.player.reduce_balance(pack_def.price);

    for (var item_id in pack_def.content) {
        Executor.run(AddItemCommand, item_id, pack_def.content[item_id]);
    }
    context.track.buy_pack(pack_id, pack_def.price);
};
