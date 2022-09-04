var clone = require('node-v8-clone').clone;

var DataStorage = function() {
    var _hashProvider = new HashProvider();
    var _data = {};
    var _changes = [];

    this.writeLock = false;

    this.setDump = function(dump) {
        if (!dump) throw new Error("Параметр не должен быть нулевым!");

        _data = dump;
        _changes = [];
    };

    this.getDump = function() {
        return _data;
    };

    this.get_property = function(name) {
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var prop = this.search_property(_data, name, false);
        if (!prop || !prop.exists) throw new Error("Свойство [" + name + "] не найдено!");

        return clone(prop.holder[prop.name], true);
    };

    this.has_property = function(name) {
        var prop = this.search_property(_data, name, false);
        return (prop && prop.exists);
    };

    this.set_property = function(name, value) {
        if (this.writeLock) throw new Error("Попытка записи данных в режиме только для чтения!");
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var prop = this.search_property(_data, name, true);

        var oldValue = prop.exists ? prop.holder[prop.name] : null;
        var newValue = clone(value, true);

        // если не ссылочные типы данных и значения равны - ничего не делаем
        if ((oldValue == newValue)) return;

        _changes.push(new Change(name, oldValue, newValue, "data"));

        if ((newValue === null) || (newValue === undefined)) {
            delete prop.holder[prop.name];
        } else {
            prop.holder[prop.name] = value;
        }
    };

    this.set_event = function(name, value) {
        if (this.writeLock) throw new Error("Попытка записи данных в режиме только для чтения!");
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var newValue = copyObject(value);

        _changes.push(new Change(name, null, newValue, "event"));
    };

    this.calculate_change_hash = function() {
        var len = _changes.length;
        var change;
        var result = "";

        for (var i = 0; i < len; i++) {
            change = _changes[i];
            result += "[" + change.type + "(" + change.name + "=>" + _hashProvider.hash(change.newValue) + ")]";
        }
        return result;
    };

    this.commit = function() {
        var len = _changes.length;
        var change = null;
        var result = [];

        for (var i = 0; i < len; i++) {
            change = _changes[i];
            if (!change.fake) result.push(change);
        }

        _changes.length = 0;
        return result;
    };

    this.rollback = function() {
        var len = _changes.length;
        var change;
        var prop;

        while (len--) {
            change = _changes[len];
            if (change.type == "data") {
                prop = this.search_property(_data, change.name, false);

                if ((change.oldValue === null) || (change.oldValue === undefined)) {
                    delete prop.holder[prop.name];
                } else {
                    prop.holder[prop.name] = change.oldValue;
                }
            }
        }

        _changes.length = 0;
    };

    this.search_property = function(target, name, createOnMiss) {
        var currentTarget = target;
        var parts = name.split(".");
        var propName = parts.pop(); // последнее в массиве - это имя свойства
        var currentProp;
        var fullPropPath = "";

        while (parts.length) {
            currentProp = parts.shift(); // имя следующего объекта в цепочке
            fullPropPath += (fullPropPath.length == 0) ? currentProp : "." + currentProp;

            if (!(currentProp in currentTarget)) {

                if (createOnMiss) {
                    var newValue = new Object();
                    var change = new Change(fullPropPath, null, {}, "data", true);

                    _changes.push(change);

                    currentTarget[currentProp] = newValue;
                } else {
                    return null;
                }

            }
            currentTarget = currentTarget[currentProp];
        }

        return {
            holder: currentTarget,
            name: propName,
            exists: (propName in currentTarget)
        };
    };

};

var Change = function(name, oldValue, newValue,  type, fake) {
    this.name = name;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.type = type;
    this.fake = fake;
};

var PropSearchResult = function(target, propName) {
    this.holder = target;
    this.name = propName;
    this.exists = (propName in target);
};

var HashProvider = function() {
};

HashProvider.prototype.hash = function(target) {
    var result;
    var len;
    var i;

    if (true === target) return "true";
    if (false === target) return "false";
    if (null == target) return "null";
    if (typeof(target) == "string") return target;
    if (typeof(target) == "undefined") return "null";
    if (typeof(target) == "number") return target.toString();

    if (target.constructor == Array) {
        var array = [];
        len = target.length;
        array.length = len;

        while (len--) array[len] = this.hash(target[len]);

        result = "[" + array.join(", ") + "]";
    } else {
        var targetFieldNames = [];
        for (var name in target) targetFieldNames.push(name);

        // сортируем имена полей в алфавитном порядке
        targetFieldNames.sort();

        var jsonFields = [];
        len = targetFieldNames.length;
        for (i = 0; i < len; ++i) {
            name = targetFieldNames[i];
            var value = this.hash(target[name]);

            jsonFields.push(name + ": " + value);
        }

        result = "{" + jsonFields.join(", ") + "}";
    }

    return result;
};

module.exports = DataStorage;