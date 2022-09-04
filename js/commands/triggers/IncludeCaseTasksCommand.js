var IncludeCaseTasksCommand = function() {};

IncludeCaseTasksCommand.toString = function() {
    return "include_case_tasks";
};

IncludeCaseTasksCommand.prototype.execute = function() {
    var medals = context.case.medals();
    Executor.run(DeleteTasksCommand, "earn_stars", null);
    if (context.case.starsLeftToGet() >= 1) {
        Executor.run(PushTaskCommand, {type: "earn_stars", object_id: "default"});
    }

    var stars_left = context.case.starsLeft();
    var boosters = context.defs.get_def("boosters.booster_types");
    var booster_order = context.defs.get_def("boosters.interface_order");
    Executor.run(DeleteTasksCommand, "buy_booster", null);

    booster_order.forEach(function(booster_id) {
        var booster_def = boosters[booster_id];
        if (booster_def.require) {
            if ((medals.indexOf(booster_def.require.medal) >= 0) && (stars_left >= booster_def.require.star)) {
                Executor.run(PushTaskCommand, {type: "buy_booster", object_id: booster_id});
            }
        }
    });
};
