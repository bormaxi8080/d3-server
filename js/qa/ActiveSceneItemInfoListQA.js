var ActiveSceneItemInfoListQA = {};

ActiveSceneItemInfoListQA.handle = function() {
    var active_scene = context.case.activeScene();
    var scene_id = active_scene.scene_id;
    var scene_items = context.case.sceneCurrentState(scene_id).items || [];
    var item_list = context.case.scenes(scene_id).items;
    var res = []
    for (var item_id in item_list) {
        var item = item_list[item_id]
        res.push({
            visible: (scene_items.indexOf(item_id) >= 0),
            text: item.name,
            layer: item.layer,
            linkedLayer: item.linked_layer || "",
            imagePath: item.img
        });
    }
    return res;
};
