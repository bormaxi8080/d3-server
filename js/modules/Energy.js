function Energy() { }

Energy.prototype.energyProp = "player.energy.current";
Energy.prototype.incrementProp = "player.energy.increment_time";

Energy.prototype.spend = function(amount, time) {
    amount = parseInt(amount);
    if (amount == 0) return; // не ошибка, но ничего не делаем.

    context.system.check_int_positive(amount, null);
    context.system.check_number_positive(time, 'time');

    var current_energy = context.storage.get_property(this.energyProp);
    var new_energy = current_energy - amount;

    context.system.check_int_positive_or_0(new_energy, 'new_energy');
    context.storage.set_property(this.energyProp, new_energy);

    var energy_max = this.get_max();
    context.system.check_int_positive(energy_max, 'energy_max');

    var incrementTime = context.storage.has_property(this.incrementProp) ?
                            context.storage.get_property(this.incrementProp) : 0;
    if (new_energy < energy_max && (!incrementTime || current_energy >= energy_max)) {
        var interval = this.get_increment_duration();
        context.storage.set_property(this.incrementProp, time + interval * 1000);
    }

    context.events.animate("energy", current_energy, new_energy);
};

Energy.prototype.add = function(amount) {
    amount = parseInt(amount);
    if (amount == 0) return; // не ошибка, но ничего не делаем.

    context.system.check_int_positive(amount, null);

    var energy = parseInt(context.storage.get_property(this.energyProp));
    var new_energy = energy + amount;
    context.storage.set_property(this.energyProp, new_energy);

    if (new_energy >= this.get_max()) {
        if (context.storage.has_property(this.incrementProp)) {
            context.storage.set_property(this.incrementProp, null);
        }
    }

    context.events.animate("energy", energy, new_energy);
};

Energy.prototype.refill = function() {
    var current = this.get();
    var max = this.get_max();
    if (current < max) {
        this.add(max - current);
    }
}

Energy.prototype.get = function() {
    return context.storage.get_property("player.energy.current");
};

Energy.prototype.get_max = function() {
    return context.defs.get_def("energy_settings.max_energy");
};

Energy.prototype.get_increment_duration = function() {
    return context.defs.get_def("energy_settings.energy_restore_time");
};

Energy.prototype.get_increment_time = function(count) {
    if (count == 0 || this.get() + count > this.get_max()) {
        return null;
    } else {
        return context.storage.get_property(this.incrementProp) + (count - 1) * this.get_increment_duration() * 1000;
    }
};

Energy.prototype.get_increment_count = function(time) {
    if (this.get() >= this.get_max()) {
        return 0;
    } else {
        var time_delta = time - context.storage.get_property(this.incrementProp);
        if (time_delta < 0) {
            return 0
        } else {
            return Math.min(1 + Math.floor(time_delta / (this.get_increment_duration() * 1000)), this.get());
        }
    }
};

Energy.prototype.energy_restore_time = function(energy) {
    var delta = (energy == null ? this.get_max() : energy) - this.get();
    if (delta < 0) {
        return null;
    } else {
        return this.get_increment_time(delta);
    }
};
