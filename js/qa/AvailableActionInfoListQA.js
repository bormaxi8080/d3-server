var AvailableActionInfoListQA = {};

AvailableActionInfoListQA.map_task_names = function(type) {
    if (type == "talk" || type == "arrest") {
        return "eToSuspects";
    } else if (type == "investigate") {
        return "eStartScene";
    } else if (type == "earn_stars") {
        return "eToScenes";
    } else if (type == "analyze") {
        return "eToLab";
    } else if (type == "examine") {
        return "eToClues";
    } else {
        return "eCustom";
    }
};

AvailableActionInfoListQA.handle = function(time) {
    return context.case.tasks().map(function(task, index) {
        return {
            type: AvailableActionInfoListQA.map_task_names(task.type),
            cost: QAHelper.map_cost(context.tasks.displayedCost(task, time)),
            index: index,
            starCost: context.tasks.displayedCost(task, time).star || 0,
            name: task.object_id.toString(),
            img: context.tasks.tabletImg(task),
            actionText: context.tasks.tabletActionText(task, time),
            targetText: context.tasks.tabletTargetText(task, time),
            costText: context.tasks.costText(task, time),
            imageTip: context.tasks.tabletImageTip(task, time),
            completeness: context.tasks.tabletCompleteness(task, time)
        };
    })
};
