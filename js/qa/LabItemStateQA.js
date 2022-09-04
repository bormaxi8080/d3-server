var LabItemStateQA = {};

LabItemStateQA.handle = function(lab_item_id, time) {
    context.system.check_string(lab_item_id);
    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state === "analyzing" && context.case.analyzeTimeLeft(lab_item_id, time) == 0) {
        return "analyzed";
    } else {
        return lab_item.state;
    }
};
