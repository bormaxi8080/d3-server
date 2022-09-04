var SuspectSignInfoListQA = {};

SuspectSignInfoListQA.handle = function(suspect_id) {
    if (context.case.isSuspectKnown) {
        var suspect = context.case.knownSuspects(suspect_id);
        var suspect_def = context.case.suspects(suspect_id);
        var clues = suspect_def.clues;
        var res = suspect.clues.map(function(clue_id) {
            var img = clues[clue_id].img;
            return {
                link: clue_id,
                visible: true,
                match: clues[clue_id].match,
                hidden: (img ? false : true),
                picPath: (img ? img : "")
            };
        });
        return res;
    } else {
        return [];
    }
};
