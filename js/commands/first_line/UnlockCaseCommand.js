var UnlockCaseCommand = function() {};

UnlockCaseCommand.toString = function() {
    return "unlock_case";
};

UnlockCaseCommand.prototype.execute = function(args) {
    context.system.check_key(args, "case");
    var case_id = args.case;

    context.case.checkDefined(case_id);
    var case_prop = "new_cases." + case_id;
    if (context.storage.has_property(case_prop)) {
        var unlock_cost = context.partners.unlockRequestCost(case_id);
        context.player.reduce_balance(unlock_cost);
        var unlocked_cases = context.storage.get_property("unlocked_cases");
        if (unlocked_cases.indexOf(case_id) >= 0) {
            throw new LogicError("Дело уже разблокировано!\ncase_id: " + case_id);
        } else {
            unlocked_cases.push(case_id);
        }
        context.storage.set_property("unlocked_cases", unlocked_cases);
        context.storage.set_property(case_prop, null)
        context.events.notify("case_unlocked", case_id);
        context.track.testimonials(case_id, unlock_cost);
        context.track.event("case_unlock_time", null, null, case_id, context.case.timeFromOpening(context.last_command_time()));
    } else {
        throw new LogicError("Дело не доступно для разблокирования!\ncase_id: " + case_id);
    }
};
