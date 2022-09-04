var DataStorage = function(log)
{
    var _hashProvider = new HashProvider();
    var _data = {};
    var _changes = [];

    this.__data = _data;

    this.writeLock = false;

    this.setDump = function(dump) {
        if (!dump) throw new Error("Параметр не должен быть нулевым!");
        if (_changes.length && log) log("WARNING, found changes left: " + _changes.length);
        _changes = [];
        _data = dump;
    };

    this.getDump = function() {
        return _data;
    };

    this.get_property = function(name) {
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var prop = this.search_property(_data, name, false);
        if (!prop || !prop.exists) throw new Error("Свойство [" + name + "] не найдено!");

        return copyObject(prop.holder[prop.name]);
    };

    this.get_property_or_default = function(name, value) {
        if (!name) throw new Error("Параметр не должен быть нулевым!");
        if (value === undefined) throw new Error("Не указан параметр по умолчанию!");

        var prop = this.search_property(_data, name, false);
        if (!prop || !prop.exists) {
            return value;
        } else {
            return copyObject(prop.holder[prop.name]);
        }
    };

    this.has_property = function(name) {
        var prop = this.search_property(_data, name, false);
        return !!(prop && prop.exists);
    };

    this.set_property = function(name, value) {
        if (this.writeLock) throw new Error("Попытка записи данных в режиме только для чтения!");
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var prop = this.search_property(_data, name, true);

        var oldValue = prop.exists ? prop.holder[prop.name] : null;
        if (oldValue === value) return;
        var newValue = copyObject(value);

        _changes[_changes.length] = new Change(name, oldValue, newValue, "data");

        if ((newValue === null) || (newValue === undefined)) {
            delete prop.holder[prop.name];
        } else {
            prop.holder[prop.name] = value;
        }
    };

    this.inc_property = function(name, inc) {
        inc = inc || 1;
        if (typeof(inc)!== 'number') throw new Error("Инкремент должно быть числом!");
        var value = this.get_property(name);
        if (typeof(value)!== 'number') throw new Error("Свойство должно быть числом!");
        this.set_property(name, value + inc);
    };

    this.set_event = function(name, value) {
        if (this.writeLock) throw new Error("Попытка записи данных в режиме только для чтения!");
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var newValue = copyObject(value);

        _changes[_changes.length] = new Change(name, null, newValue, "event");
    };

    this.calculate_change_hash = function() {
        var len = _changes.length;
        var change;
        var result = "";

        for (var i = 0; i < len; ++i) {
            change = _changes[i];
            result += "[" + change.type + "(" + change.name + "=>" + _hashProvider.hash(change.newValue) + ")]";
        }
        return result;
    };

    this.commit = function() {
        var len = _changes.length;
        var change = null;
        var result = [];

        for (var i = 0; i < len; ++i) {
            change = _changes[i];
            if (!change.fake) result[result.length] = change;
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

                if (prop == null) {
                    if (log) {
                        log("DS Fail, change not found: ");
                        log(change);
                    }
                    continue;
                }

                if ((change.oldValue === null) || (change.oldValue === undefined)) {
                    if (prop.holder[prop.name]) {
                        delete prop.holder[prop.name];
                    }
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
        var num_parts = parts.length - 1;
        var propName = parts[num_parts]; // последнее в массиве - это имя свойства
        var currentProp;
        var fullPropPath = "";

        var first = 0;
        while (first < num_parts) {
            currentProp = parts[first]; // имя следующего объекта в цепочке
            ++first;

            fullPropPath += (fullPropPath.length == 0) ? currentProp : "." + currentProp;

            if (!currentTarget[currentProp]) {
                if (createOnMiss) {
                    var newValue = new Object();
                    var change = new Change(fullPropPath, null, {}, "data", true);
                    _changes[_changes.length] = change;
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

var Change = function(name, oldValue, newValue, type, fake) {
    this.name = name;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.type = type;
    this.fake = fake;
};

var HashProvider = function() {};

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
        for (var name in target) targetFieldNames[targetFieldNames.length] = name;

        targetFieldNames.sort();

        var jsonFields = [];
        len = targetFieldNames.length;
        for (i = 0; i < len; ++i) {
            name = targetFieldNames[i];
            var value = this.hash(target[name]);

            jsonFields[jsonFields.length] = name + ": " + value;
        }

        result = "{" + jsonFields.join(", ") + "}";
    }

    return result;
};
