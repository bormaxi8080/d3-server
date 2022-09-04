var UnlockNewCaseCommand = function() { };

UnlockNewCaseCommand.toString = function() {
    return "unlock_new_case";
};

UnlockNewCaseCommand.prototype.execute = function(case_id) {
    context.case.checkDefined(case_id);

    var new_cases = context.storage.get_property("new_cases");
    if (new_cases[case_id]) {
        throw new LogicError("Дело уже добавлено в список новых дел!\ncase_id: " + case_id);
    } else if (context.case.isOpened(case_id) || context.case.isUnlocked(case_id)) {
        throw new LogicError("Дело уже открыто!\ncase_id: " + case_id);
    } else {
        context.storage.set_property("new_cases." + case_id, {});
        context.case.setOpeningTime(context.last_command_time());
        context.events.notify("new_case", case_id);
    }
};
