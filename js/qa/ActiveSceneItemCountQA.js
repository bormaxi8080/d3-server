var ActiveSceneItemCountQA = {};

ActiveSceneItemCountQA.handle = function() {
    return context.hog.getFindItemsCount(context.case.activeScene().scene_id);
};
