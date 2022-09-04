var SuspectFormatCluesQA = {};

SuspectFormatCluesQA.handle = function(notification) {
    var res = {
        is_killer: !notification.suspect,
        text: notification.text || "cases.suspect_format_clues"
    };

    var suspect_clues_def = null;
    var killer_clues_def = context.case.clues();

    if (notification.suspect) {
        var suspect_id = notification.suspect;
        var suspect = context.case.knownSuspects(suspect_id);
        suspect_clues_def = context.case.suspects(suspect_id).clues;
        res.img = SuspectStatePropertyQA.handle(suspect_id, suspect.state, "img");
        res.title = SuspectStatePropertyQA.handle(suspect_id, suspect.state, "title");
    } else {
        res.img = context.defs.get_def("interface.suspect.killer_clues_img");
        res.title = context.defs.get_def("interface.suspect.killer_title");
    }

    res.clues = notification.clues.all.map(function(clue) {
        return {
            img: SuspectFormatCluesQA.clue_img(suspect_clues_def, killer_clues_def, clue),
            new: notification.clues.new.indexOf(clue) >= 0
        }
    }).filter(function(e) { return e.img });

    res.alibi = notification.alibi.value;
    res.alibi_updated = notification.alibi.updated;
    res.motive = notification.motive.value;
    res.motive_updated = notification.motive.updated;

    return res;
};

SuspectFormatCluesQA.clue_img = function(suspect_clues, killer_clues, clue_id) {
    return (suspect_clues ? suspect_clues[clue_id].img : null) || (killer_clues ? killer_clues[clue_id].img : null);
};
