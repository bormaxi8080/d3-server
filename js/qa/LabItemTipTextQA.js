var LabItemTipTextQA = {};

LabItemTipTextQA.handle = function(lab_item_id, state, time) {
    if (state == "done" || state == "analyzed") {
        return context.defs.get_def("interface.laboratory.tip_text")[state];
    } else {
        return context.qa_manager.handle("lab_item_remaining_time_text", lab_item_id, time);
    }
};
