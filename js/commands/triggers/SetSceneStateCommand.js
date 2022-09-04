var SetSceneStateCommand = function() {};

SetSceneStateCommand.toString = function() {
    return "set_scene_state";
};

// Accepts hash: { "scene": "scene_1", "state": "state_2" }
SetSceneStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "scene");
    context.system.check_key(args, "state");

    var scene_id = args.scene;
    var new_state = args.state;

    context.case.checkSceneDefined(scene_id);
    if (!context.case.isSceneOpened(scene_id)) {
        throw new LogicError("Сцена с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; scene_id: " + scene_id);
    }

    var scene_def = context.case.scenes(scene_id);
    if (!(new_state in scene_def.states) && new_state != "default") {
        throw new LogicError("Попытка установить неправильный стейт для сцены!\ncase_id: " + context.case.activeCase() +
            "; scene_id: " + scene_id + "; new_state: " + new_state);
    }

    if (new_state != "default") {
        Executor.run(PushTaskCommand, {type: "investigate", object_id: scene_id});
    }

    context.storage.set_property(context.case.openedScenesProp(scene_id) + ".state", new_state);
};
