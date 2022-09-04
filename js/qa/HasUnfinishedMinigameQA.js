var HasUnfinishedMinigameQA = {};

HasUnfinishedMinigameQA.handle = function() {
    return context.storage.has_property(context.case.activeMinigameProp);
};
