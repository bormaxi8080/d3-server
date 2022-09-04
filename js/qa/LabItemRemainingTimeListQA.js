var LabItemRemainingTimeListQA = {};

LabItemRemainingTimeListQA.handle = function(time) {
    context.system.check_int(time);
    var analyzed_items = context.case.analyzedItems();
    var res = {}
    for (var lab_item_id in analyzed_items) {
        res[lab_item_id] = {
            remainingText: context.qa_manager.handle("lab_item_remaining_time_text", lab_item_id, time),
            forceCost: context.case.analyzeSpeedupCost(lab_item_id, time)
        };
    }
    return res;
};
