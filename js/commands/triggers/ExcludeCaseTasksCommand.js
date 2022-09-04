var ExcludeCaseTasksCommand = function() { };

ExcludeCaseTasksCommand.toString = function() {
    return "exclude_case_tasks";
};

ExcludeCaseTasksCommand.prototype.execute = function() {
    if (context.case.starsLeftToGet() == 0) {
        Executor.run(DeleteTasksCommand, "earn_stars", null);
    }

    var stars_left = context.case.starsLeft();
    var boosters = context.defs.get_def("boosters.booster_types");
    if (stars_left == 0) {
        Executor.run(DeleteTasksCommand, "buy_booster", null);
    } else {
        for (var booster_id in boosters) {
            var booster_def = context.defs.get_def("boosters.booster_types." + booster_id);
            if (booster_def.require && stars_left < booster_def.require.star) {
                Executor.run(DeleteTasksCommand, "buy_booster", booster_id);
            }
        }
    }
};
