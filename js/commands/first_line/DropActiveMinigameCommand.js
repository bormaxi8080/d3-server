var DropActiveMinigameCommand = function() {};

DropActiveMinigameCommand.toString = function() {
    return "drop_active_minigame";
};

DropActiveMinigameCommand.prototype.execute = function() {
    if (context.storage.has_property(context.case.activeMinigameProp)) {
        context.storage.set_property(context.case.activeMinigameProp, null);
    }
};
