var SceneInfoListQA = {};

SceneInfoListQA.handle = function() {
    return context.case.sceneOrder().map(function(scene_id) {
        var scene_def = context.case.scenes(scene_id);
        var scene = context.case.openedScenes(scene_id);
        return {
            visible: context.case.isSceneOpened(scene_id),
            haveItemsToFind: context.qa_manager.handle("scene_special_item_available", scene_id),
            isBonus: (scene_def.type !== "hog"),
            isNew: (scene.stars == 0 && scene.score == 0),
            name: scene_id,
            title: scene_def.name,
            pic: scene_def.img,
            type: scene_def.type,
            path: scene_def.path,
            lockText: (scene_def.unlock_text || ""),
            openStars: (scene_def.unlock_star || 0),
            scores: (scene.score || 0),
            nextStarScore: (context.case.sceneStarScores(scene_id)[scene.stars || 0] || 0),
            stars: (scene.stars || 0),
            energyCost: context.case.sceneEnergyCost(scene_id),
        };
    });
};
