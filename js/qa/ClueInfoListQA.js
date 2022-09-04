var ClueInfoListQA = {};

ClueInfoListQA.handle = function() {
    var res = [];
    var forensic_items = context.case.foundForensicItems();
    var default_button_title = context.defs.get_def("interface.forensics.default_button_title");
    for (var forensic_item_id in forensic_items) {
        var forensic_item = forensic_items[forensic_item_id];
        var forensic_item_def = context.case.forensicItems(forensic_item_id).states[forensic_item.state];
        var clue_info = {
            index: forensic_item.index,
            name: forensic_item_id,
            visible: true,
            wrapped: (forensic_item_def.hasOwnProperty("wrapped") ? forensic_item_def.wrapped : true),
            pic: forensic_item_def.img,
            isNew: forensic_item_def.hasOwnProperty("minigame"),
            buttonTitle: ClueInfoListQA.button_title(forensic_item_def),
            buttonColor: ClueInfoListQA.button_color(forensic_item_def),
            starCost: ClueInfoListQA.star_cost(forensic_item_id, forensic_item_def)
        };
        res.push(clue_info);
    }
    return res.sort(function(a, b) { return b.index - a.index });
};

ClueInfoListQA.button_title = function(state_def) {
    if (state_def.button_title) {
        return state_def.button_title;
    } else if (state_def.minigame) {
        return context.defs.get_def("interface.forensics.button_title.minigame");
    } else if (state_def.movie) {
        return context.defs.get_def("interface.forensics.button_title.repeat");
    } else {
        return "";
    }
};

ClueInfoListQA.button_color = function(state_def) {
    if (state_def.button_color) {
        return state_def.button_color;
    } else if (state_def.minigame) {
        return context.defs.get_def("interface.forensics.button_color.minigame");
    } else if (state_def.movie) {
        return context.defs.get_def("interface.forensics.button_color.repeat");
    } else {
        return "";
    }
};

ClueInfoListQA.star_cost = function(forensic_item_id, state_def) {
    if (state_def.minigame) {
        return context.case.minigameCost(forensic_item_id);
    } else {
        return 0;
    }
};
