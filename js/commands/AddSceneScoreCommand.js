var AddSceneScoreCommand = function() {};

AddSceneScoreCommand.toString = function() {
    return "add_scene_score";
};

AddSceneScoreCommand.prototype.execute = function(scene_id, score) {
    context.system.check_int_positive_or_0(score, 'score');

    var scores = context.case.sceneStarScores(scene_id);
    var scene = context.case.openedScenes(scene_id);

    var new_score = scene.score + score;

    var new_stars = scene.stars;
    var max_stars = scores.length;

    for (var i = new_stars; i < max_stars; ++i) {
        if (new_score >= scores[i]) {
            new_score -= scores[i];
            ++new_stars;
        } else {
            break;
        }
    };

    if (new_stars > scene.stars) {
        Executor.run(AddSceneStarCommand, scene_id, new_stars - scene.stars)
    }

    var old_stars_float = scene.stars;
    if (scene.stars < max_stars) {
        old_stars_float = scene.stars + scene.score / scores[scene.stars];
    }

    var new_stars_float = new_stars + new_score / scores[new_stars];
    if (new_stars == max_stars) {
        new_score = 0;
        new_stars_float = max_stars;
    }
    context.events.animate("stars", old_stars_float, new_stars_float);
    context.storage.set_property(context.case.openedScenesProp(scene_id) + ".score", new_score);
};
