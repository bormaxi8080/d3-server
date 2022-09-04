function Tasks() { }

Tasks.descriptors = {
    examine: new function() {
        this.handle = function(task) {
            context.events.openScreen("forensic_screen");
        };
        this.displayedCost = function(task) {
            return { star: context.case.minigameCost(task.object_id)};
        };
        this.tabletImg = function(task) {
            var forensic_item_def = context.case.forensicItems(task.object_id);
            var forensic_item = context.case.foundForensicItems(task.object_id);

            return forensic_item_def.states[forensic_item.state].img;
        };
        this.tabletTargetText = function(task, time) {
            var forensic_item_def = context.case.forensicItems(task.object_id);
            var forensic_item = context.case.foundForensicItems(task.object_id);

            return  forensic_item_def.states[forensic_item.state].target_text || forensic_item_def.target_text || forensic_item_def.name;
        };
    },
    investigate: new function() {
        this.handle = function(task) {
            context.events.openScreen("scene_screen");
        };
        this.displayedCost = function(task) {
            return { energy: context.case.sceneEnergyCost(task.object_id)};
        };
        this.tabletImg = function(task) {
            return context.case.scenes(task.object_id).img;
        };
        this.tabletTargetText = function(task, time) {
            var obj = context.case.scenes(task.object_id);
            return obj.target_text || obj.name;
        };
    },
    analyze: new function() {
        this.handle = function(task) {
            context.events.openScreen("lab_screen");
        };
        this.displayedCost = function(task, time) {
            var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
            if (lab_item_state == "analyzing") {
                return { real_balance: context.case.analyzeSpeedupCost(task.object_id, time)};
            } else if (lab_item_state == "analyzed") {
                return { };
            } else {
                return { time: context.case.analyzeTimeLeft(task.object_id, time)};
            }
        };
        this.tabletImg = function(task) {
            return context.case.labItems(task.object_id).img;
        };
        this.tabletTargetText = function(task, time) {
            var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
            if (lab_item_state == "analyzed") {
                return context.defs.get_def("tasks.analyze.target_text");
            } else {
                var obj = context.case.labItems(task.object_id);
                return obj.target_text || obj.name;
            }
        };
        this.actionText = function(task, time) {
            var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
            if (lab_item_state == "analyzed") {
                return context.defs.get_def("tasks.analyze.analyzed_action_text");
            } else {
                return context.defs.get_def("tasks.analyze.action_text");
            }
        };

    },
    talk: new function() {
        this.handle = function(task) {
            context.events.openScreen("suspect_screen");
        };
        this.displayedCost = function(task) {
            return { star: context.case.suspectClickCost(task.object_id)};
        };
        this.tabletImg = function(task) {
            var suspect = context.case.knownSuspects(task.object_id);
            var portrait = SuspectStatePropertyQA.handle(task.object_id, suspect.state, "portrait");
            return portrait || SuspectStatePropertyQA.handle(task.object_id, suspect.state, "img");
        };
        this.actionText = function(task) {
            var suspect = context.case.knownSuspects(task.object_id);
            var custom_action_text = SuspectStatePropertyQA.handle(task.object_id, suspect.state, "action_text");
            return custom_action_text || context.defs.get_def("tasks.talk.action_text");
        };
        this.tabletTargetText = function(task, time) {
            var suspect = context.case.knownSuspects(task.object_id);
            var target_text = SuspectStatePropertyQA.handle(task.object_id, suspect.state, "target_text");
            target_text = target_text || SuspectStatePropertyQA.handle(task.object_id, suspect.state, "name");
            return target_text;
        };
    },
    arrest: new function() {
        this.handle = function(task) {
            context.events.openScreen("suspect_screen");
        };
        this.displayedCost = function(task) {
            return { star: context.case.arrestCost()};
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks.arrest.tablet_img");
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks.arrest.target_text");
        };
    },
    start_next_chapter: new function() {
        this.handle = function(task) {
            var cost = this.displayedCost(task);
            Executor.run(ConsumeStarCommand, cost.star);
            Executor.run(StartNextChapterCommand);
            Executor.run(DeleteTasksCommand, task.type, task.object_id);
        };
        this.displayedCost = function(task) {
            return { star: task.cost };
        };
        this.defaultCost = function() {
            return context.defs.get_def("tasks.start_next_chapter.default_cost");
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks.start_next_chapter.default_img");
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks.start_next_chapter.target_text");
        };
    },
    unlock_new_case: new function() {
        this.handle = function(task) {
            var cost = this.displayedCost(task);
            Executor.run(ConsumeStarCommand, cost.star);
            Executor.run(UnlockNewCaseCommand, task.object_id);
            Executor.run(DeleteTasksCommand, task.type, task.object_id);
            Executor.run(PushTriggersCommand, task.triggers);
            Executor.run(EndCaseCommand);
        };
        this.displayedCost = function(task) {
            return { star: task.cost };
        };
        this.defaultCost = function() {
            return context.defs.get_def("tasks.unlock_new_case.default_cost");
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks.unlock_new_case.default_img");
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks.unlock_new_case.target_text");
        };
    },
    buy_booster: new function() {
        this.handle = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            if (context.case.stars() >= item.require.star) {
                Executor.run(AddBoosterCommand, {"booster_type": task.object_id, "count": item.pack_size});
                Executor.run(ConsumeStarCommand, item.require.star);
                Executor.run(ExcludeCaseTasksCommand);
            }
        };
        this.displayedCost = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return { star: item.require.star };
        };
        this.actionText = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return item.tablet_name;
        };
        this.tabletImg = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return item.img;
        };
        this.tabletTargetText = function(task, time) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return item.tablet_description;
        };
    },
    earn_stars: new function() {
        this.handle = function(task) {
            context.events.openScreen("scene_screen");
        };
        this.displayedCost = function() {
            return {};
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks." + task.type).tablet_img;
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks." + task.type + ".target_text");
        };
    },
    custom: new function() {
        this.handle = function(task) {
            var cost = this.displayedCost(task);
            var task_def = context.case.customTasks(task.object_id);
            Executor.run(ConsumeStarCommand, cost.star);
            Executor.run(PushTriggersCommand, task_def.on_click);
            Executor.run(DeleteTasksCommand, task.type, task.object_id);
        };
        this.displayedCost = function(task) {
            return { star: task.cost };
        };
        this.tabletImg = function(task) {
            return task.img;
        };
        this.tabletTargetText = function(task, time) {
            return task.target_text
        };
    }
};

Tasks.prototype.tabletImg = function(task) {
    if (task.tablet_img) {
        return task.tablet_img;
    } else {
        return Tasks.descriptors[task.type].tabletImg(task);
    };
};

Tasks.prototype.tabletActionText = function(task, time) {
    if (task.action_text) {
        return task.action_text;
    } else if (typeof Tasks.descriptors[task.type].actionText === 'function') {
        return Tasks.descriptors[task.type].actionText(task, time);
    } else {
        return context.defs.get_def("tasks." + task.type + ".action_text");
    }
};

Tasks.prototype.tabletTargetText = function(task, time) {
    return Tasks.descriptors[task.type].tabletTargetText(task, time);
};

Tasks.prototype.tabletImageTip = function(task, time) {
    if (task.type == "analyze") {
        if (context.qa_manager.handle("lab_item_state", task.object_id, time) == "analyzing") {
            return context.qa_manager.handle("lab_item_remaining_time_text", task.object_id, time)
        }
    }
    return "";
};

Tasks.prototype.tabletCompleteness = function(task, time) {
    if (task.type == "analyze") {
        if (context.qa_manager.handle("lab_item_state", task.object_id, time) == "analyzing") {
            return context.qa_manager.handle("lab_item_progress", task.object_id, time);
        }
    }
    return 1;
};

Tasks.prototype.defaultImg = function(type) {
    return Tasks.descriptors[type].defaultImg();
};

Tasks.prototype.handle = function(task) {
    return Tasks.descriptors[task.type].handle(task);
};

Tasks.prototype.displayedCost = function(task, time) {
    var handler = Tasks.descriptors[task.type];
    if (handler.displayedCost) {
        return handler.displayedCost(task, time);
    } else {
        return {};
    }
};

Tasks.prototype.defaultCost = function(type) {
    var handler = Tasks.descriptors[type];
    if (handler.defaultCost) {
        return handler.defaultCost();
    } else {
        return 0;
    }
};

Tasks.prototype.costText = function(task, time) {
    if (task.type == "analyze") {
        var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
        if (lab_item_state == "analyzed") {
            return context.defs.get_def("interface.tablet.cost_text.lab_analyzed");
        } else if (lab_item_state == "analyzing") {
            return context.defs.get_def("interface.tablet.cost_text.lab_speedup");
        } else {
            return context.defs.get_def("interface.tablet.cost_text.cost");
        }
    } else if (task.type == "earn_stars") {
        return "";
    } else {
        return context.defs.get_def("interface.tablet.cost_text.cost")
    }
};
