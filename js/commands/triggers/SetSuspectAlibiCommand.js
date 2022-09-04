var SetSuspectAlibiCommand = function() {};

SetSuspectAlibiCommand.toString = function() {
    return "set_suspect_alibi";
};

SetSuspectAlibiCommand.prototype.execute = function(suspect_id, alibi) {
    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }

    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + '.alibi', alibi);
};
