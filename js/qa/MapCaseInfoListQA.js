var MapCaseInfoListQA = {};

MapCaseInfoListQA.case_state = function(case_id) {
    if (context.case.isNew(case_id)) {
        return "new";
    } else if (context.case.isUnlocked(case_id)) {
        return "unlocked";
    } else if (context.case.isOpened(case_id)) {
        return "opened";
    } else {
        return "closed";
    }
};

MapCaseInfoListQA.handle = function() {
    return context.defs.get_def("map.case_order").map(function(case_id) {
        var case_def = context.case.caseDef(case_id);
        var case_map_def = context.defs.get_def("map.descriptions." + case_id);
        var state = MapCaseInfoListQA.case_state(case_id);
        if (state !== "closed") {
            return {
                state: state,
                requires_unlock: context.case.isNew(case_id),
                id: case_id,
                current: context.case.isActiveCase(case_id),
                starsEarned: context.case.totalStars(case_id),
                starsTotal: context.case.caseStarsLimit(case_id),
                medals: context.case.medals(case_id),
                text1: case_map_def.name,
                text2: case_map_def.desc,
                path: case_map_def.path,
                img: case_map_def.img
            };
        } else {
            return {
                state: state,
                requires_unlock: false,
                id: case_id,
                current: false,
                starsEarned: 0,
                starsTotal: 0,
                medals: [],
                text1: case_map_def.name,
                text2: case_map_def.desc,
                path: case_map_def.path,
                img: case_map_def.img
            };
        }
    });
}
