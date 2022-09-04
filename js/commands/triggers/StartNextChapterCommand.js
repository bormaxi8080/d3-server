var StartNextChapterCommand = function() {};

StartNextChapterCommand.toString = function() {
    return "start_next_chapter";
};

StartNextChapterCommand.prototype.execute = function() {
    var chapter = context.case.currentChapter();
    var case_id = context.case.activeCase();
    if (!chapter.completed) {
        throw new LogicError("Невозможно начать следующую главу дела, текущая глава не завершена.\ncase_id: " + case_id);
    }
    var new_index = chapter.index + 1;
    var new_chapter_def = context.case.chapters()[new_index];
    if (!new_chapter_def) {
        throw new LogicError("Невозможно начать следующую главу дела, текущая глава является последней.\ncase_id: " + case_id);
    }

    var new_chapter = {
        index: new_index,
        progress: 0,
        completed: false
    };

    context.storage.set_property(context.case.currentChapterProp(), new_chapter);
    Executor.run(PushTriggersCommand, new_chapter_def.on_start);
    var step_id = (new_index + 1) * 100 + "_next_chapter_start"
    context.track.progress_step(case_id, step_id);
    context.events.notify("new_chapter", new_index);
};
