var AddSceneStarCommand = function() {};

AddSceneStarCommand.toString = function() {
    return "add_scene_star";
};

AddSceneStarCommand.prototype.execute = function(scene_id, value) {
    context.system.check_int_positive(value, 'value');
    context.case.checkSceneDefined(scene_id);
    var scene_stars_property = context.case.openedScenesProp(scene_id) + ".stars";
    var scene = context.case.openedScenes(scene_id);
    var case_id = context.case.activeCase();

    if (scene.stars + value > context.case.starsLimit()) {
        throw new LogicError("Попытка добавить звезд сверх лимита!\ncase_id: " + case_id);
    }

    context.storage.set_property(scene_stars_property, scene.stars + value);
    context.case.setStars(context.case.stars() + value);

    var hog_count = scene.hog_count;
    for (var i = 1; i <= value; ++i) {
        context.track.event("hog_count", case_id, scene_id, scene.stars + i, hog_count);
        hog_count = 1;
    }

    Executor.run(UnlockBonusScenesCommand);
    if (context.case.totalStars() >= context.case.caseStarsLimit() ) {
        Executor.run(AddMedalCommand, "gold");
    }
};
