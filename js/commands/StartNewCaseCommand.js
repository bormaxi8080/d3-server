var StartNewCaseCommand = function() { };

StartNewCaseCommand.toString = function() {
    return "start_new_case"
};

StartNewCaseCommand.prototype.execute = function(case_id) {
    context.case.checkDefined(case_id);

    var new_case = context.defs.get_def("cases." + case_id);
    var user_case_data = {
        "status": "open",
        "medals": [],
        "stars": 0,
        "opened_scenes": {},
        "found_lab_items": {},
        "found_forensic_items": {},
        "known_clues": [],
        "known_suspects": {},
        "performed_transitions": [],
        "performed_custom_tasks": [],
        "tasks": [],
        "chapter": {
            "index": 0,
            "progress": 0,
            "completed": false
        },
        "info": {
            "victim": "default",
            "weapon": "default",
            "killer": "default"
        },
        "mistaken_arrests": 0
    }

    context.storage.set_property("open_cases." + case_id, user_case_data);
    context.storage.set_property("immediate_data.active_case", case_id);
    Executor.run(PushTriggersCommand, new_case.on_start);
    context.track.progress_step(case_id, "100_case_start");
};
