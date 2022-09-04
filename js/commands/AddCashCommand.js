var AddCashCommand = function() { };

AddCashCommand.toString = function() {
    return "add_cash"
};

AddCashCommand.prototype.execute = function(value) {
    var old_balance = context.player.get_real_balance();
    context.player.add_real_balance(value);
};

