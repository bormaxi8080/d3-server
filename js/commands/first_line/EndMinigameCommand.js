var EndMinigameCommand = function() {};

EndMinigameCommand.toString = function() {
    return "end_minigame";
};

EndMinigameCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "energy");
    context.system.check_number_positive(args.time, 'time');
    context.system.check_number_positive(args.energy, 'energy');

    context.case.checkActiveCase();
    context.case.checkActiveMinigame();
    context.case.checkTriggers();

    var time = parseInt(args.time);
    var energy = parseInt(args.energy);
    var minigame = context.case.activeMinigame();
    var case_id = context.case.activeCase();

    if (minigame.start >= time) {
        throw new LogicError("Попытка завершить миниигру с неверным timestamp!");
    }

    if (energy > context.defs.get_def("energy_settings.minigame_start_energy")) {
         throw new LogicError("Неверное начисление энергии!\nenergy: " + args.energy);
    }

    context.energy.add(energy);

    var forensic_item_id = minigame.forensic_item;
    var forensic_item = context.case.foundForensicItems(forensic_item_id);
    var state_def = context.case.forensicItems(forensic_item_id).states[forensic_item.state];

    var event_name = forensic_item_id + "_" + forensic_item.state;

    var minigame_type = state_def.minigame.data.type;
    context.track.event("minigame_energy", case_id, minigame_type, event_name, energy);
    context.track.event("minigame_time", case_id, minigame_type, event_name,  Math.ceil((time - minigame.start) / 1000));

    context.storage.set_property(context.case.activeMinigameProp, null);

    Executor.run(ConsumeStarCommand, context.case.minigameCost(forensic_item_id));
    Executor.run(PushTriggersCommand, state_def.minigame.on_complete);
    Executor.run(SetForensicItemStateCommand, {
        forensic_item: forensic_item_id,
        state: state_def.minigame.next_state
    });
};
