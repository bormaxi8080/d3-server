var Executor = new (function() {
    var _executorBindings = {};
    var _postHooks = {};
    var _preHooks = {};

    function executeHooks(hookStorage, commandName, commandArgs) {
        if (hookStorage[commandName]) {
            hookStorage[commandName].forEach(function(hook) {
                hook.apply(hook, commandArgs);
            });
        }
    };

    this.run = function() {
        var commandName = arguments[0];
        var type = typeof(commandName);
        if (!commandName && (type != 'string' || type != 'function') ) {
            throw new Error("Тип команды должнен быть указан!");
        }

        var commandName = (type == "string" ? commandName : commandName.toString());

        var command = this.executorForCommand(commandName);
        var len = arguments.length;
        var command_args = new Array(len);
        if (len > 1) {
            for (var i = 1; i < len; ++i) {
                command_args[i - 1] = arguments[i];
            }
        }

        executeHooks(_preHooks, commandName, command_args);
        command.execute.apply(command, command_args);
        executeHooks(_postHooks, commandName, command_args);
    };

    function validateCommandName(commandName) {
        if (typeof(commandName) != "string") {
            throw new Error("Тип должен быть задан строкой!");
        }
    }

    function addExecutor(command, commandName) {
        validateCommandName(commandName);
        _executorBindings[commandName] = command;
    }

    this.executorForCommand = function(command) {
        if (_executorBindings[command]) {
            return _executorBindings[command];
        }
        throw new Error("Для данного типа не установлен исполнитель! command: " + command);
    };

    this.bind = function() {
        var executorConstructor = arguments[0];
        if (typeof(executorConstructor) != "function") {
            throw new Error("Конструктор должен быть функцией!");
        }

        var command = new executorConstructor();
        var len = arguments.length;
        if (len > 1) {
            for (var i = 1; i < len; i++) {
                addExecutor(command, arguments[i]);
            }
        } else {
            addExecutor(command, executorConstructor.toString());
        }
    };

    function bindHook(hookStorage, commandName, hook) {
        if (typeof(commandName) == "function") {
            commandName = commandName.toString();
        } else if (typeof(commandName) != "string") {
            throw new Error("Тип должен быть задан строкой!");
        }

        hookStorage[commandName] = hookStorage[commandName] || [];
        hookStorage[commandName].push(hook);
    };

    this.bindPostHook = function(commandName, hook) {
        bindHook(_postHooks, commandName, hook);
    };

    this.bindPreHook = function(commandName, hook) {
        bindHook(_preHooks, commandName, hook);
    };

})();
