var ActiveSceneInfoQA = {};

ActiveSceneInfoQA.handle = function() {
    var hog_settings = context.defs.get_def("hog_settings");
    var scene_id = context.case.activeScene().scene_id;
    var scene_type = context.case.scenes(scene_id).type;
    var grid_def = context.hog.getPuzzleGridSize(scene_id);

    var res = {
        ScoreForMult: hog_settings.ScoreForMult[scene_type],
        timeLimit: context.hog.getTimeLimit(scene_id),
        itemCount: context.hog.getFindItemsCount(scene_id),
        gridWidth: grid_def.width,
        gridHeight: grid_def.height,
        starScores: context.case.sceneStarScores(scene_id)
    };

    [
        "ScoresComboMultiplierMin",
        "ScoresComboMultiplierMax",
        "ScoresComboMultiplierFadeTime",
        "ScoresComboMultiplierIncrement",
        "HogMissClickPenalityTime",
        "HogMissClickPenalityCount",
        "HogMissClickPenality",
        "HogHintReloadTime",
        "HogHintReloadCount",
        "TimeMaxBonus",
        "ScorePerHint",
        "HintMaxCount"
    ].forEach(function(element) {
        res[element] = hog_settings[element];
    });

    return res;
};
