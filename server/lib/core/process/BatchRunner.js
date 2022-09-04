/**
 * Модуль для обработки массива команд
 */

var Environment = require("./Environment");
var clone = require('node-v8-clone').clone;

var BatchResult = function(world)
{
    this.world = world;
    this.changes = [];
    this.createdServices = [];
    this.used_services = {};
    this.error = null;
};

/**
 * @constructor
 *
 * @param jsFactory  {Object}   Модуль скриптинга
 */
var BatchRunner = function(jsFactory, options, logger)
{
    this.changes = [];
    this.environment = new Environment(logger);
    this.setEnvPermissions(options.cheat);
    this.setEnvInfo('network_code', options.network_code);
    this.setEnvInfo('env', (options.env || 'development'));
    this.context = jsFactory.createContext(this.environment);
    this.logger = logger;
};

/**
 * Set cheat permissions
 * cheat
 * @type {boolean}
 */
BatchRunner.prototype.setEnvPermissions = function(cheat)
{
    this.environment.permissions["cheat"] = cheat;
};

/**
 * Set env variable
 * @param key {string}
 * @param value {string}
 */
BatchRunner.prototype.setEnvInfo = function(key, value)
{
    this.environment.info[key] = value;
};

BatchRunner.prototype.validateCommand = function(command)
{
    if (!command) throw new Error("Команда должна быть ненулевой!");
    if (
        !("name" in command) ||
            (typeof(command.name) !== "string") ||
            (command.name.length === 0)
        )
    {
        throw new Error("Имя команды является обязательным!");
    }

    if (
        !("params" in command) ||
            (typeof(command.params) !== "object") ||
            !("time" in command.params) ||
            (typeof(command.params.time) !== "number")
        )
    {
        throw new Error("Время исполнения является обязательным параметром команды!");
    }

    if (
        !("hash" in command) ||
            (typeof(command.hash) !== "string")
        )
    {
        throw new Error("Хэш команды является обязательным!");
    }

    if (command.name == "use_service_result")
    {
        if (!("service_id" in command.params)) throw new Error("service_id должен быть указан!");
        if (!("operation_id" in command.params)) throw new Error("operation_id должен быть указан!");
    }
};

/**
 * Исполнить все команды, присланные клиентом
 *
 * @param   world               {Object}    Хэш, содержащий текущее состояние мира (дамп)
 * @param   unused_services     {Object}    Хэш, содержащий данные о сервисах которые можно использовать
 * @param   batch               {Array}     Массив команд, которые необходимо исполнить
 */
BatchRunner.prototype.run = function(network_code, world, unused_services, batch)
{
    if (this.context.cache) this.context.cache.clear();

    this.environment.setInfo('network_code', network_code);
    var result = new BatchResult(world);

    this.changes = result.changes;
    this.context.setStorageDump(clone(world, true));

    var len = batch.length;
    var command = null;

    var real_log = [];

    this.environment.updateUnusedServices(unused_services);

    for(var i = 0; i < len; i++)
    {
        command = batch[i];

        try
        {
            // проверяем консистентность параметров команды
            this.validateCommand(command);

            // запускаем команду на исполнение
            var contextResult = this.context.execute(command.name, command.params, command.hash);

            // контекст отказался выполнить команду
            // значит, она уже была выполнена, но по каким-то причинам пришла от клиента дважды
            if(!contextResult)
            {
                this.logger.warn("Skipping command: " + JSON.stringify(command));
                continue;
            }

            this.logger.info("COMMAND: " + command.name);
            this.logger.info("PARAMS:  " + JSON.stringify(command.params));
            if (this.environment.info['env'] == 'development')
                this.logger.info("HASH:    " + contextResult.hash);

            // если команда завершилась с ошибкой - не выполняем остальные команды
            if(contextResult.error)
            {
                result.error = contextResult.error;
                this.logger.info("ERROR:   " + contextResult.error);
                break;
            }

            var lenj = contextResult.changes ? contextResult.changes.length : 0;
            var j;
            for(j = 0; j < lenj; j++)
            {
                var change = contextResult.changes[j];

                if ((change.type == "data") && (change.name == 'player.real_balance')) {
                    var v = {
                        command_name: command.name,
                        params:       command.params,
                        current_real: change.oldValue,
                        delta:        change.newValue - change.oldValue
                    };
                    real_log.push(v);
                }

                this.changes.push({name: change.name, value: change.newValue, type: change.type});
            }

        }
        catch (error)
        {
            result.error = error;
            break;
        }

    }

    result.changes = this.changes;
    result.createdServices = this.environment.createdServices;
    result.used_services = this.environment.usedServices;
    result.world = clone(this.context.getStorageDump(), true);
    result.real_log = real_log;

    this.changes = [];
    this.environment.updateUnusedServices(null);

    return result;
};

module.exports = BatchRunner;
