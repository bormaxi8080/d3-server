var UnfinishedSceneInfoQA = {};

UnfinishedSceneInfoQA.handle = function() {
    var active_scene = context.case.activeScene();
    return {
        case_id: context.case.activeCase(),
        scene_id: active_scene.scene_id,
        partner_id: active_scene.partner_id || "",
        hints: active_scene.hints,
        boosters: active_scene.active_boosters,
        start: active_scene.start
    };
};
