var UnlockBonusScenesCommand = function() { };

UnlockBonusScenesCommand.toString = function() {
    return "unlock_bonus_scenes"
};

UnlockBonusScenesCommand.prototype.execute = function() {
    var scene_opened, unlock_star, scene_id;
    var total_stars = context.case.totalStars();
    var scenes = context.case.scenes();

    for (scene_id in scenes) {
        unlock_star = scenes[scene_id].unlock_star;
        scene_opened = context.case.isSceneOpened(scene_id);
        if (unlock_star && !scene_opened) {
            if (total_stars >= unlock_star) {
                Executor.run(PushTriggersCommand, [{ "open_new_scene": scene_id }]);
            }
        }
    }
};
