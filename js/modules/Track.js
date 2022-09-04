var Track = function() {};

// Implement currying function, makes things easier
Track.curry = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        fn.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
};

Track.object_tracker = function(property_to_event_map, s2, s3, name, object) {
    if (arguments.length < 5) {
        throw new Error("Генератор получил не все параметры. Текущее значение: " + JSON.stringify(arguments, null, 2));
    }
    for (var property in property_to_event_map) {
        if (object[property]) {
            context.events.trackEvent({
                st1: property_to_event_map[property],
                st2: s2,
                st3: s3,
                name: name.toString(),
                v: object[property]
            });
        }
    }
};

Track.real_ang_game_balance_spend = Track.curry(Track.object_tracker, {
    "real_balance": "real_spend",
    "game_balance": "gold_spend"
});

Track.prototype.buy_pack = Track.curry(Track.real_ang_game_balance_spend, "resourse_shortage", "energy");
Track.prototype.buy_booster = Track.curry(Track.real_ang_game_balance_spend, "resourse_shortage", "booster");

Track.prototype.speedup = Track.curry(Track.real_ang_game_balance_spend, "speedup", null);
Track.prototype.testimonials = Track.curry(Track.real_ang_game_balance_spend, "testimonials", null);

Track.reward_gain = Track.curry(Track.object_tracker, {
    "real_balance": "real_gain",
    "game_balance": "gold_gain",
    "xp": "exp_gain"
});

Track.prototype.scene_end = Track.reward_gain;
Track.prototype.scenario_progress = Track.reward_gain;
Track.prototype.levelup = Track.curry(Track.reward_gain, 'level_up', null);
Track.prototype.in_app = Track.curry(Track.reward_gain, 'inapp', null);


Track.prototype.event = function(st1, st2, st3, name, value) {
    context.events.trackEvent({
        st1: st1,
        st2: st2,
        st3: st3,
        name: name.toString(),
        v: Math.ceil(value)
    });
};

Track.prototype.revenue = function(store, name, revenue) {
    var cents = Math.round(parseFloat(revenue) * 100);
    context.events.trackRevenue({
        tu: "direct",
        st1: store,
        st2: name.toString(),
        st3: null,
        data: null,
        v: cents
    });
    context.events.trackAdxEvent({
        type: "Sale",
        data: revenue.toString(),
        currency: "USD",
        customData: name.toString()
    });
};

Track.prototype.progress_step = function(case_id, step_id) {
    this.event('progress', case_id, null, step_id, 1);
};

Track.prototype.adx_event = function(type, data) {
    context.events.trackAdxEvent({type: type, data: data.toString()});
};
