var ShowLabItemAnalyzeResultCommand = function() {};

ShowLabItemAnalyzeResultCommand.toString = function() {
    return "show_lab_item_analyze_result";
};

ShowLabItemAnalyzeResultCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');
    context.case.checkActiveCase();

    var lab_item_id = args.lab_item;
    var time = parseInt(args.time);

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    var lab_item_def = context.case.labItems(lab_item_id);

    var triggers;
    if (context.system.is_array(lab_item_def.analyze_movie)) {
        triggers = lab_item_def.analyze_movie.map(function(movie_id) {
            return {"show_movie": movie_id};
        });
    } else {
        triggers = [{"show_movie": lab_item_def.analyze_movie}];
    }

    Executor.run(PushTriggersCommand, triggers);
};
