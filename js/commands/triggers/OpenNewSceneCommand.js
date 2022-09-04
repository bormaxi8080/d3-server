var OpenNewSceneCommand = function() {};

OpenNewSceneCommand.toString = function() {
    return "open_new_scene";
};

OpenNewSceneCommand.prototype.execute = function(scene_id) {
    context.case.checkSceneDefined(scene_id);
    if (context.case.isSceneOpened(scene_id)) {
        throw new LogicError("Сцена с таким именем уже открыта!\ncase_id: " + context.case.activeCase() + "; scene_id: " + scene_id);
    }

    var scene = {
        "stars": 0,
        "score": 0,
        "hog_count": 0,
        "state": "default"
    };

    context.storage.set_property(context.case.openedScenesProp(scene_id), scene);
    context.events.notify("open_scene", scene_id);
};
