var InitArrestStateCommand = function() {};

InitArrestStateCommand.toString = function() {
    return "init_arrest_state";
};

InitArrestStateCommand.prototype.execute = function() {
    for (var suspect_id in context.case.knownSuspects()) {
        context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".state", "arrest");
    }
    Executor.run(DeleteTasksCommand, "talk", null);
    Executor.run(PushTaskCommand, {type: "arrest", object_id: "arrest"});
};
