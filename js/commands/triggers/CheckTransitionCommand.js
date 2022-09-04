var CheckTransitionCommand = function() {};

CheckTransitionCommand.toString = function() {
    return "check_transition";
};

CheckTransitionCommand.prototype.execute = function(transition_id) {
    var performed_transitions = context.case.performedTransitions();
    if (performed_transitions.indexOf(transition_id) >= 0) {
        return;
    }

    var transitions = context.case.transitions();
    if (!(transition_id in transitions)) {
        throw new LogicError("Переход с данным идентификатором не существует!\ncase_id: " + context.case.activeCase() + "; transition_id: " + transition_id);
    }

    var transition = transitions[transition_id];
    var preconditions_completed = true;
    transition.preconditions.forEach(function(conditions) {
        if (preconditions_completed == false) return;
        for (var condition_name in conditions) {
            var condition = conditions[condition_name];
            if (typeof condition === 'object') {
                for (var object_id in condition) {
                    var expected_state = condition[object_id];
                    var case_object;
                    if (condition_name === "forensic_item_state") {
                        context.case.checkForensicItemDefined(object_id);
                        case_object = context.case.foundForensicItems(object_id);
                    } else if (condition_name === "lab_item_state") {
                        context.case.checkLabItemDefined(object_id);
                        case_object = context.case.foundLabItems(object_id);
                    } else if (condition_name === "suspect_state" || condition_name === "suspect_state_talked") {
                        context.case.checkSuspectDefined(object_id);
                        case_object = context.case.knownSuspects(object_id);
                    } else if (condition_name === "scene_state") {
                        context.case.checkSceneDefined(object_id);
                        case_object = context.case.openedScenes(object_id);
                    } else {
                        throw new LogicError("Неизвестное условие перехода!\ncase_id: " + context.case.activeCase() + "; transition_id: " + transition_id + "; condition: " + condition_name);
                    }
                    if (!case_object ||
                        (case_object.state != expected_state) ||
                        (condition_name === "suspect_state_talked" && !case_object.talked)) {
                        preconditions_completed = false;
                        return;
                    }
                }
            } else if (typeof condition === 'string') {
                if (condition_name === "custom_task_completed") {
                    preconditions_completed = context.case.isCustomTaskCompleted(condition);
                } else {
                    throw new LogicError("Неизвестное условие перехода!\ncase_id: " + context.case.activeCase() + "; transition_id: " + transition_id + "; condition: " + condition_name);
                }
            }
        }
    });

    if (preconditions_completed) {
        Executor.run(PushTriggersCommand, transition.on_complete);
        context.storage.set_property(context.case.performedTransitionsProp(), performed_transitions.concat([transition_id]));
    }
};
