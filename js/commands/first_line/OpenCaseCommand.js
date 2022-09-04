var OpenCaseCommand = function() { };

OpenCaseCommand.toString = function() {
    return "open_case"
};

OpenCaseCommand.prototype.execute = function(args) {
    context.system.check_key(args, "case");
    var case_id = args.case;

    context.case.checkDefined(case_id);

    var unlocked_cases = context.storage.get_property("unlocked_cases");
    var unlocked_cases_index = unlocked_cases.indexOf(case_id);
    if (unlocked_cases_index >= 0) {
        Executor.run(StartNewCaseCommand, case_id);
        unlocked_cases.splice(unlocked_cases_index, 1);
        context.storage.set_property("unlocked_cases", unlocked_cases);
    } else if (!context.case.isOpened(case_id)) {
        throw new LogicError("Дело не доступно для открытия!\ncase_id: " + case_id);
    } else {
        context.storage.set_property("immediate_data.active_case", case_id);
    }

    Executor.run(DropActiveSceneCommand);
    Executor.run(DropActiveMinigameCommand);
};
