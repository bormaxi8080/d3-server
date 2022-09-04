/**
 * Модуль, с помощью которого js логика общается с внешней средой
 *
 * @constructor
 */
var JSONUtils = require('./../../data/JSONUtils');

var Environment = function(logger) {
    this.unusedServices = null;
    this.usedServices = null;

    this.createdServices = [];
    this.permissions = {};

    this._tempUsedServices = {};
    this._tempCreatedServices = [];

    this.info = {};
    this.logger = logger;
};

Environment.prototype.commit = function() {
    var len;
    var serviceChange;

    for (var service_id in this._tempUsedServices) {
        if (!(service_id in this.usedServices)) {
            this.usedServices[service_id] = {};
        }

        for (var operation_id in this._tempUsedServices[service_id]) {
            this.usedServices[service_id][operation_id] = true;
            delete this.unusedServices[service_id][operation_id];
        }
    }

    len = this._tempCreatedServices.length;
    while (len--) {
        serviceChange = this._tempCreatedServices[len];
        this.createdServices.push(serviceChange);
    }

    this._tempCreatedServices = [];
    this._tempUsedServices = {};
};


Environment.prototype.rollback = function() {
    this._tempCreatedServices = [];
    this._tempUsedServices = {};
};

Environment.prototype.getTime = function() { return Date.now();  };

Environment.prototype.getInfo = function(key) {
    var v = this.info[key];
    if (typeof v == 'object') {
        v = JSONUtils.clone(v);
    }
    return v;
};

Environment.prototype.setInfo = function(key, value) {
    if (typeof value == 'object') {
        this.info[key] = JSONUtils.clone(value);
    } else {
        this.info[key] = value;
    }
};

Environment.prototype.createService = function(methodName, params) {
    this._tempCreatedServices.push(new Change(methodName, params));
};

Environment.prototype.useService = function(serviceName, params) {
    this.checkUseServiceResult(serviceName, params);
    this._tempUsedServices[serviceName][params.operation_id] = true;
};

Environment.prototype.hasPermission = function(permission) {
    if (!permission) throw new Error("Нет такого разрешения - '" + permission + "'!");
    return this.permissions && this.permissions[permission] === true;
};

Environment.prototype.addPermission = function(permission) {
    if (!permission) throw new Error("Имя разрешения среды не должно быть null или пустой строкой!");
    this.permissions[permission] = true;
};

Environment.prototype.removePermission = function(permission) {
    if (!permission) throw new Error("Имя разрешения среды не должно быть null или пустой строкой!");
    delete this.permissions[permission];
};

Environment.prototype.log = function() {
    /*
     * В связи с отсутствием информации о входных параметрах реализован вариант,
     * когда из всего, что пришло формируется 1 строка.
     * (Не используется возможность логгера по metadata, но сохраняется вся информация в читаемом виде).
     */
    var chunks = [];
    for (var i = 0; i < arguments.length; i++) {
        switch (typeof arguments[i]) {
            case 'object':
                chunks.push(JSON.stringify(arguments[i]));
                break;
            case 'undefined':
                chunks.push('undefined');
                break;
            default:
                chunks.push(arguments[i].toString());
        }
    }

    if (this.logger && this.logger.info) {
        this.logger.info(chunks.join(' '));
    } else {
        console.log(chunks.join(' '));
    }
};

Environment.prototype.updateUnusedServices = function(unusedServices) {
    this.unusedServices = unusedServices;

    this.usedServices = {};
    this._tempUsedServices = {};

    this.createdServices = [];
    this._tempCreatedServices = [];
};

Environment.prototype.checkUseServiceResult = function(serviceId, params) {
    var operationId = params.operation_id;
    if (serviceId in this.unusedServices) {
        if (operationId in this.unusedServices[serviceId]) {
            if (!(serviceId in this._tempUsedServices)) {
                this._tempUsedServices[serviceId] = {};
            }

            if (operationId in this._tempUsedServices[serviceId]) {
                throw new Error("Повторное использование сервиса " + serviceId + ", id = " + operationId + " внутри одной команды!");
            } else if (serviceId in this.usedServices && operationId in this.usedServices[serviceId]) {
                throw new Error("Сервис " + serviceId + ", id = " + operationId + " уже был использован в другой команде!");
            } else if (!this.comparable_with_etalon(this.unusedServices[serviceId][operationId], params)) {
                throw new Error("Параметры сервиса " + serviceId + ", id = " + operationId + " и команы не совпадают!");
            } else {
                return;
            }
        } else {
            throw new Error("Использование незарегистрированного обращения к сервису: "+serviceId+", id = "+operationId+"!");
        }
    } else {
        throw new Error("Все сервисы такого типа уже использованы! ("+serviceId+", id = "+operationId+")");
    }
};

Environment.prototype.comparable_with_etalon = function(etalon, comparable) {
    if (true === etalon === comparable) return true;
    if (false === etalon === comparable) return true;

    if (null === etalon) {
        return (null === comparable) || ("undefined" === typeof(comparable));
    }

    if ("undefined" === typeof(etalon)) {
        return ("undefined" === typeof(comparable)) || (null === comparable);
    }

    if (typeof(etalon) != typeof(comparable)) return false;

    if ((typeof(etalon) === "number") && isNaN(etalon) && isNaN(comparable)) return true;

    if ((typeof(etalon) === "string") || (typeof(etalon) === "number")) {
        return (etalon === comparable);
    }

    if (Array === etalon.constructor) {
        if (Array !== comparable.constructor) return false;

        var len = etalon.length;
        if (len != comparable.length) return false;

        while (len--) {
            if (!(this.comparable_with_etalon(etalon[len], comparable[len]))) return false;
        }

        return true;
    }

    var name;
    for (name in etalon) {
        if (!(name in comparable)) return false;
        if (!(this.comparable_with_etalon(etalon[name], comparable[name]))) return false;
    }

    return true;
};


var Change = function(name, value) {
    this.name = name;
    this.value = value;
};

module.exports = Environment;
