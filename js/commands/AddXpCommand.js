var AddXpCommand = function() { };

AddXpCommand.toString = function() {
    return "add_xp"
};

AddXpCommand.prototype.execute = function(value) {
    context.system.check_int_positive_or_0(value, 'value');
    if (value == 0) return;

    var lvl_index =  context.player.get_level() - 1;
    var levels = context.defs.get_def('levels.levels_list');
    var max_lvl_index = levels.length - 1;

    if (lvl_index >= max_lvl_index) return;

    var cur_xp = context.player.get_xp();
    var cur_lvl_cap = levels[lvl_index + 1].required_xp;
    var xp = cur_xp + value;

    var new_lvl_index = lvl_index;
    while (max_lvl_index > new_lvl_index && levels[new_lvl_index + 1].required_xp <= xp) {
        new_lvl_index++
        xp -= levels[new_lvl_index].required_xp
        context.track.levelup(new_lvl_index + 1, levels[new_lvl_index].reward);
        Executor.run(ApplyRewardCommand, levels[new_lvl_index].reward);
    }

    if (new_lvl_index == max_lvl_index) {
        xp = 0;
    }

    if (lvl_index != new_lvl_index) {
        context.player.set_level(new_lvl_index + 1);
        context.track.adx_event("LevelUp", new_lvl_index + 1);
        context.energy.refill();
        var time = context.last_command_time();
        Object.keys(context.partners.partner()).forEach(function(partner_id) {
            Executor.run(SendGiftCommand, partner_id, time, "levelup", 1, {items: {item_1 : 1}});
        });
    }

    context.player.set_xp(xp);

    if (lvl_index < new_lvl_index) {
        context.events.animate("exp", cur_xp, cur_lvl_cap);
        for (var index = lvl_index + 1; index < new_lvl_index; ++index) {
            context.events.animate("level", index, index + 1);
            context.events.animate("exp", 0, levels[index + 1].required_xp);
        };
        context.events.animate("level", new_lvl_index, new_lvl_index + 1);
        context.events.animate("exp", 0, xp);
        context.events.notify("levelup", new_lvl_index + 1);
    } else {
        context.events.animate("exp", cur_xp, xp);
    }
};

