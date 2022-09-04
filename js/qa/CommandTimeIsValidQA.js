var CommandTimeIsValidQA = {};

CommandTimeIsValidQA.handle = function(time) {
    if (!time) throw new Error("Не задан параметр время! ('" + time + "')");

    var result = {valid: true, reason: null};

    var init_time = context.storage.has_property("options.init_time") ? context.storage.get_property("options.init_time") : 0;
    var last_command_time = context.storage.has_property("options.last_command_time") ? context.storage.get_property("options.last_command_time") : 0;
    var now = context.env.getTime();

    if (time < init_time) {
        result.reason = "команда выполнена до создания пользователя! ( " + time + " < " + init_time + " )";
        result.valid = false;
    } else if (time < last_command_time) {
        result.reason = "команда выполнена раньше последней команды! ( " + time + " < " + last_command_time + " )";
        result.valid = false;
    } else if ((time - now) > 60000) {
        result.reason = "команда выполнена в будущем относительно сервера! ( " + time + " > " + now + " )";
        result.valid = false;
    }

    return result;
};
