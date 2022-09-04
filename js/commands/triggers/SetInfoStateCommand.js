var SetInfoStateCommand = function() {};

SetInfoStateCommand.toString = function() {
    return "set_info_state";
};

SetInfoStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "type");
    context.system.check_key(args, "state");

    var type = args.type;
    var state = args.state;

    if(["killer", "weapon", "victim"].indexOf(type) < 0) {
        throw new LogicError("Некорректный тип информации!\ncase_id: " + context.case.activeCase() + "; type: " + type);
    }

    context.case.checkInfoStateDefined(type, state);
    context.storage.set_property(context.case.infoProp() + "." + type, state);
};
