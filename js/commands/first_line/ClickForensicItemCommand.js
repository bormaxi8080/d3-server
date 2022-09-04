var ClickForensicItemCommand = function() {};

ClickForensicItemCommand.toString = function() {
    return "click_forensic_item";
};

ClickForensicItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "forensic_item");
    context.system.check_number_positive(args.time, 'time');

    var forensic_item_id = args.forensic_item;
    var time = parseInt(args.time);

    context.case.checkActiveCase();
    context.case.checkTriggers();

    context.case.checkForensicItemDefined(forensic_item_id);
    if (!context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }

    var state_def = context.case.forensicItemStateDef(forensic_item_id);

    if (state_def.minigame) {
        context.events.notify("start_minigame", {
            forensic_item_id: forensic_item_id,
            data: state_def.minigame.data,
            title: state_def.minigame.title,
            img_result: state_def.minigame.img_result || state_def.img
        });
    }

    if (state_def.movie) {
        var triggers;
        if (context.system.is_array(state_def.movie)) {
            triggers = state_def.movie.map(function(movie_id) {
                return {"show_movie": movie_id};
            });
        } else {
            triggers = [{"show_movie": state_def.movie}];
        }
        Executor.run(PushTriggersCommand, triggers);
    }
};
