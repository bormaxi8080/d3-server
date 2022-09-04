var LocalPushNotificationsQA = {};

LocalPushNotificationsQA.handle = function(time) {
    var notifications = [
        this.full_energy(),
        this.can_investigate()
    ].concat(this.analyze_done(time));
    return notifications.filter(function(notification) {
        return notification && notification.time && notification.time > time
    }).map(function(notification) {
        return {
            time: (notification.time - time) / 1000,
            text: notification.text
        }
    });
};

LocalPushNotificationsQA.analyze_done = function() {
    var res = [];
    var analyzed_items = context.storage.get_property("immediate_data.analyzed_items");
    for (var case_id in analyzed_items) {
        var case_analyzed_items = analyzed_items[case_id];
        for (var lab_item_id in case_analyzed_items) {
            res.push(case_analyzed_items[lab_item_id].end);
        }
    }
    return res.map(function(analyze_end_time) {
        return {
            time: analyze_end_time,
            text: context.defs.get_def("interface.local_push_notifications.analyze_done")
        };
    });
};

LocalPushNotificationsQA.full_energy = function() {
    return {
        time: context.energy.energy_restore_time(),
        text: context.defs.get_def("interface.local_push_notifications.full_energy")
    };
};

LocalPushNotificationsQA.can_investigate = function() {
    return {
        time: context.energy.energy_restore_time(this.min_investigate_cost()),
        text: context.defs.get_def("interface.local_push_notifications.can_investigate")
    };
};

LocalPushNotificationsQA.min_investigate_cost = function() {
    var investigate_cost = [];
    context.case.openCasesIds().forEach(function(case_id) {
        context.case.tasks(case_id).forEach(function(task) {
            if (task.type == "investigate") {
                investigate_cost.push(context.case.sceneEnergyCost(task.object_id, case_id))
            }
        });
    });
    if (investigate_cost.length > 0) {
        return Math.min.apply(null, investigate_cost)
    } else {
        return 0;
    }
};
