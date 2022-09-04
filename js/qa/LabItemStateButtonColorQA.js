var LabItemStateButtonColorQA = {};

LabItemStateButtonColorQA.handle = function(lab_item_id, state) {
    context.system.check_string(lab_item_id);
    context.system.check_string(state);
    var button_color_prop = context.case.labItemsProp(lab_item_id) + ".button_color." + state;
    if (context.defs.has_def(button_color_prop)) {
        return context.defs.get_def(button_color_prop);
    } else {
        return context.defs.get_def("interface.laboratory.button_color." + state);
    }
};
