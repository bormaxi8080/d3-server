var ClickSuspectCommand = function() {};

ClickSuspectCommand.toString = function() {
    return "click_suspect";
};

ClickSuspectCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.case.checkActiveCase();
    context.case.checkTriggers();

    var suspect_id = args.suspect;

    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый " + suspect_id + " недоступен в деле " + context.case.activeCase());
    }

    var suspect = context.case.knownSuspects(suspect_id);
    if (suspect.state == "arrest") {
        Executor.run(ArrestSuspectCommand, args);
    } else if (suspect.state != "default") {
        Executor.run(TalkSuspectCommand, args);
    }
};
