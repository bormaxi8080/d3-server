function Case() { }

Case.helpers = {
    camelize: function(str, capitalize) {
        var regexp = (capitalize ? /(?:^|[-_])(\w)/g : /(?:[-_])(\w)/g);
        return str.replace(regexp , function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    pluralize: function(str) {
        return str + "s";
    },
    propGenerator: function(case_path, object_type) {
        return function(object_id, case_id) {
            if (object_id === undefined || object_id === null) {
                return case_path + '.' + this.caseSelector(case_id) + '.' + object_type;
            } else {
                return case_path + '.' + this.caseSelector(case_id) + '.' + object_type + '.' + object_id;
            }
        }
    }
};

Case.prototype.caseSelector = function(case_id) {
    return (case_id || this.activeCase());
};

Case.prototype.caseDef = function(case_id) {
    return context.defs.get_def("cases." + this.caseSelector(case_id));
};

Case.prototype.caseState = function(case_id) {
    return context.context.get_property("open_cases." + this.caseSelector(case_id));
};

Case.prototype.openCasesIds = function(case_id) {
    return Object.keys(context.storage.get_property("open_cases"));
};

Case.prototype.isOpened = function(case_id) {
    return context.storage.has_property("open_cases." + case_id);
};

Case.prototype.isNew = function(case_id) {
    return context.storage.has_property("new_cases." + case_id);
};

Case.prototype.isUnlocked = function(case_id) {
    return (context.storage.get_property("unlocked_cases").indexOf(case_id) >= 0);
};

Case.prototype.checkOpened = function(case_id) {
    if (!this.isOpened(case_id)) {
        throw new LogicError("Нет открытого дела с таким идентификатором!\ncase_id: " + case_id);
    }
};

Case.prototype.isDefined = function(case_id) {
    return (case_id in context.defs.get_def("cases"));
}

Case.prototype.checkDefined = function(case_id) {
    if (!this.isDefined(case_id)) {
        throw new LogicError("Неизвестный идентификатор дела!\ncase_id: " + case_id);
    }
};

Case.prototype.activeCaseProp = "immediate_data.active_case";

Case.prototype.checkActiveCase = function() {
    if (!context.storage.has_property(this.activeCaseProp)) {
        throw new LogicError("Активное дело не установлено!");
    }
};

Case.prototype.isActiveCase = function(case_id) {
    if (!context.storage.has_property(this.activeCaseProp)) {
        return false;
    } else {
        return (this.activeCase() === case_id);
    }
};

Case.prototype.activeCase = function() {
    return context.storage.get_property(this.activeCaseProp);
};

Case.prototype.activeSceneProp = "immediate_data.active_scene";

Case.prototype.checkActiveScene = function() {
    if (!context.storage.has_property(this.activeSceneProp)) {
        throw new LogicError("Активная сцена не установлена!");
    }
};

Case.prototype.activeScene = function() {
    return context.storage.get_property(this.activeSceneProp);
};

Case.prototype.activeMinigameProp = "immediate_data.active_minigame";

Case.prototype.checkActiveMinigame = function() {
    if (!context.storage.has_property(this.activeMinigameProp)) {
        throw new LogicError("Активная миниигра не установлена!");
    }
};

Case.prototype.activeMinigame = function() {
    return context.storage.get_property(this.activeMinigameProp);
};

Case.prototype.starsProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".stars";
};

Case.prototype.stars = function(case_id) {
    return context.storage.get_property(this.starsProp(case_id));
};

Case.prototype.setStars = function(value, case_id) {
    return context.storage.set_property(this.starsProp(case_id), value);
};

Case.prototype.sceneStars = function(scene_id) {
    return this.openedScenes(scene_id).stars;
};

Case.prototype.sceneScoreMultiplier = function(scene_id) {
    return this.scenes(scene_id).score_multiplier || 1;
};

Case.prototype.caseScoreMultiplier = function() {
    return this.caseDef().score_multiplier || 1;
};

Case.prototype.sceneStarScores = function(scene_id) {
    var scores_prop = this.scenesProp(scene_id) + ".scores";
    var scores = null
    if (context.defs.has_def(scores_prop)) {
        scores = context.defs.get_def(scores_prop)
    } else {
        scores = context.defs.get_def("hog_settings.star_base_scores");
    }
    return scores;
}

Case.prototype.nextStarSceneScore = function(scene_id) {
    if (this.isSceneOpened(scene_id)) {
        var scene = context.case.openedScenes(scene_id);
        return this.sceneStarScores(scene_id)[scene.stars];
    } else {
        return 0;
    }
};

Case.prototype.checkStarsCount = function(count) {
    if (this.stars() < count) {
        throw new LogicError("Недостаточно звезд в деле!\n" + context.case.activeCase() + ', count: ' + count);
    }
};

Case.prototype.totalStars = function(case_id) {
    var opened_scenes = this.openedScenes(null, case_id);
    var total_stars = 0;
    for (var scene_id in opened_scenes) {
        total_stars += opened_scenes[scene_id].stars
    }
    return total_stars;
};

Case.prototype.starsLimit = function() {
    return context.defs.get_def("case_settings.stars_per_scene");
};

Case.prototype.caseStarsLimit = function(case_id) {
    var scenesProp = context.case.scenesProp(null, case_id)
    if (context.defs.has_def(scenesProp)) {
        return Object.keys(context.case.scenes(null, case_id)).length * this.starsLimit();
    } else {
        return 0;
    }
};

Case.prototype.deductionsProp = Case.helpers.propGenerator("cases", "deductions");

Case.prototype.hasDeduction = function(deduction_id) {
    return context.defs.has_def(this.deductionsProp(deduction_id));
};
Case.prototype.deductions = function(deduction_id) {
    return context.defs.get_def(this.deductionsProp(deduction_id));
};

Case.prototype.medalsProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".medals";
};

Case.prototype.medals = function(case_id) {
    var medalsProp = this.medalsProp(case_id);
    return context.storage.get_property_or_default(medalsProp, []);
};

Case.prototype.transitionsProp = Case.helpers.propGenerator("cases", "transitions");

Case.prototype.transitions = function(transition_id) {
    return context.defs.get_def(this.transitionsProp(transition_id));
};

Case.prototype.performedTransitionsProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".performed_transitions";
};

Case.prototype.performedTransitions = function(case_id) {
    return context.storage.get_property(this.performedTransitionsProp(case_id));
};

Case.prototype.transitions = function(transition_id) {
    return context.defs.get_def(this.transitionsProp(transition_id));
};

Case.prototype.infoProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".info";
};

Case.prototype.info = function(case_id) {
    return context.storage.get_property(this.infoProp(case_id));
};

Case.prototype.triggersProp = function(case_id) {
    return "immediate_data.triggers." + this.caseSelector(case_id);
};

Case.prototype.triggers = function(case_id) {
    var triggersProp = this.triggersProp(case_id);
    if (context.storage.has_property(triggersProp)) {
        return context.storage.get_property(triggersProp);
    } else {
        return [];
    }
};

Case.prototype.checkTriggers = function(case_id) {
    var triggers = this.triggers(case_id);
    if (triggers.length) {
        throw new LogicError("В деле есть невыполненные триггеры, выполните их перед выполением команд");
    }
};

Case.prototype.analyzedItemsProp = function(lab_item_id, case_id) {
    if (lab_item_id) {
        return 'immediate_data.analyzed_items.' + this.caseSelector(case_id) + '.' + lab_item_id;
    } else {
        return 'immediate_data.analyzed_items.' + this.caseSelector(case_id);
    }
};

Case.prototype.analyzedItems = function(lab_item_id, case_id) {
    var analyzed_prop = this.analyzedItemsProp(lab_item_id, case_id);
    if (context.storage.has_property(analyzed_prop)) {
        return context.storage.get_property(analyzed_prop);
    } else {
        return (lab_item_id ? null : {});
    }
};

Case.prototype.arrestData = function(case_id) {
    return context.defs.get_def("cases." + this.caseSelector(case_id) + ".arrest");
};

Case.prototype.arrestCost = function(case_id) {
    var arrest_cost_prop = "cases." + this.caseSelector(case_id) + ".arrest.cost"
    if (context.defs.has_def(arrest_cost_prop)) {
        return context.defs.get_def(arrest_cost_prop);
    } else {
        return context.defs.get_def("case_settings.default_suspect_arrest_cost");
    }
};

Case.prototype.isSuspectClickable = function(suspect_id, case_id) {
    var suspect = this.knownSuspects(suspect_id, case_id);
    if (suspect.state == "arrest") {
        return true;
    } else if (suspect.state == "default") {
        return false;
    } else {
        return !(this.suspects(suspect_id, case_id).states[suspect.state].talkable === false)
    }
}

Case.prototype.suspectClickCost = function(suspect_id, case_id) {
    var suspect = this.knownSuspects(suspect_id, case_id);
    if (suspect.state == "arrest") {
        return this.arrestCost(case_id);
    } else if (suspect.state == "default") {
        return 0;
    } else {
        if (suspect.talked) {
            return 0;
        } else {
            var suspect_state_def = this.suspects(suspect_id, case_id).states[suspect.state];
            if (suspect_state_def.talkable === false) {
                return 0;
            } else {
                var talk_cost = suspect_state_def.talk_cost;
                return ((talk_cost !== undefined) ? parseInt(talk_cost) : context.defs.get_def("case_settings.default_suspect_talk_cost"));
            }
        }
    }
};

Case.prototype.sceneEnergyCost = function(scene_id, case_id) {
    var stars = (this.openedScenes(scene_id, case_id).stars || 0);

    if (stars < this.starsLimit(case_id)) {
        return context.defs.get_def("energy_settings.scene_cost");
    } else {
        return context.defs.get_def("energy_settings.full_scene_cost");
    }
};

Case.prototype.minigameCost = function(forensic_item_id, case_id) {
    var forensic_item_state = this.foundForensicItems(forensic_item_id, case_id).state;
    var minigame_cost_prop = ["cases", this.caseSelector(case_id), "forensic_items", forensic_item_id, "states", forensic_item_state, "minigame.cost"].join('.');
    if (context.defs.has_def(minigame_cost_prop)) {
        return context.defs.get_def(minigame_cost_prop);
    } else {
        return context.defs.get_def("case_settings.default_minigame_cost");
    }
};

Case.prototype.analyzeTime = function(lab_item_id) {
    return context.case.labItems(lab_item_id).analyze_time;
};

Case.prototype.analyzeTimeLeft = function(lab_item_id, time) {
    if (!this.isLabItemFound()) {
        return this.analyzeTime(lab_item_id);
    } else {
        var lab_item = this.foundLabItems(lab_item_id);
        if (lab_item.state === "done") {
            return 0;
        } else {
            var analyzed_item = this.analyzedItems(lab_item_id)
            if (analyzed_item) {
                return Math.max(Math.ceil((analyzed_item.end - time) / 1000), 0);
            } else {
                return this.analyzeTime(lab_item_id)
            }
        }
    }
};

Case.prototype.analyzeSpeedupCost = function(lab_item_id, time) {
    var cash_per_hour = context.defs.get_def("cash_settings.analyze_speedup_base_cash_per_hour");
    var hours_left = this.analyzeTimeLeft(lab_item_id, time) / 3600
    if (hours_left < 1) {
        return Math.ceil(cash_per_hour * hours_left);
    } else {
        return Math.ceil(cash_per_hour * Math.pow(hours_left, 0.6));
    }
}

Case.prototype.tasksProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".tasks";
};

Case.prototype.tasks = function(case_id) {
    return context.storage.get_property(this.tasksProp(case_id));
};

Case.prototype.performedCustomTasksProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".performed_custom_tasks";
};

Case.prototype.isCustomTaskCompleted = function(task_id, case_id) {
    if (this.performedCustomTasks(case_id).indexOf(task_id) >= 0) {
        var task_is_active = this.tasks(case_id).some(function(task) {
            return (task.type === "custom" && task.object_id === task_id);
        });
        return !task_is_active;
    }
    return false;
};

Case.prototype.performedCustomTasks = function(case_id) {
    return context.storage.get_property(this.performedCustomTasksProp(case_id));
};

Case.prototype.customTasksProp = Case.helpers.propGenerator("cases", "custom_tasks");
Case.prototype.customTasks = function(task_id, case_id) {
    return context.defs.get_def(this.customTasksProp(task_id, case_id));
};

Case.prototype.chaptersProp = Case.helpers.propGenerator("cases", "chapters");
Case.prototype.chapters = function(index, case_id) {
    return context.defs.get_def(this.chaptersProp(index, case_id));
};

Case.prototype.currentChapterProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".chapter";
};

Case.prototype.currentChapter = function(case_id) {
    return context.storage.get_property(this.currentChapterProp(case_id));
};

Case.prototype.currentChapterDef = function(case_id) {
    var chapter = this.currentChapter(case_id);
    var chapter_def = this.chapters(chapter.index, case_id);
    return chapter_def
};

Case.prototype.currentChapterText = function(case_id) {
    var chapter = this.currentChapter(case_id);
    var chapter_def = this.chapters(chapter.index, case_id);
    if (chapter_def.description_end && chapter.completed) {
        return chapter_def.description_end;
    } else {
        return chapter_def.description;
    }
}

Case.prototype.starsLeft = function(case_id) {
   return this.caseStarsLimit(case_id) - this.totalStars(case_id) + this.stars(case_id);
}

Case.prototype.starsLeftToGet = function(case_id) {
   return this.caseStarsLimit(case_id) - this.totalStars(case_id);
}

Case.prototype.status = function(case_id) {
    return context.storage.get_property("open_cases." + this.caseSelector(case_id) + ".status");
};

Case.prototype.setStatus = function(status, case_id) {
    context.storage.set_property("open_cases." + this.caseSelector(case_id) + ".status", status);
};

Case.prototype.chapterEndReward = function() {
    return context.defs.get_def("case_settings.chapter_reward.end");
};

Case.prototype.chapterProgressReward = function() {
    return context.defs.get_def("case_settings.chapter_reward.progress");
};

Case.prototype.chapterProgress = function(case_id) {
    var chapter = this.currentChapter(case_id);
    var chapter_def = this.chapters(chapter.index, case_id);
    return Math.round((chapter.progress / chapter_def.size) * 100);
};

Case.prototype.infoStateProp = function(type, state, case_id) {
    context.system.check_string(type);
    if (state === "default") {
        return ["info", "default_states", type].join('.');
    } else {
        return ["cases", this.caseSelector(case_id), "info", type, state].join('.');
    }
};

Case.prototype.checkInfoStateDefined = function(type, state, case_id) {
    if ((state !== "default") && !(context.defs.has_def(this.infoStateProp(type, state, case_id)))) {
        throw new LogicError("Нет такого состояния для информации типа " + type + "! case_id: " + this.caseSelector(case_id) + "; state:" + state);
    }
};

Case.prototype.infoState = function(type, state, case_id) {
    return context.defs.get_def(this.infoStateProp(type, state, case_id));
};

Case.prototype.currentInfoState = function(type, case_id) {
    var currentInfoStateProp = ["open_cases", this.caseSelector(case_id), "info", type].join(".");
    var state = context.storage.get_property(currentInfoStateProp);
    return this.infoState(type, state, case_id);
};

/*
    Method generates case objects accessors - both for defs and player world,
    using Case.prototype.activeCase() value as case identifier, camelizing object names

    Case.generateCaseObjectAccessor("scene", "opened") would generate following methods:

    Case.prototype.scenesProp(scene_id)
    Case.prototype.openedScenesProp(scene_id)
    Case.prototype.openedScenesCount(scene_id)
    Case.prototype.checkSceneDefined(scene_id)
    Case.prototype.scenes(scene_id)
    Case.prototype.openedScenes(scene_id)
    Case.prototype.isSceneOpened(scene_id)

    It would require existing of paths:
    Storage: open_cases.case_id.opened_scenes.scene_id
    Definitions: cases.case_id.scenes.scene_id
*/

Case.generateCaseObjectAccessor = function(def_name, world_prefix) {
    var defNamePluralized = Case.helpers.pluralize(def_name); //def_names
    var defNameCamelized = Case.helpers.camelize(def_name, true); //DefName

    var worldName = world_prefix + "_" + defNamePluralized; // world_prefix_def_names

    // method defNamesProp
    var defPropName = Case.helpers.camelize(defNamePluralized, false) + "Prop";
    Case.prototype[defPropName] = Case.helpers.propGenerator("cases", defNamePluralized);

    // method worldPrefixDefNamesProp
    var worldPropName = Case.helpers.camelize(worldName, false) + "Prop";
    Case.prototype[worldPropName] = Case.helpers.propGenerator("open_cases", worldName);


    // method checkDefNameDefined
    var checkDefNameDefined = "check" + defNameCamelized + "Defined";
    Case.prototype[checkDefNameDefined] = function(object_id, case_id) {
        if (!context.defs.has_def(Case.prototype[defPropName](object_id, case_id))) {
            throw new LogicError("Неизвестный идентификатор объекта для дела!\ncase_id: " + this.activeCase() + "; " + def_name + "_id: " + object_id);
        }
    };

    // method defNames
    var defNames = Case.helpers.camelize(defNamePluralized, false);
    Case.prototype[defNames] = function(object_id, case_id) {
        return context.defs.get_def(Case.prototype[defPropName](object_id, case_id));
    };

    // method worldPrefixDefNames
    var worldPrefixDefNames = Case.helpers.camelize(worldName, false)
    Case.prototype[worldPrefixDefNames] = function(object_id, case_id) {
        var object_prop = Case.prototype[worldPropName](object_id, case_id);
        if (context.storage.has_property(object_prop)) {
            return context.storage.get_property(object_prop);
        } else {
            return {};
        }
    };

    // method worldPrefixDefNamesCount
    var worldCountName = Case.helpers.camelize(worldName, false) + "Count";
    Case.prototype[worldCountName] = function(case_id) {
        return Object.keys(this[worldPrefixDefNames](null, case_id)).length;
    }

    // method isDefNameWorldPrefix
    var worldCheckStateName = "is" + defNameCamelized + Case.helpers.camelize(world_prefix, true);
    Case.prototype[worldCheckStateName] = function(object_id, case_id) {
        return context.storage.has_property(Case.prototype[worldPropName](object_id, case_id));
    };
};

Case.generateCaseObjectAccessor("scene", "opened");
Case.generateCaseObjectAccessor("lab_item", "found");
Case.generateCaseObjectAccessor("forensic_item", "found");
Case.generateCaseObjectAccessor("suspect", "known");

Case.generateCaseObjectAccessor("clue", "known");

// Overriding generated properties, since known_clues is array, not an object
Case.prototype.isClueKnown = function(clue_id, case_id) {
    return (this.knownClues(case_id).indexOf(clue_id) >= 0)
}

Case.prototype.knownCluesProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".known_clues";
}

Case.prototype.knownClues = function(case_id) {
    return context.storage.get_property(this.knownCluesProp(case_id));
}

Case.prototype.sceneOrder = function(case_id) {
    return context.defs.get_def("cases." + this.caseSelector(case_id) + ".scene_order");
};

Case.prototype.sceneCurrentState = function(scene_id) {
    var scene = this.openedScenes(scene_id);
    var scene_def = this.scenes(scene_id);
    return scene_def.states[scene.state];
};

Case.prototype.path = function(relative_path, case_id) {
    return context.defs.get_def("map.descriptions." + this.caseSelector(case_id) + ".path").toString() + "/" + relative_path.toString();
};

Case.prototype.highscoreProp = function(scene_id, case_id) {
    return ["highscores", this.caseSelector(case_id), scene_id].join('.');
};

Case.prototype.highscore = function(scene_id, case_id) {
    var prop = this.highscoreProp(scene_id, case_id);
    return context.storage.get_property_or_default(prop, 0);
};

Case.prototype.forensicItemStateDef = function(forensic_item_id) {
    var state = context.case.foundForensicItems(forensic_item_id).state;
    return context.case.forensicItems(forensic_item_id).states[state];
};

Case.prototype.timeFromOpeningProp = function(case_id) {
    return "case_statistics." + this.caseSelector(case_id) + ".start_time";
};

Case.prototype.timeFromOpening = function(time, case_id) {
    var prop = this.timeFromOpeningProp(case_id);
    var case_start_time = context.storage.get_property_or_default(prop, context.storage.get_property("options.init_time"));
    return Math.ceil((time - case_start_time) / 1000);
};

Case.prototype.setOpeningTime = function(time, case_id) {
    context.storage.set_property(this.timeFromOpeningProp(case_id), time);
};

Case.prototype.hogPlayedCount = function(scene_id, case_id) {
    return this.openedScenes(scene_id, case_id).hog_count;
};

Case.prototype.mistakenArrestsCountProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".mistaken_arrests";
};

Case.prototype.mistakenArrestsCount = function(case_id) {
    return context.storage.get_property(this.mistakenArrestsCountProp(case_id));
};
