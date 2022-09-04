var Context = function (environment) {
    this.env = environment;
    this.storage = new DataStorage(this.env ? this.env.log : null);
};

Context.prototype.init = function () { };

Context.prototype.setStorageDump = function (dump) {
    this.storage.setDump(dump);
};

Context.prototype.getStorageDump = function () {
    return this.storage.getDump();
};

Context.prototype.execute = function (name, params, hash) {
    var result = {};

    if (!params) {
        params = {};
    }

    if (!("time" in params)) {
        params.time = this.env.getTime();
    }

    if ("command_id" in params) {
        delete params.command_id;
    }

    result.name = name;
    result.params = params;

    try {
        var last_command_id = this.storage.has_property("options.last_command_id") ? this.storage.get_property("options.last_command_id") : 0;

        var debugInfo;
        if("debugInfo" in params) {
            debugInfo = params.debugInfo;
            delete params.debugInfo;
        }

        var checkTimeResult = this.qa_manager.handle("command_time_is_valid", params.time);
        if (!checkTimeResult.valid) {
            var message = "Неверное время выполнения команды '" + name + "': " + checkTimeResult.reason + "!";

            if(debugInfo) {
                message += "\ninfo: " + this.utils.print_object(debugInfo);
            }

            throw new Error(message);
        } else {
            this.storage.set_property("options.last_command_time", params.time);
        }

        Executor.run(CommandNames.ACTION_POINT_OF_ENTRY, name, copyObject(params));

        last_command_id++;

        if (debugInfo) {
            params.debugInfo = debugInfo;
        }

        this.storage.set_property("options.last_command_id", last_command_id);

        var calculated_hash = this.storage.calculate_change_hash();

        if (hash && !(calculated_hash == hash)) {
            var e = new Error( "Хэши не совпадают:\nclient & server\n" +
                                "command: " + name + "\n" +
                                "params: " + this.utils.print_object(params) + "\n" +
                                "hashes: " + this.utils.getHashDiffLog(hash, calculated_hash));
            e.type = "DIFFERENT_HASHS";
            throw e;
        }

        result.changes = this.storage.commit();
        this.env.commit();
        result.hash = calculated_hash;
    } catch (error) {
        this.storage.rollback();
        this.env.rollback();

        result.error = error;
    }

    return result;
};

Context.prototype.handle_server_response = function (response) {
    var result = {};

    try {
        Executor.run(CommandNames.HANDLE_SERVER_RESPONSE, response);
        result.changes = this.storage.commit();
        this.env.commit();
    } catch (error) {
        this.storage.rollback();
        this.env.rollback();
        result.error = error;
    }
    return result;
};
