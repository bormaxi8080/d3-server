var CaseInfoQA = {};

CaseInfoQA.handle = function(case_id) {
    var case_def = context.case.caseDef(case_id);
    if (context.case.isOpened(case_id)) {
        var current_chapter_def = context.case.currentChapterDef(case_id);
        var weapon_info = context.case.currentInfoState("weapon", case_id);
        var killer_info = context.case.currentInfoState("killer", case_id);
        var victim_info = context.case.currentInfoState("victim", case_id);
        return {
            titleText1: case_def.name,
            titleText2: case_def.description,
            chapterText1: current_chapter_def.name,
            chapterText2: context.case.currentChapterText(case_id),
            chapterPic: current_chapter_def.img,
            chapterProgress: context.case.chapterProgress(case_id),
            victimText1: victim_info.name,
            victimText2: victim_info.description,
            victimPic: victim_info.img,
            weaponText1: weapon_info.name,
            weaponText2: weapon_info.description,
            weaponPic: weapon_info.img,
            killerText1: killer_info.name,
            killerText2: killer_info.description,
            killerPic: killer_info.img
        };
    } else {
        return {
            titleText1: case_def.name,
            titleText2: case_def.description,
            chapterText1: "",
            chapterText2: "",
            chapterPic: "",
            chapterProgress: 0,
            victimText1: "",
            victimText2: "",
            victimPic: "",
            weaponText1: "",
            weaponText2: "",
            weaponPic: "",
            killerText1: "",
            killerText2: "",
            killerPic: ""
        };
    }
}
