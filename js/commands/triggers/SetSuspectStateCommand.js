var SetSuspectStateCommand = function() {};

SetSuspectStateCommand.toString = function() {
    return "set_suspect_state";
};

// Accepts hash: { "suspect": "suspect_1", "state": "state_1" }
SetSuspectStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.system.check_key(args, "state");

    var suspect_id = args.suspect;
    var new_state = args.state;

    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }

    var suspect_def = context.case.suspects(suspect_id);
    if (!(new_state in suspect_def.states) && (new_state != "arrest") && (new_state != "default")) {
        throw new LogicError("Попытка установить неправильный стейт для подозреваемого!\ncase_id: " + context.case.activeCase() +
            "; suspect_id: " + suspect_id + "; new_state: " + new_state);
    }

    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".state", new_state);
    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".talked", false);

    if (new_state != "arrest" && context.case.isSuspectClickable(suspect_id)) {
        Executor.run(PushTaskCommand, {type: "talk", object_id: suspect_id});
    } else if (new_state == "default") {
        Executor.run(DeleteTasksCommand, "talk", suspect_id);
    }
};
