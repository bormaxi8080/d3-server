var PlayerDataJSONQA = {};

PlayerDataJSONQA.handle = function(friend_count, active_friend_count) {
    return JSON.stringify({
        lvl: context.player.get_level(),
        xp: context.player.get_xp(),
        coins: context.player.get_game_balance(),
        bucks: context.player.get_real_balance(),
        f: friend_count,
        af: active_friend_count,
        stars: Object.keys(context.storage.get_property("open_cases")).reduce(function(memo, case_id) {
            return memo + context.case.totalStars(case_id);
        }, 0)
    });
};
