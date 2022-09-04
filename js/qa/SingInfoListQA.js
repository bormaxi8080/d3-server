var SignInfoListQA = {};

SignInfoListQA.handle = function() {
    var res = [];
    var clue_defs = context.case.clues();
    return context.case.knownClues().map(function(clue_id) {
        var img = clue_defs[clue_id].img;
        return {
            name: clue_id,
            visible: true,
            hidden: (img ? false : true),
            picPath: img
        };
    });
};
