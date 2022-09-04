var LabItemInfoQA = {};

LabItemInfoQA.handle = function(lab_item_id, time) {
    var lab_item = context.case.foundLabItems(lab_item_id);
    var lab_item_def = context.case.labItems(lab_item_id);
    var left_time = context.case.analyzeTimeLeft(lab_item_id, time);
    var total_time = lab_item_def.analyze_time;
    var state = context.qa_manager.handle("lab_item_state", lab_item_id, time);
    return {
        index: lab_item.index,
        visible: true,
        name: lab_item_id,
        title: lab_item_def.name,
        pic: lab_item_def.img,
        progress: 1 - left_time/total_time,
        forceCost: context.case.analyzeSpeedupCost(lab_item_id, time),
        buttonTitle: context.qa_manager.handle("lab_item_state_button_title", lab_item_id, state),
        buttonColor: context.qa_manager.handle("lab_item_state_button_color", lab_item_id, state),
        persPic: context.qa_manager.handle("lab_item_character_img", lab_item_id, state),
        persText: context.qa_manager.handle("lab_item_character_text", lab_item_id, state),
        tipText: context.qa_manager.handle("lab_item_tip_text", lab_item_id, state, time)
    };
};
