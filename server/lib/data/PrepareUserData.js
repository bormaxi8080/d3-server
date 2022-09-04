var JSONUtils = require('./JSONUtils');

var PrepareUserData = {};

function safeInt(val, def) {
    val = parseInt(val);
    return !isNaN(val) && isFinite(val) ? val : def;
}

PrepareUserData.prepareWorld = function (core, social_id) {
    var ts = Date.now();

    var worldData = JSONUtils.clone(core.config().init_world());
    worldData.options.random_seed = ts;
    worldData.options.init_time = ts - 5000;
    worldData.options.last_day_start = ts;
    worldData.player.social_id = social_id;
    worldData.options.last_version = safeInt(worldData.options.last_version, core.dataGate.migration.getLastVersion());
    return worldData;
}

PrepareUserData.prepareMap = function (core, social_id, map_id) {
    var ts = Date.now();
    map_id = map_id || 0;

    var mapData = JSONUtils.clone(core.config().init_room()[map_id]);
    for (item_id in mapData.items) {
        var st = mapData.items[item_id]['state']['state_start_date'];
        var et = mapData.items[item_id]['state']['state_expires_date'];

        mapData.items[item_id]['time'] = ts;
        mapData.items[item_id]['state']['state_start_date'] = ts;
        if (et) {
            mapData.items[item_id]['state']['state_expires_date'] = et - st + ts;
        }
    }
    mapData.options.location = {};
    mapData.options.location.current_room = map_id;
    mapData.options.location.map_social_id = social_id;
    return mapData;
}

module.exports = PrepareUserData;