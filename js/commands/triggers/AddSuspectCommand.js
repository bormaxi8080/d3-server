var AddSuspectCommand = function() {};

AddSuspectCommand.toString = function() {
    return "add_suspect";
};

AddSuspectCommand.prototype.execute = function(suspect_id) {
    context.case.checkSuspectDefined(suspect_id);
    if (context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем уже есть!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }
    var suspect_def = context.case.suspects(suspect_id);
    var suspect = {
        alibi: null,
        motive: null,
        clues: [],
        state: "default",
        talked: false
    };
    context.storage.set_property(context.case.knownSuspectsProp(suspect_id), suspect);
};
