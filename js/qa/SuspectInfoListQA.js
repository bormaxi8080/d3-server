var SuspectInfoListQA = {};

SuspectInfoListQA.handle = function() {
    var res = []
    var known_suspects = context.case.knownSuspects();
    var button_titles = context.defs.get_def("interface.suspect.button_title");
    var button_colors = context.defs.get_def("interface.suspect.button_color");
    var killer = context.case.arrestData().killer;
    for (var suspect_id in known_suspects) {
        var suspect = known_suspects[suspect_id];
        var suspect_def = context.case.suspects(suspect_id);
        var state = suspect.state;
        var button_title
        var button_color
        if (context.case.isSuspectClickable(suspect_id)) {
            button_title = context.qa_manager.handle("suspect_state_property", suspect_id, state, "button_title");
            button_color = context.qa_manager.handle("suspect_state_property", suspect_id, state, "button_color");

            var button_state = (suspect.state == "arrest" ? suspect.state :  (suspect.talked ? "repeat" : "talk"));

            button_title = button_title || button_titles[button_state];
            button_color = button_color || button_colors[button_state];
        } else {
            button_title = ""
            button_color = ""
        }

        var suspect_properties = context.qa_manager.handle("suspect_custom_properties");

        res.push({
            name: suspect_id,
            visible: true,
            alibi: suspect.alibi,
            motive: suspect.motive,
            killer: (killer == suspect_id),
            picPath: context.qa_manager.handle("suspect_state_property", suspect_id, state, "img"),
            title: context.qa_manager.handle("suspect_state_property", suspect_id, state, "title"),
            status: context.qa_manager.handle("suspect_state_property", suspect_id, state, "status"),
            text1: context.qa_manager.handle("suspect_state_property", suspect_id, state, "prop_1"),
            text2: context.qa_manager.handle("suspect_state_property", suspect_id, state, "prop_2"),
            text1Title: suspect_properties.prop_1.title,
            text1Pic: suspect_properties.prop_1.img,
            text2Title: suspect_properties.prop_2.title,
            text2Pic:  suspect_properties.prop_2.img,
            starCost: context.case.suspectClickCost(suspect_id),
            buttonText: button_title || "",
            buttonColor: button_color || "",
            signs: context.qa_manager.handle("suspect_sign_info_list", suspect_id)
        });
    };
    return res;
};
