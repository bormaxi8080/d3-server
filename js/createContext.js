/**
 * Создает контекст исполнения
 */

/* JS_TEST_INCLUDES_MARKER */

function createContext(environment) {

/* JS_INCLUDES_MARKER */

    context = new Context(environment);
    context.init();

    InitCommands();
    InitModules();
    InitQA();

    context.getDefinitions = function() { return definitions };
    context.init_map_migrate = function() {};

    // время протухания сервисов
    context.get_service_expire_interval = function(service_id) {
        return context.defs.get_def("service_settings.expire_interval") * 1000;
    }

    context.last_command_time = function() {
        return context.storage.get_property("options.last_command_time");
    }

    context.social_id = function() {
        return context.storage.get_property("player.social_id");
    }

    return context;
}
