var LabItemStateButtonTitleQA = {};

LabItemStateButtonTitleQA.handle = function(lab_item_id, state) {
    context.system.check_string(lab_item_id);
    context.system.check_string(state);
    var button_title_prop = context.case.labItemsProp(lab_item_id) + ".button_title." + state;
    if (context.defs.has_def(button_title_prop)) {
        return context.defs.get_def(button_title_prop);
    } else {
        return context.defs.get_def("interface.laboratory.button_title." + state);
    }
};
