var DefGenerator = function(defs, formulas) {
    var defs = defs;
    var formulas = formulas;

    /**
     * Получить список дефов с указанным префиксом. Полезно для написания тестов целостности дефов.
     *
     * @param prefix префикс (без точки в конце, например: "map_items")
     */
    this.list_defs = function(prefix) {
        if (!prefix) prefix = "";
        var name_parts = prefix.split(".");
        var value = search_property(defs, name_parts);
        if (value != null) {
            var result = [];
            for (var name in value) {
                result.push(name);
            }
            return result;
        } else {
            return null;
        }
    };

    this.get_def = function(name) {
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var name_parts = name.split(".");
        var constants = get_def_constants(name_parts);

        var value = search_property(defs, name_parts);
        if (value == null) return null;
        return calc_object(value, constants, true);
    };

    this.has_def = function(name) {
        if (!name) throw new Error("Параметр не должен быть нулевым!");

        var name_parts = name.split(".");
        var value = search_property(defs, name_parts);
        if (value == null) return false;
        return true;
    };

    this.is_def_computable = function(def) {
        var result = false;
        var type = typeof(def);

        if (!def) return false;

        if (type == "string") {
            if (def.indexOf("formula:") != -1) { result = true; }
        } else if (type == "object") {
            var keys = context.utils.get_ordered_keys(def);
            for (var i = 0; i < keys.length; i++) {
                if (this.is_def_computable(def[keys[i]])) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    };

    function search_property(target, name_parts) {
        var currentTarget = target;
        var num_parts = name_parts.length - 1;
        var propName = name_parts[num_parts]; // последнее в массиве - это имя свойства
        var currentProp;

        var first = 0;
        while (first < num_parts) {
            currentProp = name_parts[first]; // имя следующего объекта в цепочке
            ++first;

            if (!(currentProp in currentTarget)) {
                return null;
            }
            currentTarget = currentTarget[currentProp];
        }
        return currentTarget[propName];
    }

    function calc_object (target, def_constants, calculate) {
        var obj;
        var key;

        if (true === target) return target;
        if (false === target) return target;
        if (null === target) return target;

        var type = typeof(target);

        if (type === "number") return target;
        if (type === "undefined") return target;

        if (type === "string") {
            if (calculate) {
                if (target.indexOf("formula:") == 0)
                    return calculate_formula(target, def_constants);
                if (target.indexOf("constant:") == 0)
                    return def_constants[target.substr(9)];
            }
            return target;
        }
        if (type == "undefined") return target;
        if (type == "number") return target;
        if (target.constructor == Array) {
            obj = [];
        } else {
            obj = {};
        }
        if (def_constants == null) {
            if("constants" in target) {
                def_constants = target.constants;
            }
        }
        var keys = context.utils.get_ordered_keys(target);
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            obj[key] = calc_object(target[key], def_constants, calculate && (key != "constants"));
        }
        return obj;
    }

    function calculate_formula(string, def_constants) {
        var name = string.substr(8);
        var result = formulas[name].calculate(def_constants);
        var type = typeof(result);
        if ((type == "number") || (type == "string") || (type == "boolean")) {
            return result;
        } else {
            throw new Error("Формула " + name + " написана не правильно. Она должна возвращать строку, число, true, или false");
        }
    }

    function get_def_constants(name_parts) {
        var parent = defs;
        var length = name_parts.length;
        for (var i = 0; i < length; ++i) {
            parent = parent[name_parts[i]];
            if (!parent) {
                return null;
            } else if (parent.constants) {
                return parent.constants;
            }
        }
        return null;
    }
};
