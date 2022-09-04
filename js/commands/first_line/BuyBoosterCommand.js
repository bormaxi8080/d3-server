var BuyBoosterCommand = function() {};

BuyBoosterCommand.toString = function() {
    return "buy_booster";
};

BuyBoosterCommand.prototype.execute = function(args) {
    context.system.check_key(args, "booster_type");

    var booster_type = args.booster_type;

    if (!(args.booster_type in context.defs.get_def("boosters.booster_types"))) {
        throw new LogicError("Неизвестный бустер!\nbooster_type: " + booster_type);
    }

    var booster_def = context.defs.get_def("boosters.booster_types." + booster_type);
    context.player.reduce_balance(booster_def.price);
    Executor.run(AddBoosterCommand, {"booster_type":booster_type, "count":booster_def.pack_size});
    context.track.buy_booster(booster_type, booster_def.price);
};
