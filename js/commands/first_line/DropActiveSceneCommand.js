var DropActiveSceneCommand = function() {};

DropActiveSceneCommand.toString = function() {
    return "drop_active_scene";
};

DropActiveSceneCommand.prototype.execute = function() {
    if (context.storage.has_property(context.case.activeSceneProp)) {
        context.storage.set_property(context.case.activeSceneProp, null);
    }
};
