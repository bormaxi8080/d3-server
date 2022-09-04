var UpdateSuspectStateCommand = function() { };

UpdateSuspectStateCommand.toString = function() {
    return "update_suspect_state"
};

UpdateSuspectStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    var suspect_id = args.suspect;
    var update_alibi = context.system.is_boolean(args.alibi);
    var update_motive = context.system.is_boolean(args.motive);

    if (args.clues) { Executor.run(AddSuspectCluesCommand, args) }
    if (update_alibi) { Executor.run(SetSuspectAlibiCommand, suspect_id, args.alibi) }
    if (update_motive) { Executor.run(SetSuspectMotiveCommand, suspect_id, args.motive) }

    var suspect = context.case.knownSuspects(suspect_id);
    context.events.notify("update_suspect_state", {
        suspect: args.suspect,
        text: args.text || "",
        clues: { all: suspect.clues, new: args.clues || [] },
        alibi: { value: suspect.alibi, updated: update_alibi },
        motive: { value: suspect.motive, updated: update_motive }
    });
};
