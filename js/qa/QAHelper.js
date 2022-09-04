var QAHelper = {
    format_seconds: function(seconds) {
        var days = Math.floor(seconds / 86400);
        var times = [Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
        if (days > 0) {
            times.unshift(days);
        }
        return times.map(function(value) {
            return (value > 9 ? "" : "0") + value.toString();
        }).join(":");
    },
    map_cost: function(cost) {
        var res = []
        if (cost.star) {
            res.push(cost.star.toString() + "*");
        }
        if (cost.energy) {
            res.push(cost.energy.toString() + "#");
        }
        if (cost.real_balance) {
            res.push(cost.real_balance.toString() + "$");
        }
        if (cost.game_balance) {
            res.push(cost.game_balance.toString() + "#");
        }
        if (cost.time) {
            res.push(QAHelper.format_seconds(cost.time).toString() + "&");
        }
        return res.join(' ');
    }
};
