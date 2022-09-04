var AddMedalCommand = function() {};

AddMedalCommand.toString = function() {
    return "add_medal"
};

AddMedalCommand.prototype.execute = function(medal_type) {
    var medals = context.case.medals();
    var case_id = context.case.activeCase();
    if (medals.indexOf(medal_type) >= 0) {
        throw new LogicError("Медаль этого типа уже выдана!\ncase_id: " + case_id + "; medal_type: " + medal_type);
    }

    context.storage.set_property(context.case.medalsProp(), medals.concat([medal_type]));
    if (medal_type == "gold" && context.case.status() == "complete") {
        Executor.run(IncludeCaseTasksCommand);
    }

    if (medal_type == "silver") {
        context.track.event("case_walkthrough_time", null, null, case_id, context.case.timeFromOpening(context.last_command_time()));
        for (var scene in context.case.openedScenes()) {
            context.track.event("case_end_stars", null, case_id, scene, context.case.sceneStars(scene));
        }
    }

    context.events.notify("medal_received", medal_type);
};
