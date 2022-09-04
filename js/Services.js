/**
 * Утилита для обработки результатов работы сервисов (платежи, дуэли и т.п.)
*/
var Services = function() {
    /**
     * service_id - имя сервиса
     * operation_id - идентификатор операции, используется только на сервере для проверки
     * result - то, что ответил сервис, то, что будем применять
    */
    this.use_result = function(args) {
        context.system.check_key(args, "service_id");
        context.system.check_key(args, "operation_id");
        context.system.check_key(args, "result");
        context.system.check_key(args, "client_params");

        if(!(args.service_id in executors)) {
            throw new Error("Для сервиса " + args.service_id + " не зарегистрирован обработчик");
        }

        var executor = executors[args.service_id];
        executor.use_result(args.result, args.client_params, args.time);
        context.env.useService(args.service_id, {operation_id: args.operation_id, result: args.result, error: false});
    }

    this.add_executor = function(service_id, executor) {
        if((service_id == undefined) || (executor == undefined)) throw new Error ('Некорректные параметры.');

        if(!(service_id in executors)) {
            if(!(executor.use_result)) throw new Error ('executor должен иметь функцию use_result.');
            executors[service_id] = executor;
        } else {
            throw new Error("Для сервиса " + service_id + " уже зарегистрирован обработчик");
        }
    }

    var executors = {};
}