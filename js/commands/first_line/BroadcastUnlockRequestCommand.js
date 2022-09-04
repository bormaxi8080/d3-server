var BroadcastUnlockRequestCommand = function() {};

BroadcastUnlockRequestCommand.toString = function() {
    return "broadcast_unlock_request";
};

BroadcastUnlockRequestCommand.prototype.execute = function(args) {
    context.system.check_key(args, "case");
    context.system.check_key(args, "time");
    var case_id = args.case;

    context.case.checkDefined(case_id);

    // tutorial behaviour workaround
    if (context.qa_manager.handle("tutorial_current_state") && (case_id === "case_02") && context.case.isNew(case_id)) {
        var unlock_prop = context.partners.unlockRequestsProp(case_id)
        context.storage.set_property(unlock_prop, ["detective", "secretary", "hacker"])
    } else {
        context.partners.broadcastUnlockRequests(case_id, args.time);
    }
};
