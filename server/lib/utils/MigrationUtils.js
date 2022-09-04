var MigrationUtils = module.exports = {};

MigrationUtils.migrate_scene_score = function(world, score_map) {
    for (var case_id in world.open_cases) {
        var scenes = world.open_cases[case_id].opened_scenes;
        for (var scene_id in scenes) {
            var scene = scenes[scene_id];
            scene.score = this.recalc_score(score_map, case_id, scene_id, scene);
        }
    }
};

MigrationUtils.recalc_score = function(score_map, case_id, scene_id, scene) {
    if (scene.stars < 5 && score_map[case_id] && score_map[case_id][scene_id]) {
        var change = score_map[case_id][scene_id];
        return Math.ceil(scene.score / change.from[scene.stars] * change.to[scene.stars]);
    } else {
        return scene.score;
    }
};

MigrationUtils.case_completed = function(context, case_id) {
    var has_silver_medal = context.case.medals(case_id).indexOf('silver') >= 0;
    var has_silver_medal_trigger = context.case.triggers(case_id).some(function(trigger) {
        return trigger["add_medal"] && trigger["add_medal"] === "silver";
    });

    return has_silver_medal || has_silver_medal_trigger;
};

MigrationUtils.add_unlock_case_task = function(context, case_id, next_case_id, cost) {
    if (context.case.isOpened(case_id) && this.case_completed(context, case_id)) {
        var new_task = {
            type: "unlock_new_case",
            object_id: next_case_id,
            cost: cost,
            triggers: []
        };
        context.storage.set_property(context.case.tasksProp(case_id), context.case.tasks(case_id).concat([new_task]));
    };
};
