var AddCluesCommand = function() { };

AddCluesCommand.toString = function() {
    return "add_clues"
};

AddCluesCommand.prototype.execute = function(args) {
    context.system.check_key(args, "clues");

    var clues = args.clues
    var known_clues = context.case.knownClues();
    clues.forEach(function(clue_id) {
        if (known_clues.indexOf(clue_id) >= 0) {
            throw new LogicError("Примета с таким именем уже известна!\ncase_id: " + context.case.activeCase() + "; clue_id: " + clue_id);
        }
    })
    context.storage.set_property(context.case.knownCluesProp(), known_clues.concat(clues));
};
