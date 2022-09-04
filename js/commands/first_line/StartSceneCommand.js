var StartSceneCommand = function () {};

StartSceneCommand.toString = function () {
    return "start_scene";
};

StartSceneCommand.prototype.execute = function (args) {
    context.system.check_key(args, "scene");
    context.system.check_key(args, "time");
    context.system.check_key(args, "boosters");
    context.system.check_key(args, "hints");

    context.case.checkActiveCase();
    context.case.checkTriggers();

    var scene_id = args.scene;
    var case_id = context.case.activeCase();
    var time = parseInt(args.time);
    var partner_id = args.partner;
    var hints = args.hints;

    if (context.storage.has_property(context.case.activeSceneProp)) {
        // TODO: Убрали блокировку активной сцены до имплементации соответствующего функционала в клиенте
        Executor.run("drop_active_scene");
        // throw new LogicError("Активная сцена уже установлена!");
    }

    if (!context.case.isSceneOpened(scene_id)) {
        throw new LogicError("Сцена " + scene_id + " недоступна в деле " + case_id);
    }

    var scene_cost = context.case.sceneEnergyCost(scene_id);
    var current_energy = context.energy.get();

    if (scene_cost > current_energy) {
        throw new LogicError("Недостаточно энергии для сцены. Нужно: " + scene_cost + ", доступно: " + current_energy);
    }

    context.energy.spend(scene_cost, time);

    var active_boosters = [];
    var boosters = args.boosters;
    if (boosters.length > 3) {
       throw new LogicError("Нельзя использовать более трех бустеров единовременно!");
    }

    var stars = context.case.sceneStars(scene_id);
    boosters.forEach(function(booster_id) {
        var booster_count = context.player.get_booster_count(booster_id);

        if (booster_count > 0) {
            if (booster_id == "full_hints" && hints == context.defs.get_def("hog_settings.HintMaxCount")) {
                return;
            }
            active_boosters.push(booster_id);
            context.track.event("hog_boosters", case_id, scene_id + "_" + stars, booster_id, 1);
            context.player.set_booster_count(booster_id, booster_count - 1);
        }
    });

    var active_scene = {
        scene_id: scene_id,
        start: time,
        active_boosters: active_boosters,
        hints: hints
    };

    if (partner_id) {
        context.track.event("partner_hints", case_id, scene_id, stars, hints);
        active_scene.partner_id = partner_id;
        Executor.run(UsePartnerCommand, partner_id, time);
    }

    context.storage.set_property("immediate_data.active_scene", active_scene);
};
