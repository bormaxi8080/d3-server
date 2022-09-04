var HasUnfinishedSceneQA = {};

HasUnfinishedSceneQA.handle = function() {
    return context.storage.has_property(context.case.activeSceneProp);
};
