var LabItemTypeQA = {};

LabItemTypeQA.handle = function(lab_item_id) {
    var item_type = context.case.labItems(lab_item_id).item_type;
    return context.defs.get_def("interface.laboratory.item_types." + item_type);
};
