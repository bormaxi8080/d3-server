var Player = function() {}


Player.prototype.add_xp = function(value) {
    if (value == 0 || value == null || value == undefined) return;
    context.system.check_int_positive(value, 'value');
    this.set_xp(context.storage.get_property("player.exp") + value);
};

Player.prototype.set_xp = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive_or_0(number, 'Опыт игрока');
    context.storage.set_property("player.exp", number);
};

Player.prototype.get_xp = function() {
    return context.storage.get_property("player.exp");
};

Player.prototype.get_level = function() {
    return context.storage.get_property("player.level");
};

Player.prototype.set_level = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive(number, 'Уровень игрока');
    context.storage.set_property("player.level", number);
};

Player.prototype.get_game_balance = function() {
    return context.storage.get_property("player.game_balance");
};

Player.prototype.set_game_balance = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive_or_0(number, 'Игровые монеты');
    context.storage.set_property("player.game_balance", number);
};

Player.prototype.add_game_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_game_balance(this.get_game_balance() + value);
};

Player.prototype.reduce_game_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_game_balance(this.get_game_balance() - value);
};

Player.prototype.get_real_balance = function() {
    return context.storage.get_property("player.real_balance");
};

Player.prototype.set_real_balance = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive_or_0(number, 'Игровые деньги');
    context.storage.set_property("player.real_balance", number);
};

Player.prototype.add_real_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_real_balance(this.get_real_balance() + value);
};

Player.prototype.reduce_real_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_real_balance(this.get_real_balance() - value);
};

Player.prototype.reduce_balance = function(value) {
    if (value.real_balance) { this.reduce_real_balance(value.real_balance) }
    if (value.game_balance) { this.reduce_game_balance(value.game_balance) }
}

Player.prototype.set_user_data = function(data) {
    context.storage.set_property("player.userData", data);
};

Player.prototype.get_user_data = function() {
    return context.storage.get_property("player.userData");
};

Player.prototype.set_gender = function(value) {
    if(value != "male" && value != "female")
        throw new Error("С сервера пришел невалидный player.gender == " + value + ", может быть либо male либо female.");
    context.storage.set_property("player.gender", value);
};

Player.prototype.get_social_id = function() {
    return context.storage.get_property("player.social_id");
};

Player.prototype.get_game_balance_limit = function() {
    return context.qa_manager.handle("get_limit", {type_id: "game_balance"});
};

Player.prototype.get_booster_count = function(booster_type) {
    var booster_property = "player.boosters." + booster_type;
    if (context.storage.has_property(booster_property)) {
        return context.storage.get_property(booster_property);
    } else {
        return 0;
    }
};

Player.prototype.set_booster_count = function(booster_type, count) {
    var booster_property = "player.boosters." + booster_type;
    context.system.check_int_positive_or_0(count, 'Количество бустеров');
    context.storage.set_property(booster_property, count);
};

Player.prototype.itemsProp = function(item_type) {
    return (item_type ? "player.inventory." + item_type : "player.inventory");
}

Player.prototype.get_item_count = function(item_type) {
    var items_prop = this.itemsProp(item_type);
    if (context.storage.has_property(items_prop)) {
        return context.storage.get_property(items_prop);
    } else {
        return 0;
    }
};

Player.prototype.set_item_count = function(item_type, count) {
    var items_prop = this.itemsProp(item_type);
    context.system.check_int_positive_or_0(count, 'Количество предмета');
    if (count === 0) {
        context.storage.set_property(items_prop, null);
    } else {
        context.storage.set_property(items_prop, count);
    }
};
