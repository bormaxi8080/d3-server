var UpdateKillerStateCommand = function() { };

UpdateKillerStateCommand.toString = function() {
    return "update_killer_state"
};

UpdateKillerStateCommand.prototype.execute = function(args) {
    if (args.clues) { Executor.run(AddCluesCommand, args) }
    context.events.notify("update_suspect_state", {
        text: args.text || "",
        clues: { all: context.case.knownClues(), new: args.clues },
        alibi: { value: false, updated: false },
        motive: { value: true, updated: false }
    });
};
