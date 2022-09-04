var LabItemInfoListQA = {};

LabItemInfoListQA.handle = function(time) {
    var res = [];
    var lab_items = context.case.foundLabItems();
    for (var lab_item_id in lab_items) {
        res.push(context.qa_manager.handle("lab_item_info", lab_item_id, time));
    }
    return res.sort(function(a, b) { return b.index - a.index });
};
