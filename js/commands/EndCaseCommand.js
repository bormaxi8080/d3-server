var EndCaseCommand = function () {};

EndCaseCommand.toString = function () {
    return "end_case";
};

EndCaseCommand.prototype.execute = function() {
    var case_id = context.case.activeCase();
    context.track.progress_step(case_id, "next_case_unlocked");
    context.case.setStatus("complete");
    Executor.run(IncludeCaseTasksCommand);
};
