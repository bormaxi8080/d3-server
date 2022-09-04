var AddMoneyCommand = function() { };

AddMoneyCommand.toString = function() {
    return "add_money"
};

AddMoneyCommand.prototype.execute = function(value) {
    var old_balance = context.player.get_game_balance();
    context.player.add_game_balance(value);
    context.events.animate("money", old_balance, context.player.get_game_balance());
};
