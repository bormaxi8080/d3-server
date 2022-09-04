var BoosterListQA = {};

BoosterListQA.handle = function(scene_id) {
    var booster_tooltip = context.defs.get_def("boosters.tooltip");
    return context.defs.get_def("boosters.interface_order").map(function(booster_id) {
        var booster_def = context.defs.get_def("boosters.booster_types." + booster_id);
        return {
            name: booster_id,
            supported: context.hog.boosterSupported(scene_id, booster_id),
            title: booster_def.name,
            packSize: booster_def.pack_size,
            description: booster_def.description,
            img: booster_def.img,
            tooltip: booster_tooltip,
            cost: QAHelper.map_cost(booster_def.price),
            count: context.player.get_booster_count(booster_id)
        };
    });
};
