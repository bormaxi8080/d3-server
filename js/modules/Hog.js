function Hog() {}

Hog.prototype.getFindItemsCount = function(scene_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var hog_settings = context.defs.get_def("hog_settings");

    if (scene_type == "hogTime") {
        return 60;
    } else if (scene_type in hog_settings.ItemsToFind) {
        return hog_settings.ItemsToFind[scene_type][context.case.openedScenes(scene_id).stars];
    } else {
        throw new LogicError("Неизвестный тип сцены!");
    }
};

Hog.prototype.getPuzzleGridSize = function(scene_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var hog_settings = context.defs.get_def("hog_settings");
    if (scene_type == "puzzle") {
        return hog_settings.PuzzleGridSize[context.case.openedScenes(scene_id).stars];
    } else return {width: 0, height: 0};
};

Hog.prototype.getTimeLimit = function(scene_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var hog_settings = context.defs.get_def("hog_settings");
    if (scene_type == "hogTime") {
        return hog_settings.TimeLimit[scene_type][context.case.openedScenes(scene_id).stars];
    } else if (this.isValidSceneType(scene_type)) {
        return 0;
    } else {
        throw new LogicError("Неизвестный тип сцены!");
    }
};

Hog.prototype.boosterSupported = function(scene_id, booster_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var def = context.defs.get_def("boosters.booster_types." + booster_id + ".unsupported");
    return def ? def.indexOf(scene_type) == -1 : true;
};

Hog.prototype.isValidSceneType = function(scene_type) {
    return ["hog", "hogTime", "hogDiff", "puzzle"].indexOf(scene_type) >= 0;
};

Hog.prototype.sceneMaxScore = function(scene_id) {
    var hog_settings = context.defs.get_def("hog_settings");
    var type = context.case.scenes(scene_id).type;
    if (this.isValidSceneType(type)) {
        return this.getFindItemsCount(scene_id) * hog_settings.ScoreForMult[type][context.defs.get_def("hog_settings.ScoresComboMultiplierMax")-1] + hog_settings.TimeMaxBonus + hog_settings.ScorePerHint * hog_settings.HintMaxCount;
    } else {
        throw new LogicError("Неивзестный тип сцены!");
    }
};

Hog.prototype.calcExp = function() {
    return context.defs.get_def("hog_settings").ExpAward[context.case.openedScenes(context.case.activeScene().scene_id).stars];
};

Hog.prototype.calcCoins = function(score) {
    return Math.floor(score / 10000);
};
