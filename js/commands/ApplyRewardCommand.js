var ApplyRewardCommand = function() { };

ApplyRewardCommand.toString = function() {
    return "apply_reward"
};

ApplyRewardCommand.prototype.execute = function(reward) {
    if (reward.xp) { Executor.run(AddXpCommand, reward.xp); }
    if (reward.game_balance) { Executor.run(AddMoneyCommand, reward.game_balance) }
    if (reward.real_balance) { Executor.run(AddCashCommand, reward.real_balance) }
};

