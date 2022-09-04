var SceneSpecialItemAvailableQA = {};

SceneSpecialItemAvailableQA.handle = function(scene_id) {
    if (context.case.isSceneOpened(scene_id)) {
        return (context.case.sceneCurrentState(scene_id).items || []).length > 0;
    } else {
        return false;
    }
};
