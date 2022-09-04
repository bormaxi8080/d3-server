var ArrestSuspectCommand = function () {};

ArrestSuspectCommand.toString = function () {
    return "arrest_suspect";
};

ArrestSuspectCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.case.checkActiveCase();

    var suspect_id = args.suspect;

    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый " + suspect_id + " недоступен в деле " + context.case.activeCase());
    }

    var suspect = context.case.knownSuspects(suspect_id);
    if (suspect.state != "arrest") {
        throw new LogicError("Для ареста подозреваемого необходим стейт arrest;\nsuspect: " + suspect_id + "; suspect_state: " + suspect.state + "; case: " + context.case.activeCase());
    }
    var arrest_data = context.case.arrestData();
    var arrest_cost = context.case.suspectClickCost(suspect_id);

    Executor.run(ConsumeStarCommand, arrest_cost);
    context.events.arrest(suspect_id);

    if (arrest_data.killer == suspect_id) {
        context.track.event("arrest", null, null, context.case.activeCase(), context.case.mistakenArrestsCount());
        for (var other_suspect_id in context.case.knownSuspects()) {
            Executor.run(SetSuspectStateCommand, {"suspect": other_suspect_id, "state": "default"});
        }
        Executor.run(DeleteTasksCommand, "arrest", null);
        Executor.run(PushTriggersCommand, arrest_data.on_success);
        Executor.run(AddMedalCommand, "bronze");
    } else {
        context.storage.inc_property(context.case.mistakenArrestsCountProp(context.case.activeCase()));
        Executor.run(SetSuspectStateCommand, {"suspect": suspect_id, "state": "default"})
        Executor.run(PushTriggersCommand, arrest_data.on_fail);
    }
};

