var Events = function() {};

Events.prototype.openScreen = function(screen_id) {
    context.storage.set_event("open_screen", {"screen_id": screen_id});
};

Events.prototype.animate = function(type, old_value, new_value) {
    context.storage.set_event("animate", {
        "type": type,
        "old_value": old_value,
        "new_value": new_value
    });
};

Events.prototype.notify = function(type, value) {
    context.storage.set_event("show_notify", {
        "type": type,
        "value": value
    });
};

Events.prototype.showMovie = function(value) {
    context.storage.set_event("show_movie", {
        "movie_id": value
    });
};

Events.prototype.showDeduction = function(value, params) {
    context.storage.set_event("show_deduction", {
        "deduction_id": value,
        "params": params
    });
};

Events.prototype.rateApp = function() {
    context.storage.set_event("rate_app", null);
};

Events.prototype.showTablet = function() {
    context.storage.set_event("show_tablet", null);
};


Events.prototype.arrest = function(suspect_id) {
    context.storage.set_event("arrest", suspect_id);
};

Events.prototype.trackEvent = function(event) {
    context.storage.set_event("track", {
        type: "custom",
        event: event
    });
};

Events.prototype.trackRevenue = function(event) {
    context.storage.set_event("track", {
        type: "mtu",
        event: event
    });
};

Events.prototype.trackAdxEvent = function(event) {
    context.storage.set_event("adx_track", event);
};
