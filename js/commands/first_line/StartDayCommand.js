var StartDayCommand = function () {};

StartDayCommand.toString = function () {
    return "start_day";
};

StartDayCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");

    var time = parseInt(args.time);
    var last_day_start = context.storage.get_property("options.last_day_start");

    var this_day_midnight = new Date(time).setUTCHours(0, 0, 0, 0);
    var prev_day_midnight = new Date(time).setUTCHours(-24, 0, 0, 0);

    if (last_day_start < prev_day_midnight) {
        context.storage.set_property("options.last_day_start", time);
        context.storage.set_property("player.hints", 1);
    } else if (last_day_start < this_day_midnight) {
        context.storage.set_property("options.last_day_start", time);
        var hints = context.storage.get_property("player.hints");
        if (hints < context.defs.get_def("hog_settings.HintMaxCount")) {
            context.storage.set_property("player.hints", hints + 1);
        }
    }
};

