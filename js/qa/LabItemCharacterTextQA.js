var LabItemCharacterTextQA = {};

LabItemCharacterTextQA.handle = function(lab_item_id, state) {
    var lab_item_type = LabItemTypeQA.handle(lab_item_id);
    return lab_item_type.text[state];
};
