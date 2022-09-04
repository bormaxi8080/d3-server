var EndSceneCommand = function () {};

EndSceneCommand.toString = function () {
    return "end_scene";
};

EndSceneCommand.prototype.execute = function(args) {
    context.system.check_key(args, "scene");
    context.system.check_key(args, "time");
    context.system.check_key(args, "scores");
    context.system.check_number_positive_or_0(args.scores, 'scores');

    context.case.checkActiveCase();
    context.case.checkActiveScene();
    context.case.checkTriggers();

    var active_scene = context.case.activeScene();
    var time = parseInt(args.time);
    var case_id = context.case.activeCase();
    var scene_id = active_scene.scene_id;
    var scores = parseInt(args.scores);

    if (scores > context.hog.sceneMaxScore(scene_id)) {
        throw new LogicError("Попытка начислить очков больше допустимого максимума для сцены: " + scene_id);
    }
    if (active_scene.scene_id != scene_id) {
        throw new LogicError("Попытка завершить неоткрытую сцену!\ncase_id: " + case_id + "; scene_id: " + scene_id);
    }
    if (active_scene.start >= time) {
        throw new LogicError("Попытка завершить сцену с неверным timestamp!");
    }

    var reward = {
        xp: context.hog.calcExp(),
        game_balance: context.hog.calcCoins(scores)
    };

    var scene = context.case.openedScenes(scene_id);
    context.storage.inc_property(context.case.openedScenesProp(scene_id) + ".hog_count");

    Executor.run(ApplyRewardCommand, reward);
    Executor.run(AddSceneScoreCommand, scene_id, scores);
    Executor.run(UpdateHighscoreCommand, scene_id, scores);

    if (scene.state != "default") {
        var scene_def = context.case.scenes(scene_id);
        var triggers = scene_def.states[scene.state].on_complete;

        Executor.run(SetSceneStateCommand, {scene: scene_id, state: "default"});
        Executor.run(PushTriggersCommand, triggers);
        Executor.run(DeleteTasksCommand, "investigate", scene_id);
    }

    context.storage.set_property(context.case.activeSceneProp, null);
    var stars = context.case.sceneStars(scene_id);
    context.track.scene_end(case_id, scene_id, stars, reward);
    context.track.event("hog_time", case_id, scene_id, stars, Math.ceil((time - active_scene.start) / 1000));
    context.track.event("hog_scores", case_id, scene_id, stars, scores);
    context.track.event("hog_hints", case_id, scene_id, stars, args.used_hints || 0);
    if (context.storage.has_property("tutorial.state")) {
        context.track.event("tutor", "hog", context.storage.get_property("tutorial.state"), scene_id, scores);
    }
};
