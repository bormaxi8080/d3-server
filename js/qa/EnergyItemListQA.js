var EnergyItemListQA = {};

EnergyItemListQA.pack_energy_bonus = function(pack_def) {
    var total_energy = 0;
    if (pack_def.content) {
        for (var pack_item_id in pack_def.content) {
            var pack_item = context.defs.get_def("items.item_types." + pack_item_id);
            if (!pack_item) {
                throw new LogicError("Unknown item '" + pack_item_id + "' specified in pack '" + item_id + "'");
            }
            total_energy = pack_item.energy;
        }
    }
    return total_energy;
};

EnergyItemListQA.format_discount_text = function(amount) {
    if (amount == 0) return "";
    return "-" + amount + "%";
};

EnergyItemListQA.count_pack_size = function(pack_def) {
    var pack_size = 0;
    for (var pack_item_id in pack_def.content) {
        if (!context.defs.has_def("items.item_types." + pack_item_id)) {
            throw new LogicError("Unknown item '" + pack_item_id + "' specified in pack '" + pack_id + "'");
        }
        pack_size += pack_def.content[pack_item_id];
    }
    return pack_size;
};

EnergyItemListQA.handle = function() {
    var res = [];

    var items = context.defs.get_def("items.item_types");
    for (var item_id in items) {
        var item = items[item_id];
        res.push({
            id: item_id,
            type: "item",
            discount: "",
            name: item.name,
            image: item.img,
            description: item.description,
            cost: "",
            value: item.energy,
            count: context.player.get_item_count(item_id)
        });
    }

    var packs = context.defs.get_def("packs.pack_types");
    for (var pack_id in packs) {
        var pack = packs[pack_id];
        res.push({
            id: pack_id,
            type: "pack",
            discount: EnergyItemListQA.format_discount_text(pack.discount),
            name: pack.name,
            image: pack.img,
            description: pack.description,
            cost: QAHelper.map_cost(pack.price),
            value: EnergyItemListQA.pack_energy_bonus(pack),
            count: EnergyItemListQA.count_pack_size(pack)
        });
    }
    return res;
}
