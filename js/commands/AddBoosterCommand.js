var AddBoosterCommand = function() { };

AddBoosterCommand.toString = function() {
    return "add_booster";
};

AddBoosterCommand.prototype.execute = function(args) {
    context.system.check_key(args, "booster_type");
    context.system.check_key(args, "count");

    var booster_type = args.booster_type;
    var count = args.count;

    if (!(args.booster_type in context.defs.get_def("boosters.booster_types"))) {
        throw new LogicError("Неизвестный бустер!\nbooster_type: " + booster_type);
    }
    context.player.set_booster_count(booster_type, context.player.get_booster_count(booster_type) + count);
};
