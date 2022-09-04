var LabItemProgressQA = {};

LabItemProgressQA.handle = function(lab_item_id, time) {
    context.system.check_string(lab_item_id);
    context.system.check_int(time);
    return 1 - (context.case.analyzeTimeLeft(lab_item_id, time) / context.case.analyzeTime(lab_item_id));
};
