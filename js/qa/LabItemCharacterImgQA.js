var LabItemCharacterImgQA = {};

LabItemCharacterImgQA.handle = function(lab_item_id, state) {
    var lab_item_type = LabItemTypeQA.handle(lab_item_id);
    var character = lab_item_type.character
    if (typeof(character) == 'string') {
        return character;
    } else {
        return character[state];
    }
};
