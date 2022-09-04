var TalkSuspectCommand = function () {};

TalkSuspectCommand.toString = function () {
    return "talk_suspect";
};

TalkSuspectCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.case.checkActiveCase();

    var suspect_id = args.suspect;

    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый " + suspect_id + " недоступен в деле " + context.case.activeCase());
    }

    var suspect = context.case.knownSuspects(suspect_id);
    if (suspect.state == "arrest") {
        throw new LogicError("Для допроса необходим стейт не arrest;\nsuspect: " + suspect_id + "; case: " + context.case.activeCase());
    }

    if (suspect.state != "default") {
        var suspect_state_def = context.case.suspects(suspect_id).states[suspect.state];
        var triggers = [];
        if (suspect_state_def.talk_movie) {
            if (context.system.is_array(suspect_state_def.talk_movie)) {
                triggers = suspect_state_def.talk_movie.map(function(movie_id) {
                    return {"show_movie": movie_id};
                });
            } else {
                triggers = [{"show_movie": suspect_state_def.talk_movie}];
            }
        }

        if (!suspect.talked) {
            triggers = triggers.concat(suspect_state_def.on_talk)
            Executor.run(ConsumeStarCommand, context.case.suspectClickCost(suspect_id));
            Executor.run(DeleteTasksCommand, "talk", suspect_id);
            context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".talked", true);
        }

        Executor.run(PushTriggersCommand, triggers);
    }
};
