var AddStartNextChapterTaskCommand = function() {};

AddStartNextChapterTaskCommand.toString = function() {
    return "add_start_next_chapter_task";
};

AddStartNextChapterTaskCommand.prototype.execute = function(args) {
    context.system.check_object(args, "args");
    var chapter = context.case.currentChapter();
    var type = "start_next_chapter";
    Executor.run(PushTaskCommand, {
        type: type,
        object_id: chapter.index + 1,
        cost: (args.hasOwnProperty("cost") ? args.cost : context.tasks.defaultCost(type)),
    });
};
