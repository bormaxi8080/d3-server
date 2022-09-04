var AddSuspectCluesCommand = function() {};

AddSuspectCluesCommand.toString = function() {
    return "add_suspect_clues";
};

AddSuspectCluesCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.system.check_key(args, "clues");

    var suspect_id = args.suspect;
    var clues = args.clues
    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }

    var suspect_def = context.case.suspects(suspect_id);
    var suspect = context.case.knownSuspects(suspect_id);

    clues.forEach(function(clue_id) {
        if (!(clue_id in suspect_def.clues)) {
            throw new LogicError("Попытка добавить несуществующую примету подозреваемого!\ncase_id: " + context.case.activeCase() +
                "; suspect_id: " + suspect_id + "; clue_id: " + clue_id);
        }

        if (suspect.clues.indexOf(clue_id) >= 0) {
            throw new LogicError("Примета уже добавлена для подозреваемого!\ncase_id: " + context.case.activeCase() +
                "; suspect_id: " + suspect_id + "; clue_id: " + clue_id);
        }

        suspect.clues.push(clue_id)
    })

    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + '.clues', suspect.clues);
};
