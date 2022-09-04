var LabItemRemainingTimeTextQA = {};

LabItemRemainingTimeTextQA.handle = function(lab_item_id, time) {
    context.system.check_string(lab_item_id);
    context.system.check_int(time);

    return QAHelper.format_seconds(context.case.analyzeTimeLeft(lab_item_id, time));
};
