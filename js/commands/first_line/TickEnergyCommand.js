var TickEnergyCommand = function() { };

TickEnergyCommand.toString = function() {
    return "tick_energy"
};

TickEnergyCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_number_positive(args.time, 'time');

    var time = parseInt(args.time);
    var count = parseInt(args.count) || 1;
    var energy = context.energy.get();
    var max = context.energy.get_max();

    if (!context.storage.has_property(context.energy.incrementProp)) {
        throw new LogicError("Незапланированный тик энергии!");
    }

    var energy_increment_time = parseInt(context.energy.get_increment_time(count));
    if (!energy_increment_time) {
        throw new LogicError("Невозможно натикать такое колличество энергии!\nenergy: " + energy + ", max: " + max + ", count: " + count);
    } else if (time < energy_increment_time) {
        throw new LogicError("Тик энергии для начисления " + count + " энергии произошел слишком рано!\nhappened: " + time + ", planned: " + energy_increment_time);
    }

    context.energy.add(count);
    energy += count;

    if (energy < max) {
        var next_tick_time = energy_increment_time + context.energy.get_increment_duration() * 1000;
        context.storage.set_property(context.energy.incrementProp, next_tick_time);
    } else {
        context.storage.set_property(context.energy.incrementProp, null);
    }
};
