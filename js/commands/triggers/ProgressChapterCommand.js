var ProgressChapterCommand = function() {};

ProgressChapterCommand.toString = function() {
    return "progress_chapter";
};

ProgressChapterCommand.prototype.execute = function(step_id) {
    var chapter = context.case.currentChapter();
    var case_id = context.case.activeCase();
    var chapter_def = context.case.chapters(chapter.index);
    if (chapter.completed || chapter.progress >= chapter_def.size) {
        throw new LogicError("Невозможен прогресс по делу, глава завершена.\ncase_id: " + case_id);
    }

    var new_progress = chapter.progress + 1;
    var reward;
    if (new_progress == chapter_def.size) {
        reward = context.case.chapterEndReward();
        context.storage.set_property(context.case.currentChapterProp() + ".completed", true);
        var triggers = chapter_def.on_end || [];

        if (chapter.index == context.case.chapters().length - 1) {
            triggers.push({"add_medal": "silver"})
        }

        if (triggers.length > 0) {
            Executor.run(PushTriggersCommand, triggers);
        }
    } else {
        reward = context.case.chapterProgressReward();
    }
    context.storage.set_property(context.case.currentChapterProp() + ".progress", new_progress);
    Executor.run(ApplyRewardCommand, reward);
    context.track.scenario_progress(case_id, null, 'progress', reward);
    if (step_id) {
        context.track.progress_step(case_id, step_id);
    }

    context.events.notify("progress_chapter", {
        "progress": {
            "from": chapter.progress,
            "to": new_progress,
            "total": chapter_def.size
        },
        reward: reward,
        img: chapter_def.img
    });

};
