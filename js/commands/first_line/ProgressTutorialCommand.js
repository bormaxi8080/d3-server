var ProgressTutorialCommand = function() {};

ProgressTutorialCommand.toString = function() {
    return "progress_tutorial";
};

ProgressTutorialCommand.prototype.execute = function(args) {
    var tutorial_state = context.qa_manager.handle('tutorial_current_state');
    if (tutorial_state) {
        var tutorial_list = context.qa_manager.handle('tutorial_steps');
        var tutorial_index = tutorial_list.indexOf(tutorial_state);
        if (tutorial_index < 0) {
            throw new LogicError("Состояние туториала \"" + tutorial_state + "\" не найдено среди доступных шагов, невозможно перейти к следующему шагу");
        }
        if (tutorial_index == 0) {
            context.track.adx_event("TutorStart", "");
        }
        var time = context.last_command_time();
        var last_time = context.storage.has_property("tutorial.state_start_time") ? context.storage.get_property("tutorial.state_start_time")
                                                                                  : context.storage.get_property("options.init_time");
        context.track.event("tutor", "elapsed_time", null, tutorial_state, Math.max(Math.ceil((time - last_time) / 1000), 0));
        context.storage.set_property("tutorial.state_start_time", time);
        var new_state = (tutorial_list[tutorial_index + 1]) || null;
        if (new_state == null) {
            context.track.adx_event("TutorFinish", "1");
            context.storage.set_property("tutorial", null);
        } else {
            context.storage.set_property("tutorial.state", new_state);
        }
        context.events.notify("tutorial", new_state);
    }
};
