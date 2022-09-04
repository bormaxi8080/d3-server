var AddUnlockNewCaseTaskCommand = function() {};

AddUnlockNewCaseTaskCommand.toString = function() {
    return "add_unlock_new_case_task";
};

AddUnlockNewCaseTaskCommand.prototype.execute = function(args) {
    context.system.check_object(args, "options");
    context.system.check_key(args, "case");
    context.case.checkDefined(args.case);
    var type = "unlock_new_case";

    Executor.run(PushTaskCommand, {
        type: type,
        object_id: args.case,
        cost: (args.hasOwnProperty("cost") ? args.cost : context.tasks.defaultCost(type)),
        triggers: args.triggers || []
    });
};
