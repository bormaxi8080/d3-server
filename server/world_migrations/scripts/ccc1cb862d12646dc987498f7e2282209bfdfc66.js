/**
 * Automatically generated
 * From commit: ccc1cb862d12646dc987498f7e2282209bfdfc66
 * Collected from folders:
 *    Definitions:
 *       /js/defs
 *    Logic:
 *       /js
 */
/**
 * Создает контекст исполнения
 */

/* JS_TEST_INCLUDES_MARKER */

function createContext(environment) {


var context = null;
/**
 * File: js/AccessProtocolError.js
 */
/**
 * Ошибка протокола взаимодействия (иначе говоря, пытаемся выполнить какую-то функцию с параметрами, не подходящими под
 * ее сигнатуру и/или реализаию)
 */
function AccessProtocolError(message) {
    this.name = "AccessProtocolError";
    this.message = message;
    this.stack = new Error(message).stack;
    this.toString = function () {return this.name + ": " + this.message};
}

AccessProtocolError.prototype = new Error();

/**
 * File: js/DefGenerator.js
 */
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

/**
 * File: js/QADataStorageTweak.js
 */
/**
 * Заглушка, используемая для ограничения доступа к
 * DataStorage на время работы handle
 *
 * @param   context Контекст. Нужен для ограничения записи в
 * DataStorage при выполнении handle
 */
var QADataStorageTweak = function (context) {

    this.get_count = function() {
        return counter
    }

    var _context = context;
    var _realStorage = null;
    var counter = 0;

    //для просмотра под дебаггером
    this.__data = _context.storage.__data;

    /**
     * Активировать ограничение на запись в DataStorage
     */
    this.enable = function() {
        counter++;
        if(counter == 1) {
            if(_realStorage) throw new Error('tweak уже включён.');
            _realStorage = _context.storage;
            _context.storage = this;
        }
    };

    /**
     * Деактивировать огранчение на запись в DataStorage
     */
    this.disable = function() {
        counter--;
        if (counter < 0) {
            counter = 0
            throw new Error('tweak не включён.');
        }

        if(counter == 0) {
            if(!_realStorage) throw new Error('tweak не включён.');
            _context.storage = _realStorage;
            _realStorage = null;
        }

        //TODO: раскомментировать методы enable и disable после того, как сервер перестанет делать странные вызовы у data storage
        //при вызове get_property
    };

    this.set_property = function(prop_name, new_value) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");
        throw new Error("Запись данных не должна производиться в данный момент!");
    };

    this.get_property = function(prop_name) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");

        return _realStorage.get_property(prop_name);
    };

    this.get_property_or_default = function(prop_name, value) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");

        return _realStorage.get_property_or_default(prop_name, value);
    };

    this.inc_property = function(name, inc) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");
        throw new Error("Запись данных не должна производиться в данный момент!");
    };

    this.has_property = function(prop_name) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");

        return _realStorage.has_property(prop_name);
    };

    this.getDump = function() {
        return _realStorage.getDump();
    }
};

/**
 * File: js/QAManager.js
 */
/**
 * Объект-контейнер, обеспечивающий API типа "вопрос-ответ"
 *
 * @param   tweak   Заглушка для DataStorage, ограничивающая запись в него
 */
var QAManager = function (tweak) {

    var _handlers = {};

    if (!tweak) throw new Error("Объект заглушки не должен быть нулевым!");
    var _tweak = tweak;

    /**
     * Добавить обработчик
     *
     * @param name      Имя обработчика
     * @param handler   Реализация обработчка
     */
    this.add_handler = function(name, handler) {
        if (_handlers.hasOwnProperty(name)) throw new Error("Обработчик с таким именем уже зарегистрирован!");
        if (!handler) throw new Error("Обработчик не должен быть нулевым!");
        if (!("handle" in handler) || (typeof (handler.handle) != "function")) throw new Error("Обработчик должен иметь метод handle!");

        _handlers[name] = handler;
    };

    /**
     * Удалить обработчик с заданным именем
     *
     * @param name  Имя обработчика, который нужно удалить
     */
    this.remove_handler = function(name) {
        if (!_handlers.hasOwnProperty(name)) throw new Error("Обработчик с таким именем еще не был зарегистрирован!");

        delete _handlers[name];
    };

    /**
     * Обработать запрос и вернуть ответ. На время обработки
     * запроса запись в DataStorage блокируется во избежание конфуза
     *
     * @param handler_name   Имя обработчика
     * @param params         Параметры, с которыми нужно вызвать обработчик
     * @return               Результат выполнения обработчика
     */
    this.handle = function(handler_name, params) {
        if (!_handlers.hasOwnProperty(handler_name)) throw new Error("Обработчик с именем " + handler_name + " еще не был зарегистрирован!");

        try {
            // подменяем DataStorage заглушкой, доступной только на чтение
            _tweak.enable();

            // выполняем запрос, получаем ответ на вопрос из клиента
            if (arguments.length > 2) {
                var sliced_args = Array.prototype.slice.call(arguments).slice(1, arguments.length);
                var result = _handlers[handler_name].handle.apply(_handlers[handler_name], sliced_args);
            } else {
                var result = _handlers[handler_name].handle(params);
            }
        } finally {
            // возвращаем нормальный DataStorage на место
            if (_tweak.get_count() > 0) {
                _tweak.disable();
            }
        }
        return result;
    };

};
/**
 * File: js/Services.js
 */
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
/**
 * File: js/System.js
 */
var System = function() {
    this.is_int = function(value) {
        if ((undefined === value) || (null === value) || (false === value)) {
            return false;
        }
        return value % 1 == 0;
    }

    this.is_boolean = function(value) {
        return typeof value === 'boolean';
    }

    this.is_string = function(value) {
        return typeof value === 'string';
    }

    this.is_array = function(value) {
        return typeof(value)=='object' && (value instanceof Array);
    }

    this.is_object = function(value) {
        return typeof value === 'object' && (value instanceof Object);
    }

    this.is_not_empty_object = function(value) {
        if (this.is_object(value)) {
            for (var key in value) return true;
        }
        return false;
    }

    this.is_empty_object = function(value) {
        if (this.is_object(value)) return !this.is_not_empty_object(value);
        return false;
    }

    this.check_boolean = function(value, info) {
        if (!this.is_boolean(value)) throw new Error((info?info+'. ':'')+"Значение должно быть типа Boolean.");
    }

    this.check_key = function(args, key, info) {
        if( !this.is_object(args) ) throw new Error( "Необходимо передать объект, в котором проверяется ключ " + key +"." );
        if( key == undefined ) throw new Error( "Необходимо передать ключ, который проверяется в объекте " + args + "." );
        if( !(key in args)) throw new AccessProtocolError( "Отсутствует параметр " + (info?info:key) + "." );
    }

    this.check_number = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );

        number = parseFloat(number);
        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );
    }

    this.check_number_positive = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );

        number = parseFloat(number);
        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );
        if (number <= 0) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше или равно 0." );
    }

    this.check_number_positive_or_0 = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );

        number = parseFloat(number);
        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );
        if (number < 0) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше 0." );
    }

    this.check_int_positive = function(number, info) {
        if (!this.is_int(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        if (number < 1) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше 1." );
    }

    this.check_int_positive_or_0 = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        number = parseFloat(number);

        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        if (!this.is_int(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        if (number < 0) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше 0." );
    }

    this.check_int = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть целым числом." );
        number = parseFloat(number);

        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть целым числом." );
        if (!this.is_int(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть целым числом." );
    }

    this.check_array = function(list, info) {
        if (!this.is_array(list)) throw new AccessProtocolError( (info?info+'. ': '')+"Значение должно быть массивом.")
    }

    this.check_object = function(obj, info) {
        if (!this.is_object(obj)) throw new AccessProtocolError( (info?info+'. ': '')+"Значение должно быть объектом.")
    }

    this.check_string = function(string, info) {
        if (!this.is_string(string)) throw new AccessProtocolError( (info?info+'. ': '')+"Значение должно быть строкой.")
    }
}
/**
 * File: js/Utils.js
 */
/**
 *      УТИЛИТНЫЕ ФУНКЦИИ
 */
var Utils = function() {

    /**
     * Находит объекты первого массива, которых нет во втором массиве.
     *
     * @param array_1   Первый массив.
     * @param array_2   Второй массив.
     * @param key       Ключ, по которому проверяется равенство объектов. Если не указан (undefined), то объекты будут проверяться по значениям.
     *
     * @return Массив из объектов первого массива, которых нет во втором массиве.
     */
    this.array_diff = function(array_1, array_2, key) {
        // если во втором массиве нет элементов - значит ни один объект из первого не попадает во второй - возвращаем первый массив всем составом
        // если в первом массиве нет объектов - значит нечему попадать во второй массив - возвращаем пустой первый
        if (!array_2.length || !array_1.length) return array_1;

        var diff = [];
        var item;

        var len = array_1.length;
        var len2;
        var is_in_both_arrays;
        while (len--) {
            item = array_1[len];

            if (typeof key != "undefined") {
                len2 = array_2.length;
                is_in_both_arrays = false;
                while (len2--) {
                    if (item[key] == array_2[len2][key]) {
                        is_in_both_arrays = true;
                        break;
                    }
                }

                if (!is_in_both_arrays) diff.push(item);
            } else {
                if (array_2.indexOf(item) == -1) diff.push(item);
            }
        }

        return diff;
    };

    /**
     * Находит объекты первого массива, которых нет во втором массиве.
     * Проверяет рекурсивно (если объекты массивов являются хэшами).
     *
     * @param array_1   Первый массив.
     * @param array_2   Второй массив.
     *
     * @return Массив из объектов первого массива, которых нет во втором массиве.
     */
    this.diff_array = function(array_1, array_2)
    {
        // если во втором массиве нет элементов - значит ни один объект из первого не попадает во второй - возвращаем первый массив всем составом
        // если в первом массиве нет объектов - значит нечему попадать во второй массив - возвращаем пустой первый
        if (!array_2.length || !array_1.length) return array_1;

        var diff = [];
        var item;

        var len = array_1.length;
        var len2;
        var is_in_both_arrays;
        while (len--) {
            item = array_1[len];

            len2 = array_2.length;
            is_in_both_arrays = false;
            while (len2--) {
                if (this.comparable_with_etalon(item, array_2[len2])) {
                    is_in_both_arrays = true;
                    break;
                }
            }

            if (!is_in_both_arrays) diff.push(item);
        }

        return diff;
    };

    /**
     * Получает границы объекта, то есть его координаты и размеры с учетом поворота.
     *
     * @param item  Объект, границы которого надо получить.
     * @param item_def  Описание объекта (необязательный параметр)
     *
     * @return границы объекта - хэш с параметрами { x: , y: , w: , h: }
     */
    this.get_bounds = function(item) {
        if (!context.system.is_object(item)) throw new Error('item должно быть объектом.');

        var coords;
        var rotated;

        // если нет координат - получить объект из стораджа.
        if (!("coords" in item)) {
            context.system.check_item_exists(item.item_id);
            coords = context.storage.get_property("map.items." + item.item_id + ".coords");
        } else {
            coords = item.coords;
        }

        // если не указано повернут ли объект
        if (!("rotated" in item))
            rotated = context.storage.has_property("map.items." + item.item_id + ".rotated") ? context.storage.get_property("map.items." + item.item_id + ".rotated") : false;
        else rotated = item.rotated;

        context.system.check_coords(coords);

        var def_width;
        var def_height;

        var type_id;

        if ("type_id" in item) type_id = item.type_id;
        else if ("item_id" in item) type_id = context.storage.get_property("map.items." + item.item_id + ".type_id");
        else throw new Error("Не указан дэф объекта, а определить type_id оказалось невозможно.");

        def_width = context.defs.get_def("map_items." + type_id + ".width");
        def_height = context.defs.get_def("map_items." + type_id + ".height");

        context.system.check_int_positive(def_width, 'width');
        context.system.check_int_positive(def_height, 'height');

        var rect = { x: coords.x, y: coords.y };
        if (rotated) {
            rect.w = def_height;
            rect.h = def_width;
        } else {
            rect.h = def_height;
            rect.w = def_width;
        }

        rect.x -= rect.w;
        rect.y -= rect.h;

        return rect;
    };

    /**
     * Поворачивает баунды объекта (как будто объект повернули).
     * МЕТОД РАБОТАЕТ ТОЛЬКО ЕСЛИ БАУНДЫ ОБЪЕКТА НАЧИНАЮТСЯ С ТОЧКИ, БЛИЖАЙЩЕЙ К НАЧАЛУ КООРДИНАТ.
     *
     * @param   rect    Текущие границы объекта.
     *
     * @return  Повернутые границы объекта.
     */
    this.rotate_bounds = function(rect) {
        context.system.check_rect(rect);
        return { x: rect.x + rect.w - rect.h, y: rect.y + rect.h - rect.w, w: rect.h, h: rect.w };
    };

    /**
     * Расширяет границы bounds на радиус radius.
     * Не модифицирует объект bounds.
     *
     * @param bounds
     * @param radius
     *
     * @returns {Object} {x, y, w, h}
     */
    this.expand_bounds = function(bounds, radius) {
        if (!radius) return bounds;

        return {
            x: bounds.x - radius,
            y: bounds.y - radius,
            w: bounds.w + 2 * radius,
            h: bounds.h + 2 * radius
        };
    };

    /**
     * Возвращает строковое представление объекта с учетом вложенных объектов.
     *
     * @param   target  Объект, который надо превратить в строку.
     *
     * @return  Строка со всеми полями объекта.
     */
    this.print_object = function(target) {
        var result;
        var len;
        var i;

        if (true === target) return "true";
        if (false === target) return "false";
        if (null == target) return "null";
        if (typeof(target) == "string") return "" + target;
        if (typeof(target) == "undefined") return "null";
        if (typeof(target) == "number") return target.toString();

        // Случай с массивом
        if (target.constructor == Array) {

            len = target.length;
            var array = [];
            array.length = len;
            while (len--) array[len] = this.print_object(target[len]);

            result = "[" + array.join(", ") + "]";

            return result;
        }

        // далее случай с хэшем (Object)

        // получаем список имен полей объекта
        var targetFieldNames = [];
        var keys = context.utils.get_ordered_keys(target);
        for (var i = 0; i < keys.length; i++) {
            var name = keys[i];
            targetFieldNames.push(name);
        }

        // сортируем имена полей в алфавитном порядке
        targetFieldNames.sort();

        // получаем сортированный массив полей, готовый для упаковки в json
        var jsonFields = [];
        len = targetFieldNames.length;
        for (i = 0; i < len; ++i) {
            name = targetFieldNames[i];
            var value = this.print_object(target[name]);
            jsonFields.push("'" + name + "': " + value);
        }

        result = "{" + jsonFields.join(", ") + "}";

        return result;
    };

    /**
     * Получить список ключей хэша, отсортированный по алфавиту.
     *
     * @param hash  Хэш, ключи которого надо сортировать.
     */
    this.get_ordered_keys = function(hash) {
        if (!context.system.is_object(hash)) throw new Error('На вход должен подаваться hash.');
        var keys = Object.keys(hash);
        keys.sort();
        return keys;
    };

    /**
     * Получить список ключей вида _N хэша, отсортированный по возрастанию
     *
     * @param hash  Хэш, ключи которого надо сортировать.
     */
    this.get_ordered_numeric_keys = function(hash) {
        if (!context.system.is_object(hash)) throw new Error('На вход должен подаваться hash.');
        var keys = Object.keys(hash)
        keys.sort(function(a, b) {
            return parseInt(a.substr(1)) - parseInt(b.substr(1));
        });
        return keys;
    };

    this.current_location_is_mine = function() {
        var room_owner_id = context.qa_manager.handle(GetLocationOwnerIDQA.toString());
        var my_id = context.storage.get_property("player.social_id");
        return (my_id == room_owner_id);
    };

    this.current_room_is_mine = function() {
        return this.current_location_is_mine() && context.storage.get_property("map.options.location.current_room") == 0;
    };

    /**
     * Рекурсивно сравнивает хэши
     * Сравниваются только те поля, которые есть в эталоне
     *
     * @param etalon        Эталон - набор свойств которые точно должны быть, и быть именно такими
     * @param comparable    Сравнимое - то, что проверяем на эдентичность
     *
     * @return  true, если все поля эталона так же присутствуют в сравнимом и равны полям сравнимого
     */
    this.comparable_with_etalon = function(etalon, comparable) {
        // булевские типы
        if (typeof(etalon) == "boolean" && typeof(comparable) == "boolean") {
            return etalon == comparable;
        }

        if (etalon === null || typeof(etalon) == "undefined") {
            return comparable === null || typeof(comparable) == "undefined";
        }

        if (typeof(etalon) != typeof(comparable)) return false;

        if ((typeof(etalon) === "number") && isNaN(etalon) && isNaN(comparable)) return true;
        if (null === comparable || (typeof(comparable) === "undefined")) return false;

        // сравниваем строки или числа
        if ((typeof(etalon) === "string") || (typeof(etalon) === "number")) {
            return (etalon === comparable);
        }

        if (etalon.constructor !== comparable.constructor) return false;

        // сравниваем 2 массива
        if (Array === etalon.constructor) {
            if (Array !== comparable.constructor) return false;

            var len = etalon.length;
            if (len != comparable.length) return false;

            while (len--) {
                if (!(this.comparable_with_etalon(etalon[len], comparable[len]))) return false;
            }

            return true;
        }

        // сравниваем 2 хэша
        var name = "";
        for (name in etalon) {
            if (!(name in comparable)) return false;
            if (!(this.comparable_with_etalon(etalon[name], comparable[name]))) return false;
        }

        return true;
    };

    /**
     * Рекурсивно сравнивает хэши с возможностью использования операторов > и <
     * (работает только для чисел в comparable и строки вида $<operator><value> в эталоне
     *
     * Сравниваются только те поля, которые есть в эталоне
     *
     * @param etalon        Эталон - набор свойств которые точно должны быть, и быть именно такими
     * @param comparable    Сравнимое - то, что проверяем на эдентичность
     *
     * @return  true, если все поля эталона так же присутствуют в сравнимом и равны полям сравнимого
     */
    this.comparable_with_etalon_with_expressions = function(etalon, comparable) {
        // булевские типы
        if (typeof(etalon) == "boolean" && typeof(comparable) == "boolean") {
            return etalon == comparable;
        }

        if (etalon === null || typeof(etalon) == "undefined") {
            return comparable === null || typeof(comparable) == "undefined";
        }

        if (typeof(etalon) === "string") {
            if (etalon.indexOf('$') == 0) {
                return this.calculate_expression(etalon, comparable);
            }
        }

        if (typeof(etalon) != typeof(comparable)) {
            return false;
        }

        if ((typeof(etalon) === "number") && isNaN(etalon) && isNaN(comparable)) return true;
        if (null === comparable || (typeof(comparable) === "undefined")) return false;

        // сравниваем строки или числа
        if ((typeof(etalon) === "string") || (typeof(etalon) === "number")) {
            return (etalon === comparable);
        }

        if (etalon.constructor !== comparable.constructor) return false;

        // сравниваем 2 массива
        if (Array === etalon.constructor) {
            if (Array !== comparable.constructor) return false;

            var len = etalon.length;
            if (len != comparable.length) return false;

            while (len--) {
                if (!(this.comparable_with_etalon_with_expressions(etalon[len], comparable[len]))) return false;
            }

            return true;
        }

        // сравниваем 2 хэша
        var name = "";
        for (name in etalon) {
            if (!(name in comparable)) return false;
            if (!(this.comparable_with_etalon_with_expressions(etalon[name], comparable[name]))) return false;
        }

        return true;
    };

    /**
     * Функция обработки выражения для сравниваемого значения
     * в выражении поддерживаются операторы ! > <
     * @param etalon строка с оператором вида $<operator><value>
     * @param comparable значения для сравнения с value, тип Number для < и >. String для ! (оператор неравенства)
     * @return {Boolean}
     */
    this.calculate_expression = function(etalon, comparable) {
        var operator = etalon.charAt(1);
        var value = etalon.substr(2);
        if (operator == "!" || operator == "=") {
            var retval;
            if (value.indexOf(',') == -1)
                retval = comparable.toString() == value;
            else
                retval = value.split(',').indexOf(comparable) > -1;

            if (operator == "!")
                return !retval;
            else
                return retval;
        }
        if (operator == ">") {
            return comparable > parseFloat(value);
        } else if (operator == "<") {
            return comparable < parseFloat(value);
        } else {
            throw new Error("Unknown operator passed");
        }
    };

    this.rect_diff = function(main_rect, reduction_rect) {
        context.system.check_rect(main_rect, 'main_rect');
        context.system.check_rect(reduction_rect, 'reduction_rect');

        var min_x = (reduction_rect.x > main_rect.x) ? reduction_rect.x : main_rect.x;
        var min_y = (reduction_rect.y > main_rect.y) ? reduction_rect.y : main_rect.y;
        var max_x = (reduction_rect.x + reduction_rect.w < main_rect.x + main_rect.w) ? (reduction_rect.x + reduction_rect.w) : (main_rect.x + main_rect.w);
        var max_y = (reduction_rect.y + reduction_rect.h < main_rect.y + main_rect.h) ? (reduction_rect.y + reduction_rect.h) : (main_rect.y + main_rect.h);

        if (max_x > min_x && max_y > min_y) {
            var res = [];

            if (min_x > main_rect.x) {
                res.push({x: main_rect.x, y: main_rect.y, w: min_x - main_rect.x, h: main_rect.h});
            }

            if (min_y > main_rect.y) {
                res.push({x: min_x, y: main_rect.y, w: max_x - min_x, h: min_y - main_rect.y});
            }

            if (max_y < main_rect.y + main_rect.h) {
                res.push({x: min_x, y: max_y, w: max_x - min_x, h: main_rect.y + main_rect.h - max_y});
            }

            if (max_x < main_rect.x + main_rect.w) {
                res.push({x: max_x, y: main_rect.y, w: main_rect.x + main_rect.w - max_x, h: main_rect.h});
            }
            return res;
        } else {
            return [main_rect];
        }
    };

    this.get_value_by_key = function(target, key) {
        if (arguments.length < 2) throw new Error("Не верное количество параметров");
        var keys = key.split(".");
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!(key in target)) return null;
            target = target[key];
        }
        return target;
    };

    /**
     * Метод для копирования объекта путем перебора всех его свойств.
     *
     * @param   object  Объект для копирования.
     *
     * @return  {*} Объект, являющийся полной копией переденного в параметры объекта.
     */
    this.copy_object = function(object) {
        var result;
        var len;
        var i;

        if (true === object || false === object || null == object || typeof(object) == "string" || typeof(object) == "undefined" || typeof(object) == "number") return object;

        if (object.constructor == Array) {
            result = [];
            len = object.length;
            result.length = len;

            while (len--) result[len] = this.copy_object(object[len]);
        } else {
            result = {};

            var name;
            var keys = this.get_ordered_keys(object);
            len = keys.length;

            for (i = 0; i < len; ++i) {
                name = keys[i];
                result[name] = this.copy_object(object[name]);
            }
        }

        return result;
    };

    /**
     * Возвращает лог сравнения хешей клиента и сервера
     * @param clientHash
     * @param serverHash
     */
    this.getHashDiffLog = function(clientHash, serverHash) {
        function getTokenArray(string) {
            var result = string.split("][");
            for (var i = 0; i < result.length; ++i) {
                if (i != 0) { result[i] = "[" + result[i]; }
                if (i != result.length - 1) { result[i] += "]"; }
            }
            return result;
        }

        var clientTokenArray = getTokenArray(clientHash);
        var serverTokenArray = getTokenArray(serverHash);
        var fullLog = "";
        var i = 0;
        if (clientTokenArray.length > 0 && serverTokenArray.length > 0) {
            fullLog += "client & server : \n";
        }
        while (clientTokenArray.length > 0 && serverTokenArray.length > 0) {
            var clientToken = clientTokenArray.shift();
            var serverToken = serverTokenArray.shift();
            if (clientToken == serverToken) {
                fullLog += "[" + i + "] " + clientToken + "\n";
            } else {
                fullLog += "\nerror\n";
                fullLog += "client : " + clientToken + "\n" + "server :" + serverToken + "\n------";
                fullLog += "\nclient : \n" + clientTokenArray.join("\n");
                clientTokenArray.length = 0;
                fullLog += "\nserver : \n" + serverTokenArray.join("\n");
                serverTokenArray.length = 0;
            }
            ++i;
        }
        if (clientTokenArray.length > 0) {
            fullLog += "\nclient : \n" + clientTokenArray.join("\n");
        }
        else if (serverTokenArray.length > 0) {
            fullLog += "\nserver : \n" + serverTokenArray.join("\n");
        }
        return fullLog;
    };
};

/**
 * File: js/commands/ActionPointOfEntryCommand.js
 */
var CommandNames = {
    ACTION_POINT_OF_ENTRY: "action_point_of_entry"
}

var ActionPointOfEntryCommand = function() {
    const FAKE = "fake";

    var click_commands = {};
    var first_line_commands = {};
    first_line_commands[BroadcastUnlockRequestCommand] = true;
    first_line_commands[BuyPackCommand] = true;
    first_line_commands[BuyBoosterCommand] = true;
    first_line_commands[ClickForensicItemCommand] = true;
    first_line_commands[ClickLabItemCommand] = true;
    first_line_commands[ClickSuspectCommand] = true;
    first_line_commands[ClickTaskCommand] = true;
    first_line_commands[DeletePartnerCommand] = true;
    first_line_commands[DropActiveMinigameCommand] = true;
    first_line_commands[DropActiveSceneCommand] = true;
    first_line_commands[DropTutorialCommand] = true;
    first_line_commands[EndMinigameCommand] = true;
    first_line_commands[EndSceneCommand] = true;
    first_line_commands[ExecuteNextTriggerCommand] = true;
    first_line_commands[OpenCaseCommand] = true;
    first_line_commands[ProgressTutorialCommand] = true;
    first_line_commands[ResetPartnerCommand] = true;
    first_line_commands[SpeedupLabItemCommand] = true;
    first_line_commands[StartDayCommand] = true;
    first_line_commands[StartMinigameCommand] = true;
    first_line_commands[StartSceneCommand] = true;
    first_line_commands[TickEnergyCommand] = true;
    first_line_commands[InvitePartnerCommand] = true;
    first_line_commands[UnlockCaseCommand] = true;
    first_line_commands[UseItemCommand] = true;
    first_line_commands[UseServiceResultCommand] = true;

    /**
     * command_name - название игрового действия, которое обрабатываем
     * args - для каждой команды выглядит по-своему
     */
    this.execute = function(command_name, args) {
        if (command_name in click_commands) {
            // Executor.run(CommandNames.CLICK, command_name, args);
        } else if (command_name in first_line_commands) {
            Executor.run(command_name, args);
        } else if (command_name == FAKE) {
            //Пустая команда. Вызывается с клиента только для того чтобы прошелся определенный квест (к примеру, квест "кликни на кнопку")
        } else {
            throw new LogicError("На входе недоступен обработчик команды '" + command_name + "'.");
        }
    };
};

ActionPointOfEntryCommand.toString = function() {
    return "action_point_of_entry"
};

/**
 * File: js/commands/AddBoosterCommand.js
 */
var AddBoosterCommand = function() { };

AddBoosterCommand.toString = function() {
    return "add_booster";
};

AddBoosterCommand.prototype.execute = function(args) {
    context.system.check_key(args, "booster_type");
    context.system.check_key(args, "count");

    var booster_type = args.booster_type;
    var count = args.count;

    if (!(args.booster_type in context.defs.get_def("boosters.booster_types"))) {
        throw new LogicError("Неизвестный бустер!\nbooster_type: " + booster_type);
    }
    context.player.set_booster_count(booster_type, context.player.get_booster_count(booster_type) + count);
};

/**
 * File: js/commands/AddCashCommand.js
 */
var AddCashCommand = function() { };

AddCashCommand.toString = function() {
    return "add_cash"
};

AddCashCommand.prototype.execute = function(value) {
    var old_balance = context.player.get_real_balance();
    context.player.add_real_balance(value);
};


/**
 * File: js/commands/AddItemCommand.js
 */
var AddItemCommand = function() { };

AddItemCommand.toString = function() {
    return "add_item";
}

AddItemCommand.prototype.execute = function(item_id, count) {
    if (!context.defs.has_def("items.item_types." + item_id)) {
        throw new LogicError("Неизвестный идентификатор предмета " + item_id);
    }

    context.player.set_item_count(item_id, context.player.get_item_count(item_id) + count);
};

/**
 * File: js/commands/AddMoneyCommand.js
 */
var AddMoneyCommand = function() { };

AddMoneyCommand.toString = function() {
    return "add_money"
};

AddMoneyCommand.prototype.execute = function(value) {
    var old_balance = context.player.get_game_balance();
    context.player.add_game_balance(value);
    context.events.animate("money", old_balance, context.player.get_game_balance());
};

/**
 * File: js/commands/AddSceneScoreCommand.js
 */
var AddSceneScoreCommand = function() {};

AddSceneScoreCommand.toString = function() {
    return "add_scene_score";
};

AddSceneScoreCommand.prototype.execute = function(scene_id, score) {
    context.system.check_int_positive_or_0(score, 'score');

    var scores = context.case.sceneStarScores(scene_id);
    var scene = context.case.openedScenes(scene_id);

    var new_score = scene.score + score;

    var new_stars = scene.stars;
    var max_stars = scores.length;

    for (var i = new_stars; i < max_stars; ++i) {
        if (new_score >= scores[i]) {
            new_score -= scores[i];
            ++new_stars;
        } else {
            break;
        }
    };

    if (new_stars > scene.stars) {
        Executor.run(AddSceneStarCommand, scene_id, new_stars - scene.stars)
    }

    var old_stars_float = scene.stars;
    if (scene.stars < max_stars) {
        old_stars_float = scene.stars + scene.score / scores[scene.stars];
    }

    var new_stars_float = new_stars + new_score / scores[new_stars];
    if (new_stars == max_stars) {
        new_score = 0;
        new_stars_float = max_stars;
    }
    context.events.animate("stars", old_stars_float, new_stars_float);
    context.storage.set_property(context.case.openedScenesProp(scene_id) + ".score", new_score);
};

/**
 * File: js/commands/AddSceneStarCommand.js
 */
var AddSceneStarCommand = function() {};

AddSceneStarCommand.toString = function() {
    return "add_scene_star";
};

AddSceneStarCommand.prototype.execute = function(scene_id, value) {
    context.system.check_int_positive(value, 'value');
    context.case.checkSceneDefined(scene_id);
    var scene_stars_property = context.case.openedScenesProp(scene_id) + ".stars";
    var scene = context.case.openedScenes(scene_id);
    var case_id = context.case.activeCase();

    if (scene.stars + value > context.case.starsLimit()) {
        throw new LogicError("Попытка добавить звезд сверх лимита!\ncase_id: " + case_id);
    }

    context.storage.set_property(scene_stars_property, scene.stars + value);
    context.case.setStars(context.case.stars() + value);

    var hog_count = scene.hog_count;
    for (var i = 1; i <= value; ++i) {
        context.track.event("hog_count", case_id, scene_id, scene.stars + i, hog_count);
        hog_count = 1;
    }

    Executor.run(UnlockBonusScenesCommand);
    if (context.case.totalStars() >= context.case.caseStarsLimit() ) {
        Executor.run(AddMedalCommand, "gold");
    }
};

/**
 * File: js/commands/AddXpCommand.js
 */
var AddXpCommand = function() { };

AddXpCommand.toString = function() {
    return "add_xp"
};

AddXpCommand.prototype.execute = function(value) {
    context.system.check_int_positive_or_0(value, 'value');
    if (value == 0) return;

    var lvl_index =  context.player.get_level() - 1;
    var levels = context.defs.get_def('levels.levels_list');
    var max_lvl_index = levels.length - 1;

    if (lvl_index >= max_lvl_index) return;

    var cur_xp = context.player.get_xp();
    var cur_lvl_cap = levels[lvl_index + 1].required_xp;
    var xp = cur_xp + value;

    var new_lvl_index = lvl_index;
    while (max_lvl_index > new_lvl_index && levels[new_lvl_index + 1].required_xp <= xp) {
        new_lvl_index++
        xp -= levels[new_lvl_index].required_xp
        context.track.levelup(new_lvl_index + 1, levels[new_lvl_index].reward);
        Executor.run(ApplyRewardCommand, levels[new_lvl_index].reward);
    }

    if (new_lvl_index == max_lvl_index) {
        xp = 0;
    }

    if (lvl_index != new_lvl_index) {
        context.player.set_level(new_lvl_index + 1);
        context.track.adx_event("LevelUp", new_lvl_index + 1);
        context.energy.refill();
        var time = context.last_command_time();
        Object.keys(context.partners.partner()).forEach(function(partner_id) {
            Executor.run(SendGiftCommand, partner_id, time, "levelup", 1, {items: {item_1 : 1}});
        });
    }

    context.player.set_xp(xp);

    if (lvl_index < new_lvl_index) {
        context.events.animate("exp", cur_xp, cur_lvl_cap);
        for (var index = lvl_index + 1; index < new_lvl_index; ++index) {
            context.events.animate("level", index, index + 1);
            context.events.animate("exp", 0, levels[index + 1].required_xp);
        };
        context.events.animate("level", new_lvl_index, new_lvl_index + 1);
        context.events.animate("exp", 0, xp);
        context.events.notify("levelup", new_lvl_index + 1);
    } else {
        context.events.animate("exp", cur_xp, xp);
    }
};


/**
 * File: js/commands/ApplyRewardCommand.js
 */
var ApplyRewardCommand = function() { };

ApplyRewardCommand.toString = function() {
    return "apply_reward"
};

ApplyRewardCommand.prototype.execute = function(reward) {
    if (reward.xp) { Executor.run(AddXpCommand, reward.xp); }
    if (reward.game_balance) { Executor.run(AddMoneyCommand, reward.game_balance) }
    if (reward.real_balance) { Executor.run(AddCashCommand, reward.real_balance) }
};


/**
 * File: js/commands/ArrestSuspectCommand.js
 */
var ArrestSuspectCommand = function () {};

ArrestSuspectCommand.toString = function () {
    return "arrest_suspect";
};

ArrestSuspectCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.case.checkActiveCase();

    var suspect_id = args.suspect;

    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый " + suspect_id + " недоступен в деле " + context.case.activeCase());
    }

    var suspect = context.case.knownSuspects(suspect_id);
    if (suspect.state != "arrest") {
        throw new LogicError("Для ареста подозреваемого необходим стейт arrest;\nsuspect: " + suspect_id + "; suspect_state: " + suspect.state + "; case: " + context.case.activeCase());
    }
    var arrest_data = context.case.arrestData();
    var arrest_cost = context.case.suspectClickCost(suspect_id);

    Executor.run(ConsumeStarCommand, arrest_cost);
    context.events.arrest(suspect_id);

    if (arrest_data.killer == suspect_id) {
        context.track.event("arrest", null, null, context.case.activeCase(), context.case.mistakenArrestsCount());
        for (var other_suspect_id in context.case.knownSuspects()) {
            Executor.run(SetSuspectStateCommand, {"suspect": other_suspect_id, "state": "default"});
        }
        Executor.run(DeleteTasksCommand, "arrest", null);
        Executor.run(PushTriggersCommand, arrest_data.on_success);
        Executor.run(AddMedalCommand, "bronze");
    } else {
        context.storage.inc_property(context.case.mistakenArrestsCountProp(context.case.activeCase()));
        Executor.run(SetSuspectStateCommand, {"suspect": suspect_id, "state": "default"})
        Executor.run(PushTriggersCommand, arrest_data.on_fail);
    }
};


/**
 * File: js/commands/ConsumeStarCommand.js
 */
var ConsumeStarCommand = function() {};

ConsumeStarCommand.toString = function() {
    return "consume_star";
};

ConsumeStarCommand.prototype.execute = function(value) {
    if (value === 0) return;
    context.system.check_int_positive(value, 'value');
    var stars = context.case.stars();

    if (stars >= value) {
        context.case.setStars(stars - value);
        context.events.animate("stars", stars, stars - value);
    } else {
        throw new LogicError("Недостаточно звезд в деле!\n" + context.case.activeCase() + ', value: ' + value);
    }
};

/**
 * File: js/commands/EndCaseCommand.js
 */
var EndCaseCommand = function () {};

EndCaseCommand.toString = function () {
    return "end_case";
};

EndCaseCommand.prototype.execute = function() {
    var case_id = context.case.activeCase();
    context.track.progress_step(case_id, "next_case_unlocked");
    context.case.setStatus("complete");
    Executor.run(IncludeCaseTasksCommand);
};

/**
 * File: js/commands/EndLabItemAnalyzeCommand.js
 */
var EndLabItemAnalyzeCommand = function() {};

EndLabItemAnalyzeCommand.toString = function() {
    return "end_lab_item_analyze";
};

EndLabItemAnalyzeCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');
    context.case.checkActiveCase();

    var lab_item_id = args.lab_item;
    var time = parseInt(args.time);

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item_def = context.case.labItems(lab_item_id);
    var lab_item = context.case.foundLabItems(lab_item_id);

    var analyzed_items = context.case.analyzedItems();
    if (!(lab_item_id in analyzed_items)) {
        throw new LogicError("Предмет не находится в процессе исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var end_time = analyzed_items[lab_item_id].end;
    if (end_time > time) {
        throw new LogicError("Исследование предмета еще не завершено!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    context.storage.set_property(context.case.analyzedItemsProp(lab_item_id), null);

    var new_state = "done"
    context.storage.set_property(context.case.foundLabItemsProp(lab_item_id) + ".state", new_state);

    Executor.run(ShowLabItemAnalyzeResultCommand, args);
    Executor.run(PushTriggersCommand, lab_item_def.on_analyze);
    Executor.run(DeleteTasksCommand, "analyze", lab_item_id);
};

/**
 * File: js/commands/InitCommands.js
 */
var InitCommands = function() {
    Executor.bind(AddBoosterCommand);
    Executor.bind(BroadcastUnlockRequestCommand);
    Executor.bind(BuyBoosterCommand);
    Executor.bind(BuyPackCommand);
    Executor.bind(ClickForensicItemCommand);
    Executor.bind(ClickLabItemCommand);
    Executor.bind(ClickSuspectCommand);
    Executor.bind(ClickTaskCommand);
    Executor.bind(DeletePartnerCommand);
    Executor.bind(DropActiveMinigameCommand);
    Executor.bind(DropActiveSceneCommand);
    Executor.bind(DropTutorialCommand);
    Executor.bind(EndMinigameCommand);
    Executor.bind(EndSceneCommand);
    Executor.bind(ExecuteNextTriggerCommand);
    Executor.bind(InvitePartnerCommand);
    Executor.bind(OpenCaseCommand);
    Executor.bind(ProgressTutorialCommand);
    Executor.bind(ResetPartnerCommand);
    Executor.bind(SpeedupLabItemCommand);
    Executor.bind(StartDayCommand);
    Executor.bind(StartMinigameCommand);
    Executor.bind(StartSceneCommand);
    Executor.bind(TickEnergyCommand);
    Executor.bind(UnlockCaseCommand);
    Executor.bind(UseItemCommand);
    Executor.bind(UseServiceResultCommand);

    Executor.bind(SendGiftCommand);
    Executor.bind(SendUnlockRequestCommand);

    Executor.bind(AddCluesCommand);
    Executor.bind(AddForensicItemCommand);
    Executor.bind(AddItemCommand);
    Executor.bind(AddLabItemCommand);
    Executor.bind(AddMedalCommand);
    Executor.bind(AddSuspectCluesCommand);
    Executor.bind(AddSuspectCommand);
    Executor.bind(CheckTransitionCommand);
    Executor.bind(IncludeCaseTasksCommand);
    Executor.bind(ExcludeCaseTasksCommand);
    Executor.bind(InitArrestStateCommand);
    Executor.bind(OpenNewSceneCommand);
    Executor.bind(ProgressChapterCommand);
    Executor.bind(RateAppCommand);
    Executor.bind(RemoveSuspectCommand);
    Executor.bind(SetForensicItemStateCommand);
    Executor.bind(SetInfoStateCommand);
    Executor.bind(SetSceneStateCommand);
    Executor.bind(SetSuspectStateCommand);
    Executor.bind(ShowDeductionCommand);
    Executor.bind(ShowMovieCommand);
    Executor.bind(StartNextChapterCommand);
    Executor.bind(UnlockNewCaseCommand);

    Executor.bind(AddCustomTaskCommand);
    Executor.bind(AddStartNextChapterTaskCommand);
    Executor.bind(AddUnlockNewCaseTaskCommand);
    Executor.bind(DeleteTasksCommand);
    Executor.bind(PushTaskCommand);
    Executor.bind(UpdateTaskCommand);

    Executor.bind(ActionPointOfEntryCommand, CommandNames.ACTION_POINT_OF_ENTRY);
    Executor.bind(AddCashCommand);
    Executor.bind(AddMoneyCommand);
    Executor.bind(AddSceneScoreCommand);
    Executor.bind(AddSceneStarCommand);
    Executor.bind(AddXpCommand);
    Executor.bind(ApplyRewardCommand);
    Executor.bind(ArrestSuspectCommand);
    Executor.bind(EndCaseCommand);
    Executor.bind(EndLabItemAnalyzeCommand);
    Executor.bind(ConsumeStarCommand);
    Executor.bind(PushTriggersCommand);
    Executor.bind(ShowLabItemAnalyzeResultCommand);
    Executor.bind(StartLabItemAnalyzeCommand);
    Executor.bind(StartNewCaseCommand);
    Executor.bind(TalkSuspectCommand);
    Executor.bind(UnlockBonusScenesCommand);
    Executor.bind(UpdateHighscoreCommand);
    Executor.bind(UsePartnerCommand);

    Executor.bind(UpdateKillerStateCommand);
    Executor.bind(UpdateSuspectStateCommand);
    Executor.bind(SetSuspectAlibiCommand);
    Executor.bind(SetSuspectMotiveCommand);

};

/**
 * File: js/commands/PushTriggersCommand.js
 */
var PushTriggersCommand = function() { };

PushTriggersCommand.toString = function() {
    return "push_triggers"
};

PushTriggersCommand.prototype.execute = function(new_triggers) {
    var triggersProp = context.case.triggersProp();

    if (!Array.isArray(new_triggers)) {
        throw new LogicError('Параметр new_triggers должен быть массивом');
    }

    for (var i in new_triggers) {
        if (new_triggers[i] == null) {
            throw new LogicError('Триггеры в new_triggers должны быть объектами');
        }
    }

    context.storage.set_property(triggersProp, context.case.triggers().concat(new_triggers));
};

/**
 * File: js/commands/ShowLabItemAnalyzeResultCommand.js
 */
var ShowLabItemAnalyzeResultCommand = function() {};

ShowLabItemAnalyzeResultCommand.toString = function() {
    return "show_lab_item_analyze_result";
};

ShowLabItemAnalyzeResultCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');
    context.case.checkActiveCase();

    var lab_item_id = args.lab_item;
    var time = parseInt(args.time);

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    var lab_item_def = context.case.labItems(lab_item_id);

    var triggers;
    if (context.system.is_array(lab_item_def.analyze_movie)) {
        triggers = lab_item_def.analyze_movie.map(function(movie_id) {
            return {"show_movie": movie_id};
        });
    } else {
        triggers = [{"show_movie": lab_item_def.analyze_movie}];
    }

    Executor.run(PushTriggersCommand, triggers);
};

/**
 * File: js/commands/StartLabItemAnalyzeCommand.js
 */
var StartLabItemAnalyzeCommand = function() {};

StartLabItemAnalyzeCommand.toString = function() {
    return "start_lab_item_analyze";
};

StartLabItemAnalyzeCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');

    var lab_item_id = args.lab_item
    var time = parseInt(args.time)

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state != "new") {
        throw new LogicError("Неподходящий стейт для начала исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    }

    var analyzed_items = context.case.analyzedItems();
    if (lab_item_id in analyzed_items) {
        throw new LogicError("Предмет уже исследуется!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var new_analyzed_item = {
        end: (args.time + context.case.analyzeTime(lab_item_id) * 1000)
    }
    var new_state = "analyzing"

    context.storage.set_property(context.case.analyzedItemsProp(lab_item_id), new_analyzed_item);
    context.storage.set_property(context.case.foundLabItemsProp(lab_item_id) + ".state", new_state);
};

/**
 * File: js/commands/StartNewCaseCommand.js
 */
var StartNewCaseCommand = function() { };

StartNewCaseCommand.toString = function() {
    return "start_new_case"
};

StartNewCaseCommand.prototype.execute = function(case_id) {
    context.case.checkDefined(case_id);

    var new_case = context.defs.get_def("cases." + case_id);
    var user_case_data = {
        "status": "open",
        "medals": [],
        "stars": 0,
        "opened_scenes": {},
        "found_lab_items": {},
        "found_forensic_items": {},
        "known_clues": [],
        "known_suspects": {},
        "performed_transitions": [],
        "performed_custom_tasks": [],
        "tasks": [],
        "chapter": {
            "index": 0,
            "progress": 0,
            "completed": false
        },
        "info": {
            "victim": "default",
            "weapon": "default",
            "killer": "default"
        },
        "mistaken_arrests": 0
    }

    context.storage.set_property("open_cases." + case_id, user_case_data);
    context.storage.set_property("immediate_data.active_case", case_id);
    Executor.run(PushTriggersCommand, new_case.on_start);
    context.track.progress_step(case_id, "100_case_start");
};

/**
 * File: js/commands/TalkSuspectCommand.js
 */
var TalkSuspectCommand = function () {};

TalkSuspectCommand.toString = function () {
    return "talk_suspect";
};

TalkSuspectCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.case.checkActiveCase();

    var suspect_id = args.suspect;

    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый " + suspect_id + " недоступен в деле " + context.case.activeCase());
    }

    var suspect = context.case.knownSuspects(suspect_id);
    if (suspect.state == "arrest") {
        throw new LogicError("Для допроса необходим стейт не arrest;\nsuspect: " + suspect_id + "; case: " + context.case.activeCase());
    }

    if (suspect.state != "default") {
        var suspect_state_def = context.case.suspects(suspect_id).states[suspect.state];
        var triggers = [];
        if (suspect_state_def.talk_movie) {
            if (context.system.is_array(suspect_state_def.talk_movie)) {
                triggers = suspect_state_def.talk_movie.map(function(movie_id) {
                    return {"show_movie": movie_id};
                });
            } else {
                triggers = [{"show_movie": suspect_state_def.talk_movie}];
            }
        }

        if (!suspect.talked) {
            triggers = triggers.concat(suspect_state_def.on_talk)
            Executor.run(ConsumeStarCommand, context.case.suspectClickCost(suspect_id));
            Executor.run(DeleteTasksCommand, "talk", suspect_id);
            context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".talked", true);
        }

        Executor.run(PushTriggersCommand, triggers);
    }
};

/**
 * File: js/commands/UnlockBonusScenesCommand.js
 */
var UnlockBonusScenesCommand = function() { };

UnlockBonusScenesCommand.toString = function() {
    return "unlock_bonus_scenes"
};

UnlockBonusScenesCommand.prototype.execute = function() {
    var scene_opened, unlock_star, scene_id;
    var total_stars = context.case.totalStars();
    var scenes = context.case.scenes();

    for (scene_id in scenes) {
        unlock_star = scenes[scene_id].unlock_star;
        scene_opened = context.case.isSceneOpened(scene_id);
        if (unlock_star && !scene_opened) {
            if (total_stars >= unlock_star) {
                Executor.run(PushTriggersCommand, [{ "open_new_scene": scene_id }]);
            }
        }
    }
};

/**
 * File: js/commands/UpdateHighscoreCommand.js
 */
var UpdateHighscoreCommand = function() { };

UpdateHighscoreCommand.toString = function() {
    return "update_highscore"
};

UpdateHighscoreCommand.prototype.execute = function(scene_id, new_score) {
    var old_score = context.case.highscore(scene_id);
    if (new_score > old_score) {
        Executor.run(RateAppCommand)
        context.storage.set_property(context.case.highscoreProp(scene_id), new_score);
    }
};

/**
 * File: js/commands/UsePartnerCommand.js
 */
var UsePartnerCommand = function () {};

UsePartnerCommand.toString = function () {
    return "use_partner";
};

UsePartnerCommand.prototype.execute = function(partner_id, time) {
    context.partners.usePartner(partner_id, time);
    Executor.run(SendGiftCommand, partner_id, time, "hog_usage", 1, {energy: 1});
};

/**
 * File: js/commands/first_line/BroadcastUnlockRequestCommand.js
 */
var BroadcastUnlockRequestCommand = function() {};

BroadcastUnlockRequestCommand.toString = function() {
    return "broadcast_unlock_request";
};

BroadcastUnlockRequestCommand.prototype.execute = function(args) {
    context.system.check_key(args, "case");
    context.system.check_key(args, "time");
    var case_id = args.case;

    context.case.checkDefined(case_id);

    // tutorial behaviour workaround
    if (context.qa_manager.handle("tutorial_current_state") && (case_id === "case_02") && context.case.isNew(case_id)) {
        var unlock_prop = context.partners.unlockRequestsProp(case_id)
        context.storage.set_property(unlock_prop, ["detective", "secretary", "hacker"])
    } else {
        context.partners.broadcastUnlockRequests(case_id, args.time);
    }
};

/**
 * File: js/commands/first_line/BuyBoosterCommand.js
 */
var BuyBoosterCommand = function() {};

BuyBoosterCommand.toString = function() {
    return "buy_booster";
};

BuyBoosterCommand.prototype.execute = function(args) {
    context.system.check_key(args, "booster_type");

    var booster_type = args.booster_type;

    if (!(args.booster_type in context.defs.get_def("boosters.booster_types"))) {
        throw new LogicError("Неизвестный бустер!\nbooster_type: " + booster_type);
    }

    var booster_def = context.defs.get_def("boosters.booster_types." + booster_type);
    context.player.reduce_balance(booster_def.price);
    Executor.run(AddBoosterCommand, {"booster_type":booster_type, "count":booster_def.pack_size});
    context.track.buy_booster(booster_type, booster_def.price);
};

/**
 * File: js/commands/first_line/BuyPackCommand.js
 */
var BuyPackCommand = function() {};

BuyPackCommand.toString = function() {
    return "buy_pack";
};

BuyPackCommand.prototype.execute = function(args) {
    context.system.check_key(args, "pack_type");
    var pack_id = args.pack_type;

    if (!context.defs.has_def("packs.pack_types." + pack_id)) {
        throw new LogicError("Неизвестный пак!\npack_type: " + pack_id);
    }

    var pack_def = context.defs.get_def("packs.pack_types." + pack_id);
    context.player.reduce_balance(pack_def.price);

    for (var item_id in pack_def.content) {
        Executor.run(AddItemCommand, item_id, pack_def.content[item_id]);
    }
    context.track.buy_pack(pack_id, pack_def.price);
};

/**
 * File: js/commands/first_line/ClickForensicItemCommand.js
 */
var ClickForensicItemCommand = function() {};

ClickForensicItemCommand.toString = function() {
    return "click_forensic_item";
};

ClickForensicItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "forensic_item");
    context.system.check_number_positive(args.time, 'time');

    var forensic_item_id = args.forensic_item;
    var time = parseInt(args.time);

    context.case.checkActiveCase();
    context.case.checkTriggers();

    context.case.checkForensicItemDefined(forensic_item_id);
    if (!context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }

    var state_def = context.case.forensicItemStateDef(forensic_item_id);

    if (state_def.minigame) {
        context.events.notify("start_minigame", {
            forensic_item_id: forensic_item_id,
            data: state_def.minigame.data,
            title: state_def.minigame.title,
            img_result: state_def.minigame.img_result || state_def.img
        });
    }

    if (state_def.movie) {
        var triggers;
        if (context.system.is_array(state_def.movie)) {
            triggers = state_def.movie.map(function(movie_id) {
                return {"show_movie": movie_id};
            });
        } else {
            triggers = [{"show_movie": state_def.movie}];
        }
        Executor.run(PushTriggersCommand, triggers);
    }
};

/**
 * File: js/commands/first_line/ClickLabItemCommand.js
 */
var ClickLabItemCommand = function() {};

ClickLabItemCommand.toString = function() {
    return "click_lab_item";
};

ClickLabItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "lab_item");
    context.system.check_number_positive(args.time, 'time');

    var lab_item_id = args.lab_item
    var time = parseInt(args.time)

    context.case.checkActiveCase();
    context.case.checkTriggers();

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state === "new") {
        Executor.run(StartLabItemAnalyzeCommand, args)
    } else if (lab_item.state === "done") {
        Executor.run(ShowLabItemAnalyzeResultCommand, args)
    } else if (lab_item.state === "analyzing") {
        var left_time = context.case.analyzeTimeLeft(lab_item_id, time)
        if (left_time == 0) {
            Executor.run(EndLabItemAnalyzeCommand, args)
        } else {
            context.events.notify("speedup_lab_item", lab_item_id);
            Executor.run(SpeedupLabItemCommand, args);
        }
    } else {
        throw new LogicError("Неизвестный стейт лабораторного предмета!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    };
};

/**
 * File: js/commands/first_line/ClickSuspectCommand.js
 */
var ClickSuspectCommand = function() {};

ClickSuspectCommand.toString = function() {
    return "click_suspect";
};

ClickSuspectCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.case.checkActiveCase();
    context.case.checkTriggers();

    var suspect_id = args.suspect;

    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый " + suspect_id + " недоступен в деле " + context.case.activeCase());
    }

    var suspect = context.case.knownSuspects(suspect_id);
    if (suspect.state == "arrest") {
        Executor.run(ArrestSuspectCommand, args);
    } else if (suspect.state != "default") {
        Executor.run(TalkSuspectCommand, args);
    }
};

/**
 * File: js/commands/first_line/ClickTaskCommand.js
 */
var ClickTaskCommand = function() {};

ClickTaskCommand.toString = function() {
    return "click_task";
};

ClickTaskCommand.prototype.execute = function(args) {
    context.system.check_key(args, "index");
    var index = parseInt(args.index);
    context.system.check_int_positive_or_0(index);
    context.case.checkActiveCase();
    context.case.checkTriggers();

    var tasks = context.case.tasks();
    if (index >= tasks.length) {
        throw new LogicError("Индекс задачи должен находить в интервале [0.." + (tasks.length - 1) + "]!\ncase_id: " + context.case.activeCase() + "; index: " + index);
    }
    context.tasks.handle(tasks[index]);
};

/**
 * File: js/commands/first_line/DeletePartnerCommand.js
 */
var DeletePartnerCommand = function () { };

DeletePartnerCommand.toString = function() {
    return "delete_partner";
};

DeletePartnerCommand.prototype.execute = function(args) {
    context.system.check_key(args, "partner");
    context.system.check_key(args, "time");

    context.partners.deletePartner(args.partner, args.time);
};

/**
 * File: js/commands/first_line/DropActiveMinigameCommand.js
 */
var DropActiveMinigameCommand = function() {};

DropActiveMinigameCommand.toString = function() {
    return "drop_active_minigame";
};

DropActiveMinigameCommand.prototype.execute = function() {
    if (context.storage.has_property(context.case.activeMinigameProp)) {
        context.storage.set_property(context.case.activeMinigameProp, null);
    }
};

/**
 * File: js/commands/first_line/DropActiveSceneCommand.js
 */
var DropActiveSceneCommand = function() {};

DropActiveSceneCommand.toString = function() {
    return "drop_active_scene";
};

DropActiveSceneCommand.prototype.execute = function() {
    if (context.storage.has_property(context.case.activeSceneProp)) {
        context.storage.set_property(context.case.activeSceneProp, null);
    }
};

/**
 * File: js/commands/first_line/DropTutorialCommand.js
 */
var DropTutorialCommand = function() {};

DropTutorialCommand.toString = function() {
    return "drop_tutorial";
};

DropTutorialCommand.prototype.execute = function(args) {
    context.storage.set_property("tutorial", null);
    context.events.notify("tutorial", null);
    context.track.adx_event("TutorFinish", "1");
};

/**
 * File: js/commands/first_line/EndMinigameCommand.js
 */
var EndMinigameCommand = function() {};

EndMinigameCommand.toString = function() {
    return "end_minigame";
};

EndMinigameCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "energy");
    context.system.check_number_positive(args.time, 'time');
    context.system.check_number_positive(args.energy, 'energy');

    context.case.checkActiveCase();
    context.case.checkActiveMinigame();
    context.case.checkTriggers();

    var time = parseInt(args.time);
    var energy = parseInt(args.energy);
    var minigame = context.case.activeMinigame();
    var case_id = context.case.activeCase();

    if (minigame.start >= time) {
        throw new LogicError("Попытка завершить миниигру с неверным timestamp!");
    }

    if (energy > context.defs.get_def("energy_settings.minigame_start_energy")) {
         throw new LogicError("Неверное начисление энергии!\nenergy: " + args.energy);
    }

    context.energy.add(energy);

    var forensic_item_id = minigame.forensic_item;
    var forensic_item = context.case.foundForensicItems(forensic_item_id);
    var state_def = context.case.forensicItems(forensic_item_id).states[forensic_item.state];

    var event_name = forensic_item_id + "_" + forensic_item.state;

    var minigame_type = state_def.minigame.data.type;
    context.track.event("minigame_energy", case_id, minigame_type, event_name, energy);
    context.track.event("minigame_time", case_id, minigame_type, event_name,  Math.ceil((time - minigame.start) / 1000));

    context.storage.set_property(context.case.activeMinigameProp, null);

    Executor.run(ConsumeStarCommand, context.case.minigameCost(forensic_item_id));
    Executor.run(PushTriggersCommand, state_def.minigame.on_complete);
    Executor.run(SetForensicItemStateCommand, {
        forensic_item: forensic_item_id,
        state: state_def.minigame.next_state
    });
};

/**
 * File: js/commands/first_line/EndSceneCommand.js
 */
var EndSceneCommand = function () {};

EndSceneCommand.toString = function () {
    return "end_scene";
};

EndSceneCommand.prototype.execute = function(args) {
    context.system.check_key(args, "scene");
    context.system.check_key(args, "time");
    context.system.check_key(args, "scores");
    context.system.check_number_positive_or_0(args.scores, 'scores');

    context.case.checkActiveCase();
    context.case.checkActiveScene();
    context.case.checkTriggers();

    var active_scene = context.case.activeScene();
    var time = parseInt(args.time);
    var case_id = context.case.activeCase();
    var scene_id = active_scene.scene_id;
    var scores = parseInt(args.scores);

    if (scores > context.hog.sceneMaxScore(scene_id)) {
        throw new LogicError("Попытка начислить очков больше допустимого максимума для сцены: " + scene_id);
    }
    if (active_scene.scene_id != scene_id) {
        throw new LogicError("Попытка завершить неоткрытую сцену!\ncase_id: " + case_id + "; scene_id: " + scene_id);
    }
    if (active_scene.start >= time) {
        throw new LogicError("Попытка завершить сцену с неверным timestamp!");
    }

    var reward = {
        xp: context.hog.calcExp(),
        game_balance: context.hog.calcCoins(scores)
    };

    var scene = context.case.openedScenes(scene_id);
    context.storage.inc_property(context.case.openedScenesProp(scene_id) + ".hog_count");

    Executor.run(ApplyRewardCommand, reward);
    Executor.run(AddSceneScoreCommand, scene_id, scores);
    Executor.run(UpdateHighscoreCommand, scene_id, scores);

    if (scene.state != "default") {
        var scene_def = context.case.scenes(scene_id);
        var triggers = scene_def.states[scene.state].on_complete;

        Executor.run(SetSceneStateCommand, {scene: scene_id, state: "default"});
        Executor.run(PushTriggersCommand, triggers);
        Executor.run(DeleteTasksCommand, "investigate", scene_id);
    }

    context.storage.set_property(context.case.activeSceneProp, null);
    var stars = context.case.sceneStars(scene_id);
    context.track.scene_end(case_id, scene_id, stars, reward);
    context.track.event("hog_time", case_id, scene_id, stars, Math.ceil((time - active_scene.start) / 1000));
    context.track.event("hog_scores", case_id, scene_id, stars, scores);
    context.track.event("hog_hints", case_id, scene_id, stars, args.used_hints || 0);
    if (context.storage.has_property("tutorial.state")) {
        context.track.event("tutor", "hog", context.storage.get_property("tutorial.state"), scene_id, scores);
    }
};

/**
 * File: js/commands/first_line/ExecuteNextTriggerCommand.js
 */
var ExecuteNextTriggerCommand = function() { };

ExecuteNextTriggerCommand.toString = function() {
    return "execute_next_trigger"
};

ExecuteNextTriggerCommand.prototype.execute = function(args) {
    context.case.checkActiveCase();
    var triggers = context.case.triggers();
    var first_trigger = triggers.shift();
    context.storage.set_property(context.case.triggersProp(), triggers);

    if (first_trigger) {
        for (var key in first_trigger) {
            Executor.run(key, first_trigger[key])
        }
    } else {
        throw new LogicError("Нет триггеров для выполнения (ExecuteNextTriggerCommand)")
    }
};

/**
 * File: js/commands/first_line/InvitePartnerCommand.js
 */
var InvitePartnerCommand = function () { };

InvitePartnerCommand.toString = function() {
    return "invite_partner";
};

InvitePartnerCommand.prototype.execute = function(args) {
    context.system.check_key(args, "partner");
    context.system.check_key(args, "time");

    context.partners.invitePartner(args.partner, args.time);
};

/**
 * File: js/commands/first_line/OpenCaseCommand.js
 */
var OpenCaseCommand = function() { };

OpenCaseCommand.toString = function() {
    return "open_case"
};

OpenCaseCommand.prototype.execute = function(args) {
    context.system.check_key(args, "case");
    var case_id = args.case;

    context.case.checkDefined(case_id);

    var unlocked_cases = context.storage.get_property("unlocked_cases");
    var unlocked_cases_index = unlocked_cases.indexOf(case_id);
    if (unlocked_cases_index >= 0) {
        Executor.run(StartNewCaseCommand, case_id);
        unlocked_cases.splice(unlocked_cases_index, 1);
        context.storage.set_property("unlocked_cases", unlocked_cases);
    } else if (!context.case.isOpened(case_id)) {
        throw new LogicError("Дело не доступно для открытия!\ncase_id: " + case_id);
    } else {
        context.storage.set_property("immediate_data.active_case", case_id);
    }

    Executor.run(DropActiveSceneCommand);
    Executor.run(DropActiveMinigameCommand);
};

/**
 * File: js/commands/first_line/ProgressTutorialCommand.js
 */
var ProgressTutorialCommand = function() {};

ProgressTutorialCommand.toString = function() {
    return "progress_tutorial";
};

ProgressTutorialCommand.prototype.execute = function(args) {
    var tutorial_state = context.qa_manager.handle('tutorial_current_state');
    if (tutorial_state) {
        var tutorial_list = context.qa_manager.handle('tutorial_steps');
        var tutorial_index = tutorial_list.indexOf(tutorial_state);
        if (tutorial_index < 0) {
            throw new LogicError("Состояние туториала \"" + tutorial_state + "\" не найдено среди доступных шагов, невозможно перейти к следующему шагу");
        }
        if (tutorial_index == 0) {
            context.track.adx_event("TutorStart", "");
        }
        var time = context.last_command_time();
        var last_time = context.storage.has_property("tutorial.state_start_time") ? context.storage.get_property("tutorial.state_start_time")
                                                                                  : context.storage.get_property("options.init_time");
        context.track.event("tutor", "elapsed_time", null, tutorial_state, Math.max(Math.ceil((time - last_time) / 1000), 0));
        context.storage.set_property("tutorial.state_start_time", time);
        var new_state = (tutorial_list[tutorial_index + 1]) || null;
        if (new_state == null) {
            context.track.adx_event("TutorFinish", "1");
            context.storage.set_property("tutorial", null);
        } else {
            context.storage.set_property("tutorial.state", new_state);
        }
        context.events.notify("tutorial", new_state);
    }
};

/**
 * File: js/commands/first_line/ResetPartnerCommand.js
 */
var ResetPartnerCommand = function () { };

ResetPartnerCommand.toString = function() {
    return "reset_partner";
};

ResetPartnerCommand.prototype.execute = function(args) {
    context.system.check_key(args, "partner");
    context.system.check_key(args, "time");

    context.partners.resetPartner(args.partner, args.time);
};

/**
 * File: js/commands/first_line/SpeedupLabItemCommand.js
 */
var SpeedupLabItemCommand = function () {};

SpeedupLabItemCommand.toString = function () {
    return "speedup_lab_item";
};

SpeedupLabItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "lab_item");
    context.system.check_key(args, "time");

    context.case.checkActiveCase();
    context.case.checkTriggers();

    var lab_item_id = args.lab_item;
    var time = parseInt(args.time);

    context.case.checkLabItemDefined(lab_item_id);
    if (!context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }

    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state != "analyzing") {
        throw new LogicError("Неподходящий стейт для ускорения исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    }

    var speedup_cost = context.case.analyzeSpeedupCost(lab_item_id, time);
    if (context.player.get_real_balance() < speedup_cost) {
        throw new LogicError("Недостаточное колличество кэша для ускорения исследования!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id + "; lab_item.state: " + lab_item.state);
    }

    context.track.event("lab_item_speedup", context.case.activeCase(), null, lab_item_id, context.case.analyzeTimeLeft(lab_item_id, time));
    context.player.reduce_real_balance(speedup_cost);
    context.storage.set_property(context.case.analyzedItemsProp(lab_item_id) + ".end", time);
    context.track.speedup("lab_research", {real_balance: speedup_cost});
};

/**
 * File: js/commands/first_line/StartDayCommand.js
 */
var StartDayCommand = function () {};

StartDayCommand.toString = function () {
    return "start_day";
};

StartDayCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");

    var time = parseInt(args.time);
    var last_day_start = context.storage.get_property("options.last_day_start");

    var this_day_midnight = new Date(time).setUTCHours(0, 0, 0, 0);
    var prev_day_midnight = new Date(time).setUTCHours(-24, 0, 0, 0);

    if (last_day_start < prev_day_midnight) {
        context.storage.set_property("options.last_day_start", time);
        context.storage.set_property("player.hints", 1);
    } else if (last_day_start < this_day_midnight) {
        context.storage.set_property("options.last_day_start", time);
        var hints = context.storage.get_property("player.hints");
        if (hints < context.defs.get_def("hog_settings.HintMaxCount")) {
            context.storage.set_property("player.hints", hints + 1);
        }
    }
};


/**
 * File: js/commands/first_line/StartMinigameCommand.js
 */
var StartMinigameCommand = function() {};

StartMinigameCommand.toString = function() {
    return "start_minigame";
};

StartMinigameCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_key(args, "forensic_item");
    context.system.check_number_positive(args.time, 'time');

    var forensic_item_id = args.forensic_item;
    var time = parseInt(args.time);

    context.case.checkActiveCase();
    context.case.checkTriggers();
    context.case.checkForensicItemDefined(forensic_item_id);
    if (!context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }

    var forensic_item = context.case.foundForensicItems(forensic_item_id);
    var forensic_item_def = context.case.forensicItems(forensic_item_id);
    var state_def = forensic_item_def.states[forensic_item.state];
    if (!state_def.minigame) {
        throw new LogicError("Неподходящий стейт для начала миниигры!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id + "; forensic_item.state: " + forensic_item.state);
    }

    if (context.storage.has_property(context.case.activeMinigameProp)) {
        throw new LogicError("Миниигра уже начата!");
    }

    context.case.checkStarsCount(context.case.minigameCost(forensic_item_id));

    var active_minigame = {
        forensic_item: forensic_item_id,
        start: time
    };

    context.storage.set_property(context.case.activeMinigameProp, active_minigame);
};

/**
 * File: js/commands/first_line/StartSceneCommand.js
 */
var StartSceneCommand = function () {};

StartSceneCommand.toString = function () {
    return "start_scene";
};

StartSceneCommand.prototype.execute = function (args) {
    context.system.check_key(args, "scene");
    context.system.check_key(args, "time");
    context.system.check_key(args, "boosters");
    context.system.check_key(args, "hints");

    context.case.checkActiveCase();
    context.case.checkTriggers();

    var scene_id = args.scene;
    var case_id = context.case.activeCase();
    var time = parseInt(args.time);
    var partner_id = args.partner;
    var hints = args.hints;

    if (context.storage.has_property(context.case.activeSceneProp)) {
        // TODO: Убрали блокировку активной сцены до имплементации соответствующего функционала в клиенте
        Executor.run("drop_active_scene");
        // throw new LogicError("Активная сцена уже установлена!");
    }

    if (!context.case.isSceneOpened(scene_id)) {
        throw new LogicError("Сцена " + scene_id + " недоступна в деле " + case_id);
    }

    var scene_cost = context.case.sceneEnergyCost(scene_id);
    var current_energy = context.energy.get();

    if (scene_cost > current_energy) {
        throw new LogicError("Недостаточно энергии для сцены. Нужно: " + scene_cost + ", доступно: " + current_energy);
    }

    context.energy.spend(scene_cost, time);

    var active_boosters = [];
    var boosters = args.boosters;
    if (boosters.length > 3) {
       throw new LogicError("Нельзя использовать более трех бустеров единовременно!");
    }

    var stars = context.case.sceneStars(scene_id);
    boosters.forEach(function(booster_id) {
        var booster_count = context.player.get_booster_count(booster_id);

        if (booster_count > 0) {
            if (booster_id == "full_hints" && hints == context.defs.get_def("hog_settings.HintMaxCount")) {
                return;
            }
            active_boosters.push(booster_id);
            context.track.event("hog_boosters", case_id, scene_id + "_" + stars, booster_id, 1);
            context.player.set_booster_count(booster_id, booster_count - 1);
        }
    });

    var active_scene = {
        scene_id: scene_id,
        start: time,
        active_boosters: active_boosters,
        hints: hints
    };

    if (partner_id) {
        context.track.event("partner_hints", case_id, scene_id, stars, hints);
        active_scene.partner_id = partner_id;
        Executor.run(UsePartnerCommand, partner_id, time);
    }

    context.storage.set_property("immediate_data.active_scene", active_scene);
};

/**
 * File: js/commands/first_line/TickEnergyCommand.js
 */
var TickEnergyCommand = function() { };

TickEnergyCommand.toString = function() {
    return "tick_energy"
};

TickEnergyCommand.prototype.execute = function(args) {
    context.system.check_key(args, "time");
    context.system.check_number_positive(args.time, 'time');

    var time = parseInt(args.time);
    var count = parseInt(args.count) || 1;
    var energy = context.energy.get();
    var max = context.energy.get_max();

    if (!context.storage.has_property(context.energy.incrementProp)) {
        throw new LogicError("Незапланированный тик энергии!");
    }

    var energy_increment_time = parseInt(context.energy.get_increment_time(count));
    if (!energy_increment_time) {
        throw new LogicError("Невозможно натикать такое колличество энергии!\nenergy: " + energy + ", max: " + max + ", count: " + count);
    } else if (time < energy_increment_time) {
        throw new LogicError("Тик энергии для начисления " + count + " энергии произошел слишком рано!\nhappened: " + time + ", planned: " + energy_increment_time);
    }

    context.energy.add(count);
    energy += count;

    if (energy < max) {
        var next_tick_time = energy_increment_time + context.energy.get_increment_duration() * 1000;
        context.storage.set_property(context.energy.incrementProp, next_tick_time);
    } else {
        context.storage.set_property(context.energy.incrementProp, null);
    }
};

/**
 * File: js/commands/first_line/UnlockCaseCommand.js
 */
var UnlockCaseCommand = function() {};

UnlockCaseCommand.toString = function() {
    return "unlock_case";
};

UnlockCaseCommand.prototype.execute = function(args) {
    context.system.check_key(args, "case");
    var case_id = args.case;

    context.case.checkDefined(case_id);
    var case_prop = "new_cases." + case_id;
    if (context.storage.has_property(case_prop)) {
        var unlock_cost = context.partners.unlockRequestCost(case_id);
        context.player.reduce_balance(unlock_cost);
        var unlocked_cases = context.storage.get_property("unlocked_cases");
        if (unlocked_cases.indexOf(case_id) >= 0) {
            throw new LogicError("Дело уже разблокировано!\ncase_id: " + case_id);
        } else {
            unlocked_cases.push(case_id);
        }
        context.storage.set_property("unlocked_cases", unlocked_cases);
        context.storage.set_property(case_prop, null)
        context.events.notify("case_unlocked", case_id);
        context.track.testimonials(case_id, unlock_cost);
        context.track.event("case_unlock_time", null, null, case_id, context.case.timeFromOpening(context.last_command_time()));
    } else {
        throw new LogicError("Дело не доступно для разблокирования!\ncase_id: " + case_id);
    }
};

/**
 * File: js/commands/first_line/UseItemCommand.js
 */
var UseItemCommand = function() {};

UseItemCommand.toString = function() {
    return "use_item";
};

UseItemCommand.prototype.execute = function(args) {
    context.system.check_key(args, "item_type");

    var item_type = args.item_type;
    var count = context.player.get_item_count(item_type);
    if (count > 0) {
        var item_def = context.defs.get_def("items.item_types." + item_type);
        context.player.set_item_count(item_type, count - 1);
        context.energy.add(item_def.energy);
    } else {
        throw new LogicError("Невозможно использовать предмет: " + item_type);
    }
};

/**
 * File: js/commands/first_line/UseServiceResultCommand.js
 */
var UseServiceResultCommand = function() {
    this.services = new Services();
    this.services.add_executor("send_gift", new GiftService());
    this.services.add_executor("unlock_request", new UnlockRequestService());
    this.services.add_executor("payment", new PaymentService());
};

UseServiceResultCommand.toString = function() {
    return "use_service_result";
};

UseServiceResultCommand.prototype.execute = function(args) {
    context.system.check_key(args, "service_id");
    context.system.check_key(args, "operation_id");
    context.system.check_key(args, "result");
    context.system.check_key(args, "client_params");

    if (args.result.expires_date > 0 && args.time >= args.result.expires_date) {
        return;
    }

    this.services.use_result(args);
};

/**
 * File: js/commands/services/SendGiftCommand.js
 */
var SendGiftCommand = function() {};

SendGiftCommand.toString = function() {
    return "send_gift";
};

SendGiftCommand.prototype.execute = function(partner_id, time, type, count, content) {
    if (!context.defs.has_def("interface.messages.send_gift." + type)) {
        throw new LogicError("Неизвестный тип подарка!\ntype: " + type);
    }

    if (!count) {
        throw new LogicError("Не указано поле count в подарке!\npartner_id: " + partner_id);
    }

    if (!content) {
        throw new LogicError("Не указано содержимое подарка!\npartner_id: " + partner_id);
    }

    if (!context.partners.isFake(partner_id)) {
        context.env.createService("send_gift", {
            target_id: partner_id,
            partner_id: context.storage.get_property("player.social_id"),
            type: type,
            count: count,
            content: content,
            expires_date: time + context.get_service_expire_interval()
        });
    }
};

/**
 * File: js/commands/services/SendUnlockRequestCommand.js
 */
var SendUnlockRequestCommand = function() {};

SendUnlockRequestCommand.toString = function() {
    return "send_unlock_request";
};

SendUnlockRequestCommand.prototype.execute = function(partner_id, time, case_id, request) {
    if (!context.partners.isFake(partner_id)) {
        context.env.createService("unlock_request", {
            target_id: partner_id,
            partner_id: context.storage.get_property("player.social_id"),
            case_id: case_id,
            request: request,
            expires_date: time + context.get_service_expire_interval()
        });
    }
};

/**
 * File: js/commands/tasks/AddCustomTaskCommand.js
 */
var AddCustomTaskCommand = function() {};

AddCustomTaskCommand.toString = function() {
    return "add_custom_task";
};

AddCustomTaskCommand.prototype.execute = function(custom_task_id) {
    context.system.check_string(custom_task_id, "custom_task_id");
    var performed_custom_tasks = context.case.performedCustomTasks();
    if (performed_custom_tasks.indexOf(custom_task_id) >= 0) {
        throw new LogicError("Задача с данным идентификатором уже была добавлена!\ncase_id: " + context.case.activeCase() + "; custom_task_id: " + custom_task_id);
    }

    var custom_tasks = context.case.customTasks();
    if (!(custom_task_id in custom_tasks)) {
        throw new LogicError("Задача с данным идентификатором не найдена!\ncase_id: " + context.case.activeCase() + "; custom_task_id: " + custom_task_id);
    }
    performed_custom_tasks.push(custom_task_id);
    context.storage.set_property(context.case.performedCustomTasksProp(), performed_custom_tasks);
    var task = custom_tasks[custom_task_id];

    context.system.check_key(task, "cost");
    context.system.check_key(task, "on_click");
    context.system.check_key(task, "img");
    context.system.check_key(task, "action_text");
    context.system.check_key(task, "target_text");

    Executor.run(PushTaskCommand, {
        type: "custom",
        object_id: custom_task_id,
        img: task.img,
        action_text: task.action_text,
        target_text: task.target_text,
        cost: parseInt(task.cost),
        on_click: task.on_click
    });

};

/**
 * File: js/commands/tasks/AddStartNextChapterTaskCommand.js
 */
var AddStartNextChapterTaskCommand = function() {};

AddStartNextChapterTaskCommand.toString = function() {
    return "add_start_next_chapter_task";
};

AddStartNextChapterTaskCommand.prototype.execute = function(args) {
    context.system.check_object(args, "args");
    var chapter = context.case.currentChapter();
    var type = "start_next_chapter";
    Executor.run(PushTaskCommand, {
        type: type,
        object_id: chapter.index + 1,
        cost: (args.hasOwnProperty("cost") ? args.cost : context.tasks.defaultCost(type)),
    });
};

/**
 * File: js/commands/tasks/AddUnlockNewCaseTaskCommand.js
 */
var AddUnlockNewCaseTaskCommand = function() {};

AddUnlockNewCaseTaskCommand.toString = function() {
    return "add_unlock_new_case_task";
};

AddUnlockNewCaseTaskCommand.prototype.execute = function(args) {
    context.system.check_object(args, "options");
    context.system.check_key(args, "case");
    context.case.checkDefined(args.case);
    var type = "unlock_new_case";

    Executor.run(PushTaskCommand, {
        type: type,
        object_id: args.case,
        cost: (args.hasOwnProperty("cost") ? args.cost : context.tasks.defaultCost(type)),
        triggers: args.triggers || []
    });
};

/**
 * File: js/commands/tasks/DeleteTasksCommand.js
 */
var DeleteTasksCommand = function() {};

DeleteTasksCommand.toString = function() {
    return "delete_tasks";
};

DeleteTasksCommand.prototype.execute = function(type, object_id) {
    context.system.check_string(type);

    var tasks = context.case.tasks();
    var new_tasks = tasks.filter(function(task) {
        if (object_id) {
            return (task.type != type) || (task.object_id != object_id);
        } else {
            return (task.type != type);
        }
    });
    if (tasks.length != new_tasks.length) {
        context.storage.set_property(context.case.tasksProp(), new_tasks);
    }
};

/**
 * File: js/commands/tasks/PushTaskCommand.js
 */
var PushTaskCommand = function() {};

PushTaskCommand.toString = function() {
    return "push_task";
};

PushTaskCommand.prototype.execute = function(new_task) {
    context.system.check_key(new_task, "type");
    context.system.check_key(new_task, "object_id");
    var tasks = context.case.tasks();
    var task_exists = tasks.some(function(task) {
        return (task.type === new_task.type) && (task.object_id === new_task.object_id);
    });

    if (task_exists) {
        throw new LogicError("Такая задача уже существует: " + JSON.stringify(new_task));
    } else {
        context.storage.set_property(context.case.tasksProp(), tasks.concat([new_task]));
        context.events.showTablet();
    }
};

/**
 * File: js/commands/tasks/UpdateTaskCommand.js
 */
var UpdateTaskCommand = function() {};

UpdateTaskCommand.toString = function() {
    return "update_task";
};

UpdateTaskCommand.prototype.execute = function(type, object_id, update_fields) {
    var tasks = context.case.tasks();
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        if (task.type == type && task.object_id == object_id) {
            for (k in update_fields) {
                task[k] = update_fields[k]
            }
            context.storage.set_property(context.case.tasksProp() + "." + i.toString(), task);
            break;
        }
    }
};

/**
 * File: js/commands/triggers/AddCluesCommand.js
 */
var AddCluesCommand = function() { };

AddCluesCommand.toString = function() {
    return "add_clues"
};

AddCluesCommand.prototype.execute = function(args) {
    context.system.check_key(args, "clues");

    var clues = args.clues
    var known_clues = context.case.knownClues();
    clues.forEach(function(clue_id) {
        if (known_clues.indexOf(clue_id) >= 0) {
            throw new LogicError("Примета с таким именем уже известна!\ncase_id: " + context.case.activeCase() + "; clue_id: " + clue_id);
        }
    })
    context.storage.set_property(context.case.knownCluesProp(), known_clues.concat(clues));
};

/**
 * File: js/commands/triggers/AddForensicItemCommand.js
 */
var AddForensicItemCommand = function() {};

AddForensicItemCommand.toString = function() {
    return "add_forensic_item";
};

AddForensicItemCommand.prototype.execute = function(forensic_item_id) {
    context.case.checkForensicItemDefined(forensic_item_id);
    if (context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем уже есть!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }
    var forensic_item_def = context.case.forensicItems(forensic_item_id);
    var initial_state = forensic_item_def.initial_state;
    var forensic_item = { state: initial_state, index: context.case.foundForensicItemsCount() }
    context.storage.set_property(context.case.foundForensicItemsProp(forensic_item_id), forensic_item);

    if (forensic_item_def.states[initial_state].minigame) {
        Executor.run(PushTaskCommand, {type: "examine", object_id: forensic_item_id});
    };
};

/**
 * File: js/commands/triggers/AddLabItemCommand.js
 */
var AddLabItemCommand = function() {};

AddLabItemCommand.toString = function() {
    return "add_lab_item";
};

AddLabItemCommand.prototype.execute = function(lab_item_id) {
    context.case.checkLabItemDefined(lab_item_id);
    if (context.case.isLabItemFound(lab_item_id)) {
        throw new LogicError("Лабораторный предмет с таким именем уже есть!\ncase_id: " + context.case.activeCase() + "; lab_item_id: " + lab_item_id);
    }
    var lab_item = { state: "new", index: context.case.foundLabItemsCount() };
    context.storage.set_property(context.case.foundLabItemsProp(lab_item_id), lab_item);
    Executor.run(PushTaskCommand, {type: "analyze", object_id: lab_item_id});
};

/**
 * File: js/commands/triggers/AddMedalCommand.js
 */
var AddMedalCommand = function() {};

AddMedalCommand.toString = function() {
    return "add_medal"
};

AddMedalCommand.prototype.execute = function(medal_type) {
    var medals = context.case.medals();
    var case_id = context.case.activeCase();
    if (medals.indexOf(medal_type) >= 0) {
        throw new LogicError("Медаль этого типа уже выдана!\ncase_id: " + case_id + "; medal_type: " + medal_type);
    }

    context.storage.set_property(context.case.medalsProp(), medals.concat([medal_type]));
    if (medal_type == "gold" && context.case.status() == "complete") {
        Executor.run(IncludeCaseTasksCommand);
    }

    if (medal_type == "silver") {
        context.track.event("case_walkthrough_time", null, null, case_id, context.case.timeFromOpening(context.last_command_time()));
        for (var scene in context.case.openedScenes()) {
            context.track.event("case_end_stars", null, case_id, scene, context.case.sceneStars(scene));
        }
    }

    context.events.notify("medal_received", medal_type);
};

/**
 * File: js/commands/triggers/AddSuspectCluesCommand.js
 */
var AddSuspectCluesCommand = function() {};

AddSuspectCluesCommand.toString = function() {
    return "add_suspect_clues";
};

AddSuspectCluesCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.system.check_key(args, "clues");

    var suspect_id = args.suspect;
    var clues = args.clues
    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }

    var suspect_def = context.case.suspects(suspect_id);
    var suspect = context.case.knownSuspects(suspect_id);

    clues.forEach(function(clue_id) {
        if (!(clue_id in suspect_def.clues)) {
            throw new LogicError("Попытка добавить несуществующую примету подозреваемого!\ncase_id: " + context.case.activeCase() +
                "; suspect_id: " + suspect_id + "; clue_id: " + clue_id);
        }

        if (suspect.clues.indexOf(clue_id) >= 0) {
            throw new LogicError("Примета уже добавлена для подозреваемого!\ncase_id: " + context.case.activeCase() +
                "; suspect_id: " + suspect_id + "; clue_id: " + clue_id);
        }

        suspect.clues.push(clue_id)
    })

    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + '.clues', suspect.clues);
};

/**
 * File: js/commands/triggers/AddSuspectCommand.js
 */
var AddSuspectCommand = function() {};

AddSuspectCommand.toString = function() {
    return "add_suspect";
};

AddSuspectCommand.prototype.execute = function(suspect_id) {
    context.case.checkSuspectDefined(suspect_id);
    if (context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем уже есть!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }
    var suspect_def = context.case.suspects(suspect_id);
    var suspect = {
        alibi: null,
        motive: null,
        clues: [],
        state: "default",
        talked: false
    };
    context.storage.set_property(context.case.knownSuspectsProp(suspect_id), suspect);
};

/**
 * File: js/commands/triggers/CheckTransitionCommand.js
 */
var CheckTransitionCommand = function() {};

CheckTransitionCommand.toString = function() {
    return "check_transition";
};

CheckTransitionCommand.prototype.execute = function(transition_id) {
    var performed_transitions = context.case.performedTransitions();
    if (performed_transitions.indexOf(transition_id) >= 0) {
        return;
    }

    var transitions = context.case.transitions();
    if (!(transition_id in transitions)) {
        throw new LogicError("Переход с данным идентификатором не существует!\ncase_id: " + context.case.activeCase() + "; transition_id: " + transition_id);
    }

    var transition = transitions[transition_id];
    var preconditions_completed = true;
    transition.preconditions.forEach(function(conditions) {
        if (preconditions_completed == false) return;
        for (var condition_name in conditions) {
            var condition = conditions[condition_name];
            if (typeof condition === 'object') {
                for (var object_id in condition) {
                    var expected_state = condition[object_id];
                    var case_object;
                    if (condition_name === "forensic_item_state") {
                        context.case.checkForensicItemDefined(object_id);
                        case_object = context.case.foundForensicItems(object_id);
                    } else if (condition_name === "lab_item_state") {
                        context.case.checkLabItemDefined(object_id);
                        case_object = context.case.foundLabItems(object_id);
                    } else if (condition_name === "suspect_state" || condition_name === "suspect_state_talked") {
                        context.case.checkSuspectDefined(object_id);
                        case_object = context.case.knownSuspects(object_id);
                    } else if (condition_name === "scene_state") {
                        context.case.checkSceneDefined(object_id);
                        case_object = context.case.openedScenes(object_id);
                    } else {
                        throw new LogicError("Неизвестное условие перехода!\ncase_id: " + context.case.activeCase() + "; transition_id: " + transition_id + "; condition: " + condition_name);
                    }
                    if (!case_object ||
                        (case_object.state != expected_state) ||
                        (condition_name === "suspect_state_talked" && !case_object.talked)) {
                        preconditions_completed = false;
                        return;
                    }
                }
            } else if (typeof condition === 'string') {
                if (condition_name === "custom_task_completed") {
                    preconditions_completed = context.case.isCustomTaskCompleted(condition);
                } else {
                    throw new LogicError("Неизвестное условие перехода!\ncase_id: " + context.case.activeCase() + "; transition_id: " + transition_id + "; condition: " + condition_name);
                }
            }
        }
    });

    if (preconditions_completed) {
        Executor.run(PushTriggersCommand, transition.on_complete);
        context.storage.set_property(context.case.performedTransitionsProp(), performed_transitions.concat([transition_id]));
    }
};

/**
 * File: js/commands/triggers/ExcludeCaseTasksCommand.js
 */
var ExcludeCaseTasksCommand = function() { };

ExcludeCaseTasksCommand.toString = function() {
    return "exclude_case_tasks";
};

ExcludeCaseTasksCommand.prototype.execute = function() {
    if (context.case.starsLeftToGet() == 0) {
        Executor.run(DeleteTasksCommand, "earn_stars", null);
    }

    var stars_left = context.case.starsLeft();
    var boosters = context.defs.get_def("boosters.booster_types");
    if (stars_left == 0) {
        Executor.run(DeleteTasksCommand, "buy_booster", null);
    } else {
        for (var booster_id in boosters) {
            var booster_def = context.defs.get_def("boosters.booster_types." + booster_id);
            if (booster_def.require && stars_left < booster_def.require.star) {
                Executor.run(DeleteTasksCommand, "buy_booster", booster_id);
            }
        }
    }
};

/**
 * File: js/commands/triggers/IncludeCaseTasksCommand.js
 */
var IncludeCaseTasksCommand = function() {};

IncludeCaseTasksCommand.toString = function() {
    return "include_case_tasks";
};

IncludeCaseTasksCommand.prototype.execute = function() {
    var medals = context.case.medals();
    Executor.run(DeleteTasksCommand, "earn_stars", null);
    if (context.case.starsLeftToGet() >= 1) {
        Executor.run(PushTaskCommand, {type: "earn_stars", object_id: "default"});
    }

    var stars_left = context.case.starsLeft();
    var boosters = context.defs.get_def("boosters.booster_types");
    var booster_order = context.defs.get_def("boosters.interface_order");
    Executor.run(DeleteTasksCommand, "buy_booster", null);

    booster_order.forEach(function(booster_id) {
        var booster_def = boosters[booster_id];
        if (booster_def.require) {
            if ((medals.indexOf(booster_def.require.medal) >= 0) && (stars_left >= booster_def.require.star)) {
                Executor.run(PushTaskCommand, {type: "buy_booster", object_id: booster_id});
            }
        }
    });
};

/**
 * File: js/commands/triggers/InitArrestStateCommand.js
 */
var InitArrestStateCommand = function() {};

InitArrestStateCommand.toString = function() {
    return "init_arrest_state";
};

InitArrestStateCommand.prototype.execute = function() {
    for (var suspect_id in context.case.knownSuspects()) {
        context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".state", "arrest");
    }
    Executor.run(DeleteTasksCommand, "talk", null);
    Executor.run(PushTaskCommand, {type: "arrest", object_id: "arrest"});
};

/**
 * File: js/commands/triggers/OpenNewSceneCommand.js
 */
var OpenNewSceneCommand = function() {};

OpenNewSceneCommand.toString = function() {
    return "open_new_scene";
};

OpenNewSceneCommand.prototype.execute = function(scene_id) {
    context.case.checkSceneDefined(scene_id);
    if (context.case.isSceneOpened(scene_id)) {
        throw new LogicError("Сцена с таким именем уже открыта!\ncase_id: " + context.case.activeCase() + "; scene_id: " + scene_id);
    }

    var scene = {
        "stars": 0,
        "score": 0,
        "hog_count": 0,
        "state": "default"
    };

    context.storage.set_property(context.case.openedScenesProp(scene_id), scene);
    context.events.notify("open_scene", scene_id);
};

/**
 * File: js/commands/triggers/ProgressChapterCommand.js
 */
var ProgressChapterCommand = function() {};

ProgressChapterCommand.toString = function() {
    return "progress_chapter";
};

ProgressChapterCommand.prototype.execute = function(step_id) {
    var chapter = context.case.currentChapter();
    var case_id = context.case.activeCase();
    var chapter_def = context.case.chapters(chapter.index);
    if (chapter.completed || chapter.progress >= chapter_def.size) {
        throw new LogicError("Невозможен прогресс по делу, глава завершена.\ncase_id: " + case_id);
    }

    var new_progress = chapter.progress + 1;
    var reward;
    if (new_progress == chapter_def.size) {
        reward = context.case.chapterEndReward();
        context.storage.set_property(context.case.currentChapterProp() + ".completed", true);
        var triggers = chapter_def.on_end || [];

        if (chapter.index == context.case.chapters().length - 1) {
            triggers.push({"add_medal": "silver"})
        }

        if (triggers.length > 0) {
            Executor.run(PushTriggersCommand, triggers);
        }
    } else {
        reward = context.case.chapterProgressReward();
    }
    context.storage.set_property(context.case.currentChapterProp() + ".progress", new_progress);
    Executor.run(ApplyRewardCommand, reward);
    context.track.scenario_progress(case_id, null, 'progress', reward);
    if (step_id) {
        context.track.progress_step(case_id, step_id);
    }

    context.events.notify("progress_chapter", {
        "progress": {
            "from": chapter.progress,
            "to": new_progress,
            "total": chapter_def.size
        },
        reward: reward,
        img: chapter_def.img
    });

};

/**
 * File: js/commands/triggers/RateAppCommand.js
 */
var RateAppCommand = function() { };

RateAppCommand.toString = function() {
    return "rate_app";
};

RateAppCommand.prototype.execute = function() {
    if (context.options.isRateConditionCompleted()) {
        context.events.rateApp();
        context.storage.set_property(context.options.rateTimeProp, context.last_command_time());
    }
};

/**
 * File: js/commands/triggers/RemoveSuspectCommand.js
 */
var RemoveSuspectCommand = function() {};

RemoveSuspectCommand.toString = function() {
    return "remove_suspect";
};

RemoveSuspectCommand.prototype.execute = function(suspect_id) {
    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }
    context.storage.set_property(context.case.knownSuspectsProp(suspect_id), null);
};

/**
 * File: js/commands/triggers/SetForensicItemStateCommand.js
 */
var SetForensicItemStateCommand = function() {};

SetForensicItemStateCommand.toString = function() {
    return "set_forensic_item_state";
};

// Accepts hash: { "forensic_item": "item_1", "state": "state_1" }
SetForensicItemStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "forensic_item");
    context.system.check_key(args, "state");

    var forensic_item_id = args.forensic_item;
    var new_state = args.state;

    context.case.checkForensicItemDefined(forensic_item_id);
    if (!context.case.isForensicItemFound(forensic_item_id)) {
        throw new LogicError("Судебный предмет с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; forensic_item_id: " + forensic_item_id);
    }

    var forensic_item_def = context.case.forensicItems(forensic_item_id);
    if (!(new_state in forensic_item_def.states)) {
        throw new LogicError("Попытка установить неправильный стейт для судебного предмета!\ncase_id: " + context.case.activeCase() +
            "; forensic_item_id: " + forensic_item_id + "; new_state: " + new_state);
    }

    context.storage.set_property(context.case.foundForensicItemsProp(forensic_item_id) + ".state", new_state);

    Executor.run(DeleteTasksCommand, "examine", forensic_item_id);
    if (forensic_item_def.states[new_state].minigame) {
        Executor.run(PushTaskCommand, {type: "examine", object_id: forensic_item_id});
    };
};

/**
 * File: js/commands/triggers/SetInfoStateCommand.js
 */
var SetInfoStateCommand = function() {};

SetInfoStateCommand.toString = function() {
    return "set_info_state";
};

SetInfoStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "type");
    context.system.check_key(args, "state");

    var type = args.type;
    var state = args.state;

    if(["killer", "weapon", "victim"].indexOf(type) < 0) {
        throw new LogicError("Некорректный тип информации!\ncase_id: " + context.case.activeCase() + "; type: " + type);
    }

    context.case.checkInfoStateDefined(type, state);
    context.storage.set_property(context.case.infoProp() + "." + type, state);
};

/**
 * File: js/commands/triggers/SetSceneStateCommand.js
 */
var SetSceneStateCommand = function() {};

SetSceneStateCommand.toString = function() {
    return "set_scene_state";
};

// Accepts hash: { "scene": "scene_1", "state": "state_2" }
SetSceneStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "scene");
    context.system.check_key(args, "state");

    var scene_id = args.scene;
    var new_state = args.state;

    context.case.checkSceneDefined(scene_id);
    if (!context.case.isSceneOpened(scene_id)) {
        throw new LogicError("Сцена с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; scene_id: " + scene_id);
    }

    var scene_def = context.case.scenes(scene_id);
    if (!(new_state in scene_def.states) && new_state != "default") {
        throw new LogicError("Попытка установить неправильный стейт для сцены!\ncase_id: " + context.case.activeCase() +
            "; scene_id: " + scene_id + "; new_state: " + new_state);
    }

    if (new_state != "default") {
        Executor.run(PushTaskCommand, {type: "investigate", object_id: scene_id});
    }

    context.storage.set_property(context.case.openedScenesProp(scene_id) + ".state", new_state);
};

/**
 * File: js/commands/triggers/SetSuspectAlibiCommand.js
 */
var SetSuspectAlibiCommand = function() {};

SetSuspectAlibiCommand.toString = function() {
    return "set_suspect_alibi";
};

SetSuspectAlibiCommand.prototype.execute = function(suspect_id, alibi) {
    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }

    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + '.alibi', alibi);
};

/**
 * File: js/commands/triggers/SetSuspectMotiveCommand.js
 */
var SetSuspectMotiveCommand = function() {};

SetSuspectMotiveCommand.toString = function() {
    return "set_suspect_motive";
};

SetSuspectMotiveCommand.prototype.execute = function(suspect_id, motive) {
    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }

    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + '.motive', motive);
};

/**
 * File: js/commands/triggers/SetSuspectStateCommand.js
 */
var SetSuspectStateCommand = function() {};

SetSuspectStateCommand.toString = function() {
    return "set_suspect_state";
};

// Accepts hash: { "suspect": "suspect_1", "state": "state_1" }
SetSuspectStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    context.system.check_key(args, "state");

    var suspect_id = args.suspect;
    var new_state = args.state;

    context.case.checkSuspectDefined(suspect_id);
    if (!context.case.isSuspectKnown(suspect_id)) {
        throw new LogicError("Подозреваемый с таким именем отсутствует!\ncase_id: " + context.case.activeCase() + "; suspect_id: " + suspect_id);
    }

    var suspect_def = context.case.suspects(suspect_id);
    if (!(new_state in suspect_def.states) && (new_state != "arrest") && (new_state != "default")) {
        throw new LogicError("Попытка установить неправильный стейт для подозреваемого!\ncase_id: " + context.case.activeCase() +
            "; suspect_id: " + suspect_id + "; new_state: " + new_state);
    }

    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".state", new_state);
    context.storage.set_property(context.case.knownSuspectsProp(suspect_id) + ".talked", false);

    if (new_state != "arrest" && context.case.isSuspectClickable(suspect_id)) {
        Executor.run(PushTaskCommand, {type: "talk", object_id: suspect_id});
    } else if (new_state == "default") {
        Executor.run(DeleteTasksCommand, "talk", suspect_id);
    }
};

/**
 * File: js/commands/triggers/ShowDeductionCommand.js
 */
var ShowDeductionCommand = function() {};

ShowDeductionCommand.toString = function() {
    return "show_deductiond";
};

ShowDeductionCommand.prototype.execute = function(deduction_id) {
    if (!context.case.hasDeduction(deduction_id)) {
        throw new LogicError("Дедукция " + deduction_id + " недоступена в деле " + context.case.activeCase());
    }

    context.events.showDeduction(deduction_id, context.case.deductions(deduction_id));
};

/**
 * File: js/commands/triggers/ShowMovieCommand.js
 */
var ShowMovieCommand = function() {};

ShowMovieCommand.toString = function() {
    return "show_movie";
};

ShowMovieCommand.prototype.execute = function(movie_id) {
    context.events.showMovie(movie_id);
};

/**
 * File: js/commands/triggers/StartNextChapterCommand.js
 */
var StartNextChapterCommand = function() {};

StartNextChapterCommand.toString = function() {
    return "start_next_chapter";
};

StartNextChapterCommand.prototype.execute = function() {
    var chapter = context.case.currentChapter();
    var case_id = context.case.activeCase();
    if (!chapter.completed) {
        throw new LogicError("Невозможно начать следующую главу дела, текущая глава не завершена.\ncase_id: " + case_id);
    }
    var new_index = chapter.index + 1;
    var new_chapter_def = context.case.chapters()[new_index];
    if (!new_chapter_def) {
        throw new LogicError("Невозможно начать следующую главу дела, текущая глава является последней.\ncase_id: " + case_id);
    }

    var new_chapter = {
        index: new_index,
        progress: 0,
        completed: false
    };

    context.storage.set_property(context.case.currentChapterProp(), new_chapter);
    Executor.run(PushTriggersCommand, new_chapter_def.on_start);
    var step_id = (new_index + 1) * 100 + "_next_chapter_start"
    context.track.progress_step(case_id, step_id);
    context.events.notify("new_chapter", new_index);
};

/**
 * File: js/commands/triggers/UnlockNewCaseCommand.js
 */
var UnlockNewCaseCommand = function() { };

UnlockNewCaseCommand.toString = function() {
    return "unlock_new_case";
};

UnlockNewCaseCommand.prototype.execute = function(case_id) {
    context.case.checkDefined(case_id);

    var new_cases = context.storage.get_property("new_cases");
    if (new_cases[case_id]) {
        throw new LogicError("Дело уже добавлено в список новых дел!\ncase_id: " + case_id);
    } else if (context.case.isOpened(case_id) || context.case.isUnlocked(case_id)) {
        throw new LogicError("Дело уже открыто!\ncase_id: " + case_id);
    } else {
        context.storage.set_property("new_cases." + case_id, {});
        context.case.setOpeningTime(context.last_command_time());
        context.events.notify("new_case", case_id);
    }
};

/**
 * File: js/commands/triggers/UpdateKillerStateCommand.js
 */
var UpdateKillerStateCommand = function() { };

UpdateKillerStateCommand.toString = function() {
    return "update_killer_state"
};

UpdateKillerStateCommand.prototype.execute = function(args) {
    if (args.clues) { Executor.run(AddCluesCommand, args) }
    context.events.notify("update_suspect_state", {
        text: args.text || "",
        clues: { all: context.case.knownClues(), new: args.clues },
        alibi: { value: false, updated: false },
        motive: { value: true, updated: false }
    });
};

/**
 * File: js/commands/triggers/UpdateSuspectStateCommand.js
 */
var UpdateSuspectStateCommand = function() { };

UpdateSuspectStateCommand.toString = function() {
    return "update_suspect_state"
};

UpdateSuspectStateCommand.prototype.execute = function(args) {
    context.system.check_key(args, "suspect");
    var suspect_id = args.suspect;
    var update_alibi = context.system.is_boolean(args.alibi);
    var update_motive = context.system.is_boolean(args.motive);

    if (args.clues) { Executor.run(AddSuspectCluesCommand, args) }
    if (update_alibi) { Executor.run(SetSuspectAlibiCommand, suspect_id, args.alibi) }
    if (update_motive) { Executor.run(SetSuspectMotiveCommand, suspect_id, args.motive) }

    var suspect = context.case.knownSuspects(suspect_id);
    context.events.notify("update_suspect_state", {
        suspect: args.suspect,
        text: args.text || "",
        clues: { all: suspect.clues, new: args.clues || [] },
        alibi: { value: suspect.alibi, updated: update_alibi },
        motive: { value: suspect.motive, updated: update_motive }
    });
};

/**
 * File: js/core/Context.js
 */
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

/**
 * File: js/core/DataStorage.js
 */
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

/**
 * File: js/core/Executor.js
 */
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

/**
 * File: js/core/LogicError.js
 */
function LogicError(message) {
    this.name = "LogicError";
    this.message = message;
    this.stack = "Logic" + new Error(message).stack;
    this.toString = function () {return this.name + ": " + this.message};
}

LogicError.prototype = new Error();

/**
 * File: js/core/copyObject.js
 */
/**
 * Создать глубокую копию объекта
 */

function copyObject(target) {
    var obj;
    var key;

    if (true === target) return target;
    if (false === target) return target;
    if (null === target) return target;
    if (typeof(target) == "string") return target;
    if (typeof(target) == "undefined") return target;
    if (typeof(target) == "number") return target;

    if (target.constructor == Array) {
        obj = [];
        for (key = 0; key < target.length; key++) {
            obj[key] = copyObject(target[key]);
        }
    } else {
        obj = {};
        for (key in target) {
            obj[key] = copyObject(target[key]);
        }
    }

    return obj;
};

/**
 * File: js/modules/Case.js
 */
function Case() { }

Case.helpers = {
    camelize: function(str, capitalize) {
        var regexp = (capitalize ? /(?:^|[-_])(\w)/g : /(?:[-_])(\w)/g);
        return str.replace(regexp , function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    pluralize: function(str) {
        return str + "s";
    },
    propGenerator: function(case_path, object_type) {
        return function(object_id, case_id) {
            if (object_id === undefined || object_id === null) {
                return case_path + '.' + this.caseSelector(case_id) + '.' + object_type;
            } else {
                return case_path + '.' + this.caseSelector(case_id) + '.' + object_type + '.' + object_id;
            }
        }
    }
};

Case.prototype.caseSelector = function(case_id) {
    return (case_id || this.activeCase());
};

Case.prototype.caseDef = function(case_id) {
    return context.defs.get_def("cases." + this.caseSelector(case_id));
};

Case.prototype.caseState = function(case_id) {
    return context.context.get_property("open_cases." + this.caseSelector(case_id));
};

Case.prototype.openCasesIds = function(case_id) {
    return Object.keys(context.storage.get_property("open_cases"));
};

Case.prototype.isOpened = function(case_id) {
    return context.storage.has_property("open_cases." + case_id);
};

Case.prototype.isNew = function(case_id) {
    return context.storage.has_property("new_cases." + case_id);
};

Case.prototype.isUnlocked = function(case_id) {
    return (context.storage.get_property("unlocked_cases").indexOf(case_id) >= 0);
};

Case.prototype.checkOpened = function(case_id) {
    if (!this.isOpened(case_id)) {
        throw new LogicError("Нет открытого дела с таким идентификатором!\ncase_id: " + case_id);
    }
};

Case.prototype.isDefined = function(case_id) {
    return (case_id in context.defs.get_def("cases"));
}

Case.prototype.checkDefined = function(case_id) {
    if (!this.isDefined(case_id)) {
        throw new LogicError("Неизвестный идентификатор дела!\ncase_id: " + case_id);
    }
};

Case.prototype.activeCaseProp = "immediate_data.active_case";

Case.prototype.checkActiveCase = function() {
    if (!context.storage.has_property(this.activeCaseProp)) {
        throw new LogicError("Активное дело не установлено!");
    }
};

Case.prototype.isActiveCase = function(case_id) {
    if (!context.storage.has_property(this.activeCaseProp)) {
        return false;
    } else {
        return (this.activeCase() === case_id);
    }
};

Case.prototype.activeCase = function() {
    return context.storage.get_property(this.activeCaseProp);
};

Case.prototype.activeSceneProp = "immediate_data.active_scene";

Case.prototype.checkActiveScene = function() {
    if (!context.storage.has_property(this.activeSceneProp)) {
        throw new LogicError("Активная сцена не установлена!");
    }
};

Case.prototype.activeScene = function() {
    return context.storage.get_property(this.activeSceneProp);
};

Case.prototype.activeMinigameProp = "immediate_data.active_minigame";

Case.prototype.checkActiveMinigame = function() {
    if (!context.storage.has_property(this.activeMinigameProp)) {
        throw new LogicError("Активная миниигра не установлена!");
    }
};

Case.prototype.activeMinigame = function() {
    return context.storage.get_property(this.activeMinigameProp);
};

Case.prototype.starsProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".stars";
};

Case.prototype.stars = function(case_id) {
    return context.storage.get_property(this.starsProp(case_id));
};

Case.prototype.setStars = function(value, case_id) {
    return context.storage.set_property(this.starsProp(case_id), value);
};

Case.prototype.sceneStars = function(scene_id) {
    return this.openedScenes(scene_id).stars;
};

Case.prototype.sceneScoreMultiplier = function(scene_id) {
    return this.scenes(scene_id).score_multiplier || 1;
};

Case.prototype.caseScoreMultiplier = function() {
    return this.caseDef().score_multiplier || 1;
};

Case.prototype.sceneStarScores = function(scene_id) {
    var scores_prop = this.scenesProp(scene_id) + ".scores";
    var scores = null
    if (context.defs.has_def(scores_prop)) {
        scores = context.defs.get_def(scores_prop)
    } else {
        scores = context.defs.get_def("hog_settings.star_base_scores");
    }
    return scores;
}

Case.prototype.nextStarSceneScore = function(scene_id) {
    if (this.isSceneOpened(scene_id)) {
        var scene = context.case.openedScenes(scene_id);
        return this.sceneStarScores(scene_id)[scene.stars];
    } else {
        return 0;
    }
};

Case.prototype.checkStarsCount = function(count) {
    if (this.stars() < count) {
        throw new LogicError("Недостаточно звезд в деле!\n" + context.case.activeCase() + ', count: ' + count);
    }
};

Case.prototype.totalStars = function(case_id) {
    var opened_scenes = this.openedScenes(null, case_id);
    var total_stars = 0;
    for (var scene_id in opened_scenes) {
        total_stars += opened_scenes[scene_id].stars
    }
    return total_stars;
};

Case.prototype.starsLimit = function() {
    return context.defs.get_def("case_settings.stars_per_scene");
};

Case.prototype.caseStarsLimit = function(case_id) {
    var scenesProp = context.case.scenesProp(null, case_id)
    if (context.defs.has_def(scenesProp)) {
        return Object.keys(context.case.scenes(null, case_id)).length * this.starsLimit();
    } else {
        return 0;
    }
};

Case.prototype.deductionsProp = Case.helpers.propGenerator("cases", "deductions");

Case.prototype.hasDeduction = function(deduction_id) {
    return context.defs.has_def(this.deductionsProp(deduction_id));
};
Case.prototype.deductions = function(deduction_id) {
    return context.defs.get_def(this.deductionsProp(deduction_id));
};

Case.prototype.medalsProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".medals";
};

Case.prototype.medals = function(case_id) {
    var medalsProp = this.medalsProp(case_id);
    return context.storage.get_property_or_default(medalsProp, []);
};

Case.prototype.transitionsProp = Case.helpers.propGenerator("cases", "transitions");

Case.prototype.transitions = function(transition_id) {
    return context.defs.get_def(this.transitionsProp(transition_id));
};

Case.prototype.performedTransitionsProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".performed_transitions";
};

Case.prototype.performedTransitions = function(case_id) {
    return context.storage.get_property(this.performedTransitionsProp(case_id));
};

Case.prototype.transitions = function(transition_id) {
    return context.defs.get_def(this.transitionsProp(transition_id));
};

Case.prototype.infoProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".info";
};

Case.prototype.info = function(case_id) {
    return context.storage.get_property(this.infoProp(case_id));
};

Case.prototype.triggersProp = function(case_id) {
    return "immediate_data.triggers." + this.caseSelector(case_id);
};

Case.prototype.triggers = function(case_id) {
    var triggersProp = this.triggersProp(case_id);
    if (context.storage.has_property(triggersProp)) {
        return context.storage.get_property(triggersProp);
    } else {
        return [];
    }
};

Case.prototype.checkTriggers = function(case_id) {
    var triggers = this.triggers(case_id);
    if (triggers.length) {
        throw new LogicError("В деле есть невыполненные триггеры, выполните их перед выполением команд");
    }
};

Case.prototype.analyzedItemsProp = function(lab_item_id, case_id) {
    if (lab_item_id) {
        return 'immediate_data.analyzed_items.' + this.caseSelector(case_id) + '.' + lab_item_id;
    } else {
        return 'immediate_data.analyzed_items.' + this.caseSelector(case_id);
    }
};

Case.prototype.analyzedItems = function(lab_item_id, case_id) {
    var analyzed_prop = this.analyzedItemsProp(lab_item_id, case_id);
    if (context.storage.has_property(analyzed_prop)) {
        return context.storage.get_property(analyzed_prop);
    } else {
        return (lab_item_id ? null : {});
    }
};

Case.prototype.arrestData = function(case_id) {
    return context.defs.get_def("cases." + this.caseSelector(case_id) + ".arrest");
};

Case.prototype.arrestCost = function(case_id) {
    var arrest_cost_prop = "cases." + this.caseSelector(case_id) + ".arrest.cost"
    if (context.defs.has_def(arrest_cost_prop)) {
        return context.defs.get_def(arrest_cost_prop);
    } else {
        return context.defs.get_def("case_settings.default_suspect_arrest_cost");
    }
};

Case.prototype.isSuspectClickable = function(suspect_id, case_id) {
    var suspect = this.knownSuspects(suspect_id, case_id);
    if (suspect.state == "arrest") {
        return true;
    } else if (suspect.state == "default") {
        return false;
    } else {
        return !(this.suspects(suspect_id, case_id).states[suspect.state].talkable === false)
    }
}

Case.prototype.suspectClickCost = function(suspect_id, case_id) {
    var suspect = this.knownSuspects(suspect_id, case_id);
    if (suspect.state == "arrest") {
        return this.arrestCost(case_id);
    } else if (suspect.state == "default") {
        return 0;
    } else {
        if (suspect.talked) {
            return 0;
        } else {
            var suspect_state_def = this.suspects(suspect_id, case_id).states[suspect.state];
            if (suspect_state_def.talkable === false) {
                return 0;
            } else {
                var talk_cost = suspect_state_def.talk_cost;
                return ((talk_cost !== undefined) ? parseInt(talk_cost) : context.defs.get_def("case_settings.default_suspect_talk_cost"));
            }
        }
    }
};

Case.prototype.sceneEnergyCost = function(scene_id, case_id) {
    var stars = (this.openedScenes(scene_id, case_id).stars || 0);

    if (stars < this.starsLimit(case_id)) {
        return context.defs.get_def("energy_settings.scene_cost");
    } else {
        return context.defs.get_def("energy_settings.full_scene_cost");
    }
};

Case.prototype.minigameCost = function(forensic_item_id, case_id) {
    var forensic_item_state = this.foundForensicItems(forensic_item_id, case_id).state;
    var minigame_cost_prop = ["cases", this.caseSelector(case_id), "forensic_items", forensic_item_id, "states", forensic_item_state, "minigame.cost"].join('.');
    if (context.defs.has_def(minigame_cost_prop)) {
        return context.defs.get_def(minigame_cost_prop);
    } else {
        return context.defs.get_def("case_settings.default_minigame_cost");
    }
};

Case.prototype.analyzeTime = function(lab_item_id) {
    return context.case.labItems(lab_item_id).analyze_time;
};

Case.prototype.analyzeTimeLeft = function(lab_item_id, time) {
    if (!this.isLabItemFound()) {
        return this.analyzeTime(lab_item_id);
    } else {
        var lab_item = this.foundLabItems(lab_item_id);
        if (lab_item.state === "done") {
            return 0;
        } else {
            var analyzed_item = this.analyzedItems(lab_item_id)
            if (analyzed_item) {
                return Math.max(Math.ceil((analyzed_item.end - time) / 1000), 0);
            } else {
                return this.analyzeTime(lab_item_id)
            }
        }
    }
};

Case.prototype.analyzeSpeedupCost = function(lab_item_id, time) {
    var cash_per_hour = context.defs.get_def("cash_settings.analyze_speedup_base_cash_per_hour");
    var hours_left = this.analyzeTimeLeft(lab_item_id, time) / 3600
    if (hours_left < 1) {
        return Math.ceil(cash_per_hour * hours_left);
    } else {
        return Math.ceil(cash_per_hour * Math.pow(hours_left, 0.6));
    }
}

Case.prototype.tasksProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".tasks";
};

Case.prototype.tasks = function(case_id) {
    return context.storage.get_property(this.tasksProp(case_id));
};

Case.prototype.performedCustomTasksProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".performed_custom_tasks";
};

Case.prototype.isCustomTaskCompleted = function(task_id, case_id) {
    if (this.performedCustomTasks(case_id).indexOf(task_id) >= 0) {
        var task_is_active = this.tasks(case_id).some(function(task) {
            return (task.type === "custom" && task.object_id === task_id);
        });
        return !task_is_active;
    }
    return false;
};

Case.prototype.performedCustomTasks = function(case_id) {
    return context.storage.get_property(this.performedCustomTasksProp(case_id));
};

Case.prototype.customTasksProp = Case.helpers.propGenerator("cases", "custom_tasks");
Case.prototype.customTasks = function(task_id, case_id) {
    return context.defs.get_def(this.customTasksProp(task_id, case_id));
};

Case.prototype.chaptersProp = Case.helpers.propGenerator("cases", "chapters");
Case.prototype.chapters = function(index, case_id) {
    return context.defs.get_def(this.chaptersProp(index, case_id));
};

Case.prototype.currentChapterProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".chapter";
};

Case.prototype.currentChapter = function(case_id) {
    return context.storage.get_property(this.currentChapterProp(case_id));
};

Case.prototype.currentChapterDef = function(case_id) {
    var chapter = this.currentChapter(case_id);
    var chapter_def = this.chapters(chapter.index, case_id);
    return chapter_def
};

Case.prototype.currentChapterText = function(case_id) {
    var chapter = this.currentChapter(case_id);
    var chapter_def = this.chapters(chapter.index, case_id);
    if (chapter_def.description_end && chapter.completed) {
        return chapter_def.description_end;
    } else {
        return chapter_def.description;
    }
}

Case.prototype.starsLeft = function(case_id) {
   return this.caseStarsLimit(case_id) - this.totalStars(case_id) + this.stars(case_id);
}

Case.prototype.starsLeftToGet = function(case_id) {
   return this.caseStarsLimit(case_id) - this.totalStars(case_id);
}

Case.prototype.status = function(case_id) {
    return context.storage.get_property("open_cases." + this.caseSelector(case_id) + ".status");
};

Case.prototype.setStatus = function(status, case_id) {
    context.storage.set_property("open_cases." + this.caseSelector(case_id) + ".status", status);
};

Case.prototype.chapterEndReward = function() {
    return context.defs.get_def("case_settings.chapter_reward.end");
};

Case.prototype.chapterProgressReward = function() {
    return context.defs.get_def("case_settings.chapter_reward.progress");
};

Case.prototype.chapterProgress = function(case_id) {
    var chapter = this.currentChapter(case_id);
    var chapter_def = this.chapters(chapter.index, case_id);
    return Math.round((chapter.progress / chapter_def.size) * 100);
};

Case.prototype.infoStateProp = function(type, state, case_id) {
    context.system.check_string(type);
    if (state === "default") {
        return ["info", "default_states", type].join('.');
    } else {
        return ["cases", this.caseSelector(case_id), "info", type, state].join('.');
    }
};

Case.prototype.checkInfoStateDefined = function(type, state, case_id) {
    if ((state !== "default") && !(context.defs.has_def(this.infoStateProp(type, state, case_id)))) {
        throw new LogicError("Нет такого состояния для информации типа " + type + "! case_id: " + this.caseSelector(case_id) + "; state:" + state);
    }
};

Case.prototype.infoState = function(type, state, case_id) {
    return context.defs.get_def(this.infoStateProp(type, state, case_id));
};

Case.prototype.currentInfoState = function(type, case_id) {
    var currentInfoStateProp = ["open_cases", this.caseSelector(case_id), "info", type].join(".");
    var state = context.storage.get_property(currentInfoStateProp);
    return this.infoState(type, state, case_id);
};

/*
    Method generates case objects accessors - both for defs and player world,
    using Case.prototype.activeCase() value as case identifier, camelizing object names

    Case.generateCaseObjectAccessor("scene", "opened") would generate following methods:

    Case.prototype.scenesProp(scene_id)
    Case.prototype.openedScenesProp(scene_id)
    Case.prototype.openedScenesCount(scene_id)
    Case.prototype.checkSceneDefined(scene_id)
    Case.prototype.scenes(scene_id)
    Case.prototype.openedScenes(scene_id)
    Case.prototype.isSceneOpened(scene_id)

    It would require existing of paths:
    Storage: open_cases.case_id.opened_scenes.scene_id
    Definitions: cases.case_id.scenes.scene_id
*/

Case.generateCaseObjectAccessor = function(def_name, world_prefix) {
    var defNamePluralized = Case.helpers.pluralize(def_name); //def_names
    var defNameCamelized = Case.helpers.camelize(def_name, true); //DefName

    var worldName = world_prefix + "_" + defNamePluralized; // world_prefix_def_names

    // method defNamesProp
    var defPropName = Case.helpers.camelize(defNamePluralized, false) + "Prop";
    Case.prototype[defPropName] = Case.helpers.propGenerator("cases", defNamePluralized);

    // method worldPrefixDefNamesProp
    var worldPropName = Case.helpers.camelize(worldName, false) + "Prop";
    Case.prototype[worldPropName] = Case.helpers.propGenerator("open_cases", worldName);


    // method checkDefNameDefined
    var checkDefNameDefined = "check" + defNameCamelized + "Defined";
    Case.prototype[checkDefNameDefined] = function(object_id, case_id) {
        if (!context.defs.has_def(Case.prototype[defPropName](object_id, case_id))) {
            throw new LogicError("Неизвестный идентификатор объекта для дела!\ncase_id: " + this.activeCase() + "; " + def_name + "_id: " + object_id);
        }
    };

    // method defNames
    var defNames = Case.helpers.camelize(defNamePluralized, false);
    Case.prototype[defNames] = function(object_id, case_id) {
        return context.defs.get_def(Case.prototype[defPropName](object_id, case_id));
    };

    // method worldPrefixDefNames
    var worldPrefixDefNames = Case.helpers.camelize(worldName, false)
    Case.prototype[worldPrefixDefNames] = function(object_id, case_id) {
        var object_prop = Case.prototype[worldPropName](object_id, case_id);
        if (context.storage.has_property(object_prop)) {
            return context.storage.get_property(object_prop);
        } else {
            return {};
        }
    };

    // method worldPrefixDefNamesCount
    var worldCountName = Case.helpers.camelize(worldName, false) + "Count";
    Case.prototype[worldCountName] = function(case_id) {
        return Object.keys(this[worldPrefixDefNames](null, case_id)).length;
    }

    // method isDefNameWorldPrefix
    var worldCheckStateName = "is" + defNameCamelized + Case.helpers.camelize(world_prefix, true);
    Case.prototype[worldCheckStateName] = function(object_id, case_id) {
        return context.storage.has_property(Case.prototype[worldPropName](object_id, case_id));
    };
};

Case.generateCaseObjectAccessor("scene", "opened");
Case.generateCaseObjectAccessor("lab_item", "found");
Case.generateCaseObjectAccessor("forensic_item", "found");
Case.generateCaseObjectAccessor("suspect", "known");

Case.generateCaseObjectAccessor("clue", "known");

// Overriding generated properties, since known_clues is array, not an object
Case.prototype.isClueKnown = function(clue_id, case_id) {
    return (this.knownClues(case_id).indexOf(clue_id) >= 0)
}

Case.prototype.knownCluesProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".known_clues";
}

Case.prototype.knownClues = function(case_id) {
    return context.storage.get_property(this.knownCluesProp(case_id));
}

Case.prototype.sceneOrder = function(case_id) {
    return context.defs.get_def("cases." + this.caseSelector(case_id) + ".scene_order");
};

Case.prototype.sceneCurrentState = function(scene_id) {
    var scene = this.openedScenes(scene_id);
    var scene_def = this.scenes(scene_id);
    return scene_def.states[scene.state];
};

Case.prototype.path = function(relative_path, case_id) {
    return context.defs.get_def("map.descriptions." + this.caseSelector(case_id) + ".path").toString() + "/" + relative_path.toString();
};

Case.prototype.highscoreProp = function(scene_id, case_id) {
    return ["highscores", this.caseSelector(case_id), scene_id].join('.');
};

Case.prototype.highscore = function(scene_id, case_id) {
    var prop = this.highscoreProp(scene_id, case_id);
    return context.storage.get_property_or_default(prop, 0);
};

Case.prototype.forensicItemStateDef = function(forensic_item_id) {
    var state = context.case.foundForensicItems(forensic_item_id).state;
    return context.case.forensicItems(forensic_item_id).states[state];
};

Case.prototype.timeFromOpeningProp = function(case_id) {
    return "case_statistics." + this.caseSelector(case_id) + ".start_time";
};

Case.prototype.timeFromOpening = function(time, case_id) {
    var prop = this.timeFromOpeningProp(case_id);
    var case_start_time = context.storage.get_property_or_default(prop, context.storage.get_property("options.init_time"));
    return Math.ceil((time - case_start_time) / 1000);
};

Case.prototype.setOpeningTime = function(time, case_id) {
    context.storage.set_property(this.timeFromOpeningProp(case_id), time);
};

Case.prototype.hogPlayedCount = function(scene_id, case_id) {
    return this.openedScenes(scene_id, case_id).hog_count;
};

Case.prototype.mistakenArrestsCountProp = function(case_id) {
    return "open_cases." + this.caseSelector(case_id) + ".mistaken_arrests";
};

Case.prototype.mistakenArrestsCount = function(case_id) {
    return context.storage.get_property(this.mistakenArrestsCountProp(case_id));
};

/**
 * File: js/modules/Energy.js
 */
function Energy() { }

Energy.prototype.energyProp = "player.energy.current";
Energy.prototype.incrementProp = "player.energy.increment_time";

Energy.prototype.spend = function(amount, time) {
    amount = parseInt(amount);
    if (amount == 0) return; // не ошибка, но ничего не делаем.

    context.system.check_int_positive(amount, null);
    context.system.check_number_positive(time, 'time');

    var current_energy = context.storage.get_property(this.energyProp);
    var new_energy = current_energy - amount;

    context.system.check_int_positive_or_0(new_energy, 'new_energy');
    context.storage.set_property(this.energyProp, new_energy);

    var energy_max = this.get_max();
    context.system.check_int_positive(energy_max, 'energy_max');

    var incrementTime = context.storage.has_property(this.incrementProp) ?
                            context.storage.get_property(this.incrementProp) : 0;
    if (new_energy < energy_max && (!incrementTime || current_energy >= energy_max)) {
        var interval = this.get_increment_duration();
        context.storage.set_property(this.incrementProp, time + interval * 1000);
    }

    context.events.animate("energy", current_energy, new_energy);
};

Energy.prototype.add = function(amount) {
    amount = parseInt(amount);
    if (amount == 0) return; // не ошибка, но ничего не делаем.

    context.system.check_int_positive(amount, null);

    var energy = parseInt(context.storage.get_property(this.energyProp));
    var new_energy = energy + amount;
    context.storage.set_property(this.energyProp, new_energy);

    if (new_energy >= this.get_max()) {
        if (context.storage.has_property(this.incrementProp)) {
            context.storage.set_property(this.incrementProp, null);
        }
    }

    context.events.animate("energy", energy, new_energy);
};

Energy.prototype.refill = function() {
    var current = this.get();
    var max = this.get_max();
    if (current < max) {
        this.add(max - current);
    }
}

Energy.prototype.get = function() {
    return context.storage.get_property("player.energy.current");
};

Energy.prototype.get_max = function() {
    return context.defs.get_def("energy_settings.max_energy");
};

Energy.prototype.get_increment_duration = function() {
    return context.defs.get_def("energy_settings.energy_restore_time");
};

Energy.prototype.get_increment_time = function(count) {
    if (count == 0 || this.get() + count > this.get_max()) {
        return null;
    } else {
        return context.storage.get_property(this.incrementProp) + (count - 1) * this.get_increment_duration() * 1000;
    }
};

Energy.prototype.get_increment_count = function(time) {
    if (this.get() >= this.get_max()) {
        return 0;
    } else {
        var time_delta = time - context.storage.get_property(this.incrementProp);
        if (time_delta < 0) {
            return 0
        } else {
            return Math.min(1 + Math.floor(time_delta / (this.get_increment_duration() * 1000)), this.get());
        }
    }
};

Energy.prototype.energy_restore_time = function(energy) {
    var delta = (energy == null ? this.get_max() : energy) - this.get();
    if (delta < 0) {
        return null;
    } else {
        return this.get_increment_time(delta);
    }
};

/**
 * File: js/modules/Events.js
 */
var Events = function() {};

Events.prototype.openScreen = function(screen_id) {
    context.storage.set_event("open_screen", {"screen_id": screen_id});
};

Events.prototype.animate = function(type, old_value, new_value) {
    context.storage.set_event("animate", {
        "type": type,
        "old_value": old_value,
        "new_value": new_value
    });
};

Events.prototype.notify = function(type, value) {
    context.storage.set_event("show_notify", {
        "type": type,
        "value": value
    });
};

Events.prototype.showMovie = function(value) {
    context.storage.set_event("show_movie", {
        "movie_id": value
    });
};

Events.prototype.showDeduction = function(value, params) {
    context.storage.set_event("show_deduction", {
        "deduction_id": value,
        "params": params
    });
};

Events.prototype.rateApp = function() {
    context.storage.set_event("rate_app", null);
};

Events.prototype.showTablet = function() {
    context.storage.set_event("show_tablet", null);
};


Events.prototype.arrest = function(suspect_id) {
    context.storage.set_event("arrest", suspect_id);
};

Events.prototype.trackEvent = function(event) {
    context.storage.set_event("track", {
        type: "custom",
        event: event
    });
};

Events.prototype.trackRevenue = function(event) {
    context.storage.set_event("track", {
        type: "mtu",
        event: event
    });
};

Events.prototype.trackAdxEvent = function(event) {
    context.storage.set_event("adx_track", event);
};

/**
 * File: js/modules/Hog.js
 */
function Hog() {}

Hog.prototype.getFindItemsCount = function(scene_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var hog_settings = context.defs.get_def("hog_settings");

    if (scene_type == "hogTime") {
        return 60;
    } else if (scene_type in hog_settings.ItemsToFind) {
        return hog_settings.ItemsToFind[scene_type][context.case.openedScenes(scene_id).stars];
    } else {
        throw new LogicError("Неизвестный тип сцены!");
    }
};

Hog.prototype.getPuzzleGridSize = function(scene_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var hog_settings = context.defs.get_def("hog_settings");
    if (scene_type == "puzzle") {
        return hog_settings.PuzzleGridSize[context.case.openedScenes(scene_id).stars];
    } else return {width: 0, height: 0};
};

Hog.prototype.getTimeLimit = function(scene_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var hog_settings = context.defs.get_def("hog_settings");
    if (scene_type == "hogTime") {
        return hog_settings.TimeLimit[scene_type][context.case.openedScenes(scene_id).stars];
    } else if (this.isValidSceneType(scene_type)) {
        return 0;
    } else {
        throw new LogicError("Неизвестный тип сцены!");
    }
};

Hog.prototype.boosterSupported = function(scene_id, booster_id) {
    var scene_type = context.case.scenes(scene_id).type;
    var def = context.defs.get_def("boosters.booster_types." + booster_id + ".unsupported");
    return def ? def.indexOf(scene_type) == -1 : true;
};

Hog.prototype.isValidSceneType = function(scene_type) {
    return ["hog", "hogTime", "hogDiff", "puzzle"].indexOf(scene_type) >= 0;
};

Hog.prototype.sceneMaxScore = function(scene_id) {
    var hog_settings = context.defs.get_def("hog_settings");
    var type = context.case.scenes(scene_id).type;
    if (this.isValidSceneType(type)) {
        return this.getFindItemsCount(scene_id) * hog_settings.ScoreForMult[type][context.defs.get_def("hog_settings.ScoresComboMultiplierMax")-1] + hog_settings.TimeMaxBonus + hog_settings.ScorePerHint * hog_settings.HintMaxCount;
    } else {
        throw new LogicError("Неивзестный тип сцены!");
    }
};

Hog.prototype.calcExp = function() {
    return context.defs.get_def("hog_settings").ExpAward[context.case.openedScenes(context.case.activeScene().scene_id).stars];
};

Hog.prototype.calcCoins = function(score) {
    return Math.floor(score / 10000);
};

/**
 * File: js/modules/InitModules.js
 */
var InitModules = function() {
    context.player = new Player();
    context.system = new System();
    context.random = new Random();
    context.utils = new Utils();
    context.options = new Options();
    context.energy = new Energy();
    context.defs = new DefGenerator(definitions, {});
    context.case = new Case();
    context.hog = new Hog();
    context.tasks = new Tasks();
    context.partners = new Partners();
    context.events = new Events();
    context.track = new Track();
};

/**
 * File: js/modules/Options.js
 */
function Options() { }

Options.prototype.rateTimeProp = "options.rate.time";
Options.prototype.rateTime = function() {
    return context.storage.get_property_or_default(this.rateTimeProp, 0);
};

Options.prototype.lastDayStart = function() {
    return context.storage.get_property_or_default("options.last_day_start", 0);
};

Options.prototype.isRatedToday = function() {
    return (this.rateTime() >= this.lastDayStart());
};

Options.prototype.isRateConditionCompleted = function() {
    return context.player.get_level() >= 6
        && context.case.isOpened("case_02")
        && !this.isRatedToday();
};

/**
 * File: js/modules/Partners.js
 */
function Partners() { };

Partners.prototype.partnerProp = function(partner_id, fake) {
    if (fake) {
        return (partner_id ? "fake_partners." + partner_id : "fake_partners");
    } else {
        return (partner_id ? "partners." + partner_id : "partners");
    }
};

Partners.prototype.partner = function(partner_id, is_fake) {
    return context.storage.get_property(this.partnerProp(partner_id, is_fake));
};

Partners.prototype.hasPartner = function(partner_id, is_fake) {
    return context.storage.has_property(this.partnerProp(partner_id, is_fake));
};

Partners.prototype.invitePartner = function(partner_id, time) {
    if (context.storage.get_property("player.social_id") == partner_id) {
        throw new LogicError("Нельзя добавить себя в партнеры\npartner_id: " + partner_id);
    }

    if (this.hasPartner(partner_id)) {
        throw new LogicError("Игрок с указаным идентификатором уже является партнером\npartner_id: " + partner_id);
    } else {
        context.storage.set_property(this.partnerProp(partner_id), {
            ready_time: time,
            unlocks: {}
        });
    }
};

Partners.prototype.deletePartner = function(partner_id, time) {
    if (context.storage.get_property("player.social_id") == partner_id) {
        throw new LogicError("Нельзя удалить себя из партнеров\npartner_id: " + partner_id);
    }

    if (this.hasPartner(partner_id)) {
        this.deleteUsedRequestsByPartner(partner_id);
        context.storage.set_property(this.partnerProp(partner_id), null);
    } else {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }
};

Partners.prototype.resetTime = function(partner_id, is_fake) {
    if (is_fake) {
        return this.fakePartner(partner_id).reset_time;
    } else {
        return context.defs.get_def("partner_settings").reset_time;
    }
}

Partners.prototype.usePartner = function(partner_id, time) {
    var is_fake = this.isFake(partner_id);
    if (is_fake || this.hasPartner(partner_id)) {
        var ready_time_prop = this.partnerProp(partner_id, is_fake) + ".ready_time";
        var use_time_prop = this.partnerProp(partner_id, is_fake) + ".use_time";

        var ready_time = 0;
        if (context.storage.has_property(ready_time_prop)) {
            ready_time = context.storage.get_property(ready_time_prop);
        }
        if (ready_time > time) {
            throw new LogicError("Использовать партнера еще нельзя\npartner_id: " + partner_id + "; " + time + " < " + ready_time);
        }

        context.storage.set_property(ready_time_prop, time + this.resetTime(partner_id, is_fake) * 1000);
        context.storage.set_property(use_time_prop, time);
    } else {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }
};

Partners.prototype.calculateResetCost = function(seconds) {
    return Math.ceil(seconds / context.defs.get_def("partner_settings.reset_partner_seconds_per_cash"));
};

Partners.prototype.resetPartner = function(partner_id, time) {
    var is_fake = this.isFake(partner_id);
    if (this.hasPartner(partner_id, is_fake)) {
        var ready_time_prop = this.partnerProp(partner_id, is_fake) + ".ready_time";
        var delta_time = context.storage.get_property(ready_time_prop) - time;
        if (delta_time > 0) {
            var reset_cost = this.calculateResetCost(delta_time / 1000)
            context.player.reduce_real_balance(reset_cost);
            context.storage.set_property(ready_time_prop, time);
            context.track.speedup("partner_reset", {real_balance: reset_cost});
        }
    } else {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }
};

Partners.prototype.unlockRequestsProp = function(case_id) {
    return "new_cases." + case_id + ".unlock_requests";
};

Partners.prototype.unlockRequests = function(case_id) {
    var prop = this.unlockRequestsProp(case_id);
    if (context.storage.has_property(prop)) {
        return context.storage.get_property(prop);
    } else {
        return [];
    }
};

Partners.prototype.usePartnerUnlockRequest = function(partner_id, case_id) {
    context.case.checkDefined(case_id);

    if (!this.hasPartner(partner_id)) {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }

    if (!context.case.isNew(case_id)) { return; }

    var unlock_requests_prop = this.unlockRequestsProp(case_id);
    var unlock_requests = this.unlockRequests(case_id);
    if (unlock_requests.indexOf(partner_id) >= 0) {
        throw new LogicError("Реквест на открытие дела от игрока уже принят\npartner_id: " + partner_id + " case_id: " + case_id);
    } else {
        if (this.isFake(partner_id)) {
            throw new LogicError("Невозможно использовать запрос от фейкового партнера\npartner_id: " + partner_id + " case_id: " + case_id);
        } else {
            unlock_requests.push(partner_id);
            context.storage.set_property(unlock_requests_prop, unlock_requests);
        }
    }
};

Partners.prototype.leftUnlockRequest = function(case_id) {
    return this.requiredUnlockRequests(case_id) - this.unlockRequests(case_id).length;
};

Partners.prototype.unlockRequestCost = function(case_id) {
    var left_requests = this.leftUnlockRequest(case_id);
    if (left_requests > 0) {
        return {
            real_balance: left_requests * context.defs.get_def("partner_settings.unlock_cost_per_request")
        };
    } else {
        return {};
    }
};

Partners.prototype.requiredUnlockRequests = function(case_id) {
    return context.defs.get_def("partner_settings.unlock_requests_required");
};

Partners.prototype.unsendUnlockRequestPartners = function(case_id, time) {
    var res = [];
    var unlock_interval = context.defs.get_def("partner_settings.unlock_repeat_interval") * 1000;
    var partners = this.partner();
    var requests = this.unlockRequests(case_id);
    for (var partner_id in partners) {
        var case_unlock = partners[partner_id].unlocks[case_id];
        if ((!case_unlock || case_unlock + unlock_interval < time) && requests.indexOf(partner_id) < 0) {
            res.push(partner_id);
        }
    }
    return res;
};

Partners.prototype.partnerUnlocksProp = function(partner_id, case_id) {
    return this.partnerProp(partner_id) + ".unlocks." + case_id;
};

Partners.prototype.hasUnsendUnlockRequests = function(case_id, time) {
    return this.unsendUnlockRequestPartners(case_id, time).length > 0;
};

Partners.prototype.broadcastUnlockRequests = function(case_id, time) {
    var self = this;
    this.unsendUnlockRequestPartners(case_id, time).map(function(partner_id) {
        Executor.run(SendUnlockRequestCommand, partner_id, time, case_id, true);
        context.storage.set_property(self.partnerUnlocksProp(partner_id, case_id), time);
    });
};

Partners.prototype.cleanupUnlockRequests = function(case_id) {
    var partners = this.partner();
    var requests = this.unlockRequests(case_id);
    for (var partner_id in partners) {
        if (partners[partner_id].unlocks[case_id]) {
            context.storage.set_property(this.partnerUnlocksProp(partner_id, case_id), null);
        }
    }
};

Partners.prototype.deleteUsedRequestsByPartner = function(partner_id) {
    var new_cases = context.storage.get_property("new_cases");
    for (var case_id in new_cases) {
        var unlock_requests = this.unlockRequests(case_id);
        var unlock_requests_index = unlock_requests.indexOf(partner_id);
        if (unlock_requests_index >= 0) {
            unlock_requests.splice(unlock_requests_index, 1);
            context.storage.set_property(this.unlockRequestsProp(case_id), unlock_requests);
        };
    }
};

Partners.prototype.fakePartnerProp = function(fake_partner_id) {
    return (fake_partner_id ? "partner_fakes.partners." + fake_partner_id : "partner_fakes.partners");
};

Partners.prototype.fakePartner = function(fake_partner_id) {
    return context.defs.get_def(this.fakePartnerProp(fake_partner_id));
};

Partners.prototype.isFake = function(partner_id) {
    return context.defs.has_def(this.fakePartnerProp(partner_id));
};

/**
 * File: js/modules/Player.js
 */
var Player = function() {}


Player.prototype.add_xp = function(value) {
    if (value == 0 || value == null || value == undefined) return;
    context.system.check_int_positive(value, 'value');
    this.set_xp(context.storage.get_property("player.exp") + value);
};

Player.prototype.set_xp = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive_or_0(number, 'Опыт игрока');
    context.storage.set_property("player.exp", number);
};

Player.prototype.get_xp = function() {
    return context.storage.get_property("player.exp");
};

Player.prototype.get_level = function() {
    return context.storage.get_property("player.level");
};

Player.prototype.set_level = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive(number, 'Уровень игрока');
    context.storage.set_property("player.level", number);
};

Player.prototype.get_game_balance = function() {
    return context.storage.get_property("player.game_balance");
};

Player.prototype.set_game_balance = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive_or_0(number, 'Игровые монеты');
    context.storage.set_property("player.game_balance", number);
};

Player.prototype.add_game_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_game_balance(this.get_game_balance() + value);
};

Player.prototype.reduce_game_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_game_balance(this.get_game_balance() - value);
};

Player.prototype.get_real_balance = function() {
    return context.storage.get_property("player.real_balance");
};

Player.prototype.set_real_balance = function(value) {
    var number = parseInt(value);
    context.system.check_int_positive_or_0(number, 'Игровые деньги');
    context.storage.set_property("player.real_balance", number);
};

Player.prototype.add_real_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_real_balance(this.get_real_balance() + value);
};

Player.prototype.reduce_real_balance = function(value) {
    if (value == 0) return; // не ошибка, но и ничего не делаем
    context.system.check_int_positive(value);
    this.set_real_balance(this.get_real_balance() - value);
};

Player.prototype.reduce_balance = function(value) {
    if (value.real_balance) { this.reduce_real_balance(value.real_balance) }
    if (value.game_balance) { this.reduce_game_balance(value.game_balance) }
}

Player.prototype.set_user_data = function(data) {
    context.storage.set_property("player.userData", data);
};

Player.prototype.get_user_data = function() {
    return context.storage.get_property("player.userData");
};

Player.prototype.set_gender = function(value) {
    if(value != "male" && value != "female")
        throw new Error("С сервера пришел невалидный player.gender == " + value + ", может быть либо male либо female.");
    context.storage.set_property("player.gender", value);
};

Player.prototype.get_social_id = function() {
    return context.storage.get_property("player.social_id");
};

Player.prototype.get_game_balance_limit = function() {
    return context.qa_manager.handle("get_limit", {type_id: "game_balance"});
};

Player.prototype.get_booster_count = function(booster_type) {
    var booster_property = "player.boosters." + booster_type;
    if (context.storage.has_property(booster_property)) {
        return context.storage.get_property(booster_property);
    } else {
        return 0;
    }
};

Player.prototype.set_booster_count = function(booster_type, count) {
    var booster_property = "player.boosters." + booster_type;
    context.system.check_int_positive_or_0(count, 'Количество бустеров');
    context.storage.set_property(booster_property, count);
};

Player.prototype.itemsProp = function(item_type) {
    return (item_type ? "player.inventory." + item_type : "player.inventory");
}

Player.prototype.get_item_count = function(item_type) {
    var items_prop = this.itemsProp(item_type);
    if (context.storage.has_property(items_prop)) {
        return context.storage.get_property(items_prop);
    } else {
        return 0;
    }
};

Player.prototype.set_item_count = function(item_type, count) {
    var items_prop = this.itemsProp(item_type);
    context.system.check_int_positive_or_0(count, 'Количество предмета');
    if (count === 0) {
        context.storage.set_property(items_prop, null);
    } else {
        context.storage.set_property(items_prop, count);
    }
};

/**
 * File: js/modules/Random.js
 */
var Random = function()
{
    /**
     * Получает случайное число от 0 до 1 (синхронизированно с сервером)
     */
    this.get_random = function() {
        var data = this.generate_from_seed(context.storage.get_property("options.random_seed"));
        context.storage.set_property("options.random_seed", data.next_seed);
        return data.result;
    };

    /**
     * Генерирует число от 0 до 1 на основе переданного сида и следующий сид.
     * Возвращает объект в формате {result: <число>, next_seed: <следующий сид>}
     *
     * @param seed сид для генерации
     */
    this.generate_from_seed = function(seed)
    {
        var next_seed = (seed * 9301 + 49297) % 233280;
        var result = next_seed / 233280.0;
        return {result: result, next_seed: next_seed};
    };
}

/**
 * File: js/modules/Tasks.js
 */
function Tasks() { }

Tasks.descriptors = {
    examine: new function() {
        this.handle = function(task) {
            context.events.openScreen("forensic_screen");
        };
        this.displayedCost = function(task) {
            return { star: context.case.minigameCost(task.object_id)};
        };
        this.tabletImg = function(task) {
            var forensic_item_def = context.case.forensicItems(task.object_id);
            var forensic_item = context.case.foundForensicItems(task.object_id);

            return forensic_item_def.states[forensic_item.state].img;
        };
        this.tabletTargetText = function(task, time) {
            var forensic_item_def = context.case.forensicItems(task.object_id);
            var forensic_item = context.case.foundForensicItems(task.object_id);

            return  forensic_item_def.states[forensic_item.state].target_text || forensic_item_def.target_text || forensic_item_def.name;
        };
    },
    investigate: new function() {
        this.handle = function(task) {
            context.events.openScreen("scene_screen");
        };
        this.displayedCost = function(task) {
            return { energy: context.case.sceneEnergyCost(task.object_id)};
        };
        this.tabletImg = function(task) {
            return context.case.scenes(task.object_id).img;
        };
        this.tabletTargetText = function(task, time) {
            var obj = context.case.scenes(task.object_id);
            return obj.target_text || obj.name;
        };
    },
    analyze: new function() {
        this.handle = function(task) {
            context.events.openScreen("lab_screen");
        };
        this.displayedCost = function(task, time) {
            var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
            if (lab_item_state == "analyzing") {
                return { real_balance: context.case.analyzeSpeedupCost(task.object_id, time)};
            } else if (lab_item_state == "analyzed") {
                return { };
            } else {
                return { time: context.case.analyzeTimeLeft(task.object_id, time)};
            }
        };
        this.tabletImg = function(task) {
            return context.case.labItems(task.object_id).img;
        };
        this.tabletTargetText = function(task, time) {
            var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
            if (lab_item_state == "analyzed") {
                return context.defs.get_def("tasks.analyze.target_text");
            } else {
                var obj = context.case.labItems(task.object_id);
                return obj.target_text || obj.name;
            }
        };
        this.actionText = function(task, time) {
            var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
            if (lab_item_state == "analyzed") {
                return context.defs.get_def("tasks.analyze.analyzed_action_text");
            } else {
                return context.defs.get_def("tasks.analyze.action_text");
            }
        };

    },
    talk: new function() {
        this.handle = function(task) {
            context.events.openScreen("suspect_screen");
        };
        this.displayedCost = function(task) {
            return { star: context.case.suspectClickCost(task.object_id)};
        };
        this.tabletImg = function(task) {
            var suspect = context.case.knownSuspects(task.object_id);
            var portrait = SuspectStatePropertyQA.handle(task.object_id, suspect.state, "portrait");
            return portrait || SuspectStatePropertyQA.handle(task.object_id, suspect.state, "img");
        };
        this.actionText = function(task) {
            var suspect = context.case.knownSuspects(task.object_id);
            var custom_action_text = SuspectStatePropertyQA.handle(task.object_id, suspect.state, "action_text");
            return custom_action_text || context.defs.get_def("tasks.talk.action_text");
        };
        this.tabletTargetText = function(task, time) {
            var suspect = context.case.knownSuspects(task.object_id);
            var target_text = SuspectStatePropertyQA.handle(task.object_id, suspect.state, "target_text");
            target_text = target_text || SuspectStatePropertyQA.handle(task.object_id, suspect.state, "name");
            return target_text;
        };
    },
    arrest: new function() {
        this.handle = function(task) {
            context.events.openScreen("suspect_screen");
        };
        this.displayedCost = function(task) {
            return { star: context.case.arrestCost()};
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks.arrest.tablet_img");
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks.arrest.target_text");
        };
    },
    start_next_chapter: new function() {
        this.handle = function(task) {
            var cost = this.displayedCost(task);
            Executor.run(ConsumeStarCommand, cost.star);
            Executor.run(StartNextChapterCommand);
            Executor.run(DeleteTasksCommand, task.type, task.object_id);
        };
        this.displayedCost = function(task) {
            return { star: task.cost };
        };
        this.defaultCost = function() {
            return context.defs.get_def("tasks.start_next_chapter.default_cost");
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks.start_next_chapter.default_img");
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks.start_next_chapter.target_text");
        };
    },
    unlock_new_case: new function() {
        this.handle = function(task) {
            var cost = this.displayedCost(task);
            Executor.run(ConsumeStarCommand, cost.star);
            Executor.run(UnlockNewCaseCommand, task.object_id);
            Executor.run(DeleteTasksCommand, task.type, task.object_id);
            Executor.run(PushTriggersCommand, task.triggers);
            Executor.run(EndCaseCommand);
        };
        this.displayedCost = function(task) {
            return { star: task.cost };
        };
        this.defaultCost = function() {
            return context.defs.get_def("tasks.unlock_new_case.default_cost");
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks.unlock_new_case.default_img");
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks.unlock_new_case.target_text");
        };
    },
    buy_booster: new function() {
        this.handle = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            if (context.case.stars() >= item.require.star) {
                Executor.run(AddBoosterCommand, {"booster_type": task.object_id, "count": item.pack_size});
                Executor.run(ConsumeStarCommand, item.require.star);
                Executor.run(ExcludeCaseTasksCommand);
            }
        };
        this.displayedCost = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return { star: item.require.star };
        };
        this.actionText = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return item.tablet_name;
        };
        this.tabletImg = function(task) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return item.img;
        };
        this.tabletTargetText = function(task, time) {
            var item = context.defs.get_def("boosters.booster_types." + task.object_id);
            return item.tablet_description;
        };
    },
    earn_stars: new function() {
        this.handle = function(task) {
            context.events.openScreen("scene_screen");
        };
        this.displayedCost = function() {
            return {};
        };
        this.tabletImg = function(task) {
            return context.defs.get_def("tasks." + task.type).tablet_img;
        };
        this.tabletTargetText = function(task, time) {
            return context.defs.get_def("tasks." + task.type + ".target_text");
        };
    },
    custom: new function() {
        this.handle = function(task) {
            var cost = this.displayedCost(task);
            Executor.run(ConsumeStarCommand, cost.star);
            Executor.run(PushTriggersCommand, task.on_click);
            Executor.run(DeleteTasksCommand, task.type, task.object_id);
        };
        this.displayedCost = function(task) {
            return { star: task.cost };
        };
        this.tabletImg = function(task) {
            return task.img;
        };
        this.tabletTargetText = function(task, time) {
            return task.target_text
        };
    }
};

Tasks.prototype.tabletImg = function(task) {
    if (task.tablet_img) {
        return task.tablet_img;
    } else {
        return Tasks.descriptors[task.type].tabletImg(task);
    };
};

Tasks.prototype.tabletActionText = function(task, time) {
    if (task.action_text) {
        return task.action_text;
    } else if (typeof Tasks.descriptors[task.type].actionText === 'function') {
        return Tasks.descriptors[task.type].actionText(task, time);
    } else {
        return context.defs.get_def("tasks." + task.type + ".action_text");
    }
};

Tasks.prototype.tabletTargetText = function(task, time) {
    return Tasks.descriptors[task.type].tabletTargetText(task, time);
};

Tasks.prototype.tabletImageTip = function(task, time) {
    if (task.type == "analyze") {
        if (context.qa_manager.handle("lab_item_state", task.object_id, time) == "analyzing") {
            return context.qa_manager.handle("lab_item_remaining_time_text", task.object_id, time)
        }
    }
    return "";
};

Tasks.prototype.tabletCompleteness = function(task, time) {
    if (task.type == "analyze") {
        if (context.qa_manager.handle("lab_item_state", task.object_id, time) == "analyzing") {
            return context.qa_manager.handle("lab_item_progress", task.object_id, time);
        }
    }
    return 1;
};

Tasks.prototype.defaultImg = function(type) {
    return Tasks.descriptors[type].defaultImg();
};

Tasks.prototype.handle = function(task) {
    return Tasks.descriptors[task.type].handle(task);
};

Tasks.prototype.displayedCost = function(task, time) {
    var handler = Tasks.descriptors[task.type];
    if (handler.displayedCost) {
        return handler.displayedCost(task, time);
    } else {
        return {};
    }
};

Tasks.prototype.defaultCost = function(type) {
    var handler = Tasks.descriptors[type];
    if (handler.defaultCost) {
        return handler.defaultCost();
    } else {
        return 0;
    }
};

Tasks.prototype.costText = function(task, time) {
    if (task.type == "analyze") {
        var lab_item_state = context.qa_manager.handle("lab_item_state", task.object_id, time);
        if (lab_item_state == "analyzed") {
            return context.defs.get_def("interface.tablet.cost_text.lab_analyzed");
        } else if (lab_item_state == "analyzing") {
            return context.defs.get_def("interface.tablet.cost_text.lab_speedup");
        } else {
            return context.defs.get_def("interface.tablet.cost_text.cost");
        }
    } else if (task.type == "earn_stars") {
        return "";
    } else {
        return context.defs.get_def("interface.tablet.cost_text.cost")
    }
};

/**
 * File: js/modules/Track.js
 */
var Track = function() {};

// Implement currying function, makes things easier
Track.curry = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        fn.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
};

Track.object_tracker = function(property_to_event_map, s2, s3, name, object) {
    if (arguments.length < 5) {
        throw new Error("Генератор получил не все параметры. Текущее значение: " + JSON.stringify(arguments, null, 2));
    }
    for (var property in property_to_event_map) {
        if (object[property]) {
            context.events.trackEvent({
                st1: property_to_event_map[property],
                st2: s2,
                st3: s3,
                name: name.toString(),
                v: object[property]
            });
        }
    }
};

Track.real_ang_game_balance_spend = Track.curry(Track.object_tracker, {
    "real_balance": "real_spend",
    "game_balance": "gold_spend"
});

Track.prototype.buy_pack = Track.curry(Track.real_ang_game_balance_spend, "resourse_shortage", "energy");
Track.prototype.buy_booster = Track.curry(Track.real_ang_game_balance_spend, "resourse_shortage", "booster");

Track.prototype.speedup = Track.curry(Track.real_ang_game_balance_spend, "speedup", null);
Track.prototype.testimonials = Track.curry(Track.real_ang_game_balance_spend, "testimonials", null);

Track.reward_gain = Track.curry(Track.object_tracker, {
    "real_balance": "real_gain",
    "game_balance": "gold_gain",
    "xp": "exp_gain"
});

Track.prototype.scene_end = Track.reward_gain;
Track.prototype.scenario_progress = Track.reward_gain;
Track.prototype.levelup = Track.curry(Track.reward_gain, 'level_up', null);
Track.prototype.in_app = Track.curry(Track.reward_gain, 'inapp', null);


Track.prototype.event = function(st1, st2, st3, name, value) {
    context.events.trackEvent({
        st1: st1,
        st2: st2,
        st3: st3,
        name: name.toString(),
        v: Math.ceil(value)
    });
};

Track.prototype.revenue = function(store, name, revenue) {
    var cents = Math.round(parseFloat(revenue) * 100);
    context.events.trackRevenue({
        tu: "direct",
        st1: store,
        st2: name.toString(),
        st3: null,
        data: null,
        v: cents
    });
    context.events.trackAdxEvent({
        type: "Sale",
        data: revenue.toString(),
        currency: "USD",
        customData: name.toString()
    });
};

Track.prototype.progress_step = function(case_id, step_id) {
    this.event('progress', case_id, null, step_id, 1);
};

Track.prototype.adx_event = function(type, data) {
    context.events.trackAdxEvent({type: type, data: data.toString()});
};

/**
 * File: js/qa/ActiveSceneInfoQA.js
 */
var ActiveSceneInfoQA = {};

ActiveSceneInfoQA.handle = function() {
    var hog_settings = context.defs.get_def("hog_settings");
    var scene_id = context.case.activeScene().scene_id;
    var scene_type = context.case.scenes(scene_id).type;
    var grid_def = context.hog.getPuzzleGridSize(scene_id);

    var res = {
        ScoreForMult: hog_settings.ScoreForMult[scene_type],
        timeLimit: context.hog.getTimeLimit(scene_id),
        itemCount: context.hog.getFindItemsCount(scene_id),
        gridWidth: grid_def.width,
        gridHeight: grid_def.height,
        starScores: context.case.sceneStarScores(scene_id)
    };

    [
        "ScoresComboMultiplierMin",
        "ScoresComboMultiplierMax",
        "ScoresComboMultiplierFadeTime",
        "ScoresComboMultiplierIncrement",
        "HogMissClickPenalityTime",
        "HogMissClickPenalityCount",
        "HogMissClickPenality",
        "HogHintReloadTime",
        "HogHintReloadCount",
        "TimeMaxBonus",
        "ScorePerHint",
        "HintMaxCount"
    ].forEach(function(element) {
        res[element] = hog_settings[element];
    });

    return res;
};

/**
 * File: js/qa/ActiveSceneItemCountQA.js
 */
var ActiveSceneItemCountQA = {};

ActiveSceneItemCountQA.handle = function() {
    return context.hog.getFindItemsCount(context.case.activeScene().scene_id);
};

/**
 * File: js/qa/ActiveSceneItemInfoListQA.js
 */
var ActiveSceneItemInfoListQA = {};

ActiveSceneItemInfoListQA.handle = function() {
    var active_scene = context.case.activeScene();
    var scene_id = active_scene.scene_id;
    var scene_items = context.case.sceneCurrentState(scene_id).items || [];
    var item_list = context.case.scenes(scene_id).items;
    var res = []
    for (var item_id in item_list) {
        var item = item_list[item_id]
        res.push({
            visible: (scene_items.indexOf(item_id) >= 0),
            text: item.name,
            layer: item.layer,
            linkedLayer: item.linked_layer || "",
            imagePath: item.img
        });
    }
    return res;
};

/**
 * File: js/qa/AvailableActionInfoListQA.js
 */
var AvailableActionInfoListQA = {};

AvailableActionInfoListQA.map_task_names = function(type) {
    if (type == "talk" || type == "arrest") {
        return "eToSuspects";
    } else if (type == "investigate") {
        return "eStartScene";
    } else if (type == "earn_stars") {
        return "eToScenes";
    } else if (type == "analyze") {
        return "eToLab";
    } else if (type == "examine") {
        return "eToClues";
    } else {
        return "eCustom";
    }
};

AvailableActionInfoListQA.handle = function(time) {
    return context.case.tasks().map(function(task, index) {
        return {
            type: AvailableActionInfoListQA.map_task_names(task.type),
            cost: QAHelper.map_cost(context.tasks.displayedCost(task, time)),
            index: index,
            starCost: context.tasks.displayedCost(task, time).star || 0,
            name: task.object_id.toString(),
            img: context.tasks.tabletImg(task),
            actionText: context.tasks.tabletActionText(task, time),
            targetText: context.tasks.tabletTargetText(task, time),
            costText: context.tasks.costText(task, time),
            imageTip: context.tasks.tabletImageTip(task, time),
            completeness: context.tasks.tabletCompleteness(task, time)
        };
    })
};

/**
 * File: js/qa/BoosterListQA.js
 */
var BoosterListQA = {};

BoosterListQA.handle = function(scene_id) {
    var booster_tooltip = context.defs.get_def("boosters.tooltip");
    return context.defs.get_def("boosters.interface_order").map(function(booster_id) {
        var booster_def = context.defs.get_def("boosters.booster_types." + booster_id);
        return {
            name: booster_id,
            supported: context.hog.boosterSupported(scene_id, booster_id),
            title: booster_def.name,
            packSize: booster_def.pack_size,
            description: booster_def.description,
            img: booster_def.img,
            tooltip: booster_tooltip,
            cost: QAHelper.map_cost(booster_def.price),
            count: context.player.get_booster_count(booster_id)
        };
    });
};

/**
 * File: js/qa/CaseInfoQA.js
 */
var CaseInfoQA = {};

CaseInfoQA.handle = function(case_id) {
    var case_def = context.case.caseDef(case_id);
    if (context.case.isOpened(case_id)) {
        var current_chapter_def = context.case.currentChapterDef(case_id);
        var weapon_info = context.case.currentInfoState("weapon", case_id);
        var killer_info = context.case.currentInfoState("killer", case_id);
        var victim_info = context.case.currentInfoState("victim", case_id);
        return {
            titleText1: case_def.name,
            titleText2: case_def.description,
            chapterText1: current_chapter_def.name,
            chapterText2: context.case.currentChapterText(case_id),
            chapterPic: current_chapter_def.img,
            chapterProgress: context.case.chapterProgress(case_id),
            victimText1: victim_info.name,
            victimText2: victim_info.description,
            victimPic: victim_info.img,
            weaponText1: weapon_info.name,
            weaponText2: weapon_info.description,
            weaponPic: weapon_info.img,
            killerText1: killer_info.name,
            killerText2: killer_info.description,
            killerPic: killer_info.img
        };
    } else {
        return {
            titleText1: case_def.name,
            titleText2: case_def.description,
            chapterText1: "",
            chapterText2: "",
            chapterPic: "",
            chapterProgress: 0,
            victimText1: "",
            victimText2: "",
            victimPic: "",
            weaponText1: "",
            weaponText2: "",
            weaponPic: "",
            killerText1: "",
            killerText2: "",
            killerPic: ""
        };
    }
}

/**
 * File: js/qa/ClueInfoListQA.js
 */
var ClueInfoListQA = {};

ClueInfoListQA.handle = function() {
    var res = [];
    var forensic_items = context.case.foundForensicItems();
    var default_button_title = context.defs.get_def("interface.forensics.default_button_title");
    for (var forensic_item_id in forensic_items) {
        var forensic_item = forensic_items[forensic_item_id];
        var forensic_item_def = context.case.forensicItems(forensic_item_id).states[forensic_item.state];
        var clue_info = {
            index: forensic_item.index,
            name: forensic_item_id,
            visible: true,
            wrapped: (forensic_item_def.hasOwnProperty("wrapped") ? forensic_item_def.wrapped : true),
            pic: forensic_item_def.img,
            isNew: forensic_item_def.hasOwnProperty("minigame"),
            buttonTitle: ClueInfoListQA.button_title(forensic_item_def),
            buttonColor: ClueInfoListQA.button_color(forensic_item_def),
            starCost: ClueInfoListQA.star_cost(forensic_item_id, forensic_item_def)
        };
        res.push(clue_info);
    }
    return res.sort(function(a, b) { return b.index - a.index });
};

ClueInfoListQA.button_title = function(state_def) {
    if (state_def.button_title) {
        return state_def.button_title;
    } else if (state_def.minigame) {
        return context.defs.get_def("interface.forensics.button_title.minigame");
    } else if (state_def.movie) {
        return context.defs.get_def("interface.forensics.button_title.repeat");
    } else {
        return "";
    }
};

ClueInfoListQA.button_color = function(state_def) {
    if (state_def.button_color) {
        return state_def.button_color;
    } else if (state_def.minigame) {
        return context.defs.get_def("interface.forensics.button_color.minigame");
    } else if (state_def.movie) {
        return context.defs.get_def("interface.forensics.button_color.repeat");
    } else {
        return "";
    }
};

ClueInfoListQA.star_cost = function(forensic_item_id, state_def) {
    if (state_def.minigame) {
        return context.case.minigameCost(forensic_item_id);
    } else {
        return 0;
    }
};

/**
 * File: js/qa/CommandTimeIsValidQA.js
 */
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

/**
 * File: js/qa/EnergyIncrementCountQA.js
 */
var EnergyIncrementCountQA = {};

EnergyIncrementCountQA.handle = function(time) {
    return context.energy.get_increment_count(time);
};

/**
 * File: js/qa/EnergyItemListQA.js
 */
var EnergyItemListQA = {};

EnergyItemListQA.pack_energy_bonus = function(pack_def) {
    var total_energy = 0;
    if (pack_def.content) {
        for (var pack_item_id in pack_def.content) {
            var pack_item = context.defs.get_def("items.item_types." + pack_item_id);
            if (!pack_item) {
                throw new LogicError("Unknown item '" + pack_item_id + "' specified in pack '" + item_id + "'");
            }
            total_energy = pack_item.energy;
        }
    }
    return total_energy;
};

EnergyItemListQA.format_discount_text = function(amount) {
    if (amount == 0) return "";
    return "-" + amount + "%";
};

EnergyItemListQA.count_pack_size = function(pack_def) {
    var pack_size = 0;
    for (var pack_item_id in pack_def.content) {
        if (!context.defs.has_def("items.item_types." + pack_item_id)) {
            throw new LogicError("Unknown item '" + pack_item_id + "' specified in pack '" + pack_id + "'");
        }
        pack_size += pack_def.content[pack_item_id];
    }
    return pack_size;
};

EnergyItemListQA.handle = function() {
    var res = [];

    var items = context.defs.get_def("items.item_types");
    for (var item_id in items) {
        var item = items[item_id];
        res.push({
            id: item_id,
            type: "item",
            discount: "",
            name: item.name,
            image: item.img,
            description: item.description,
            cost: "",
            value: item.energy,
            count: context.player.get_item_count(item_id)
        });
    }

    var packs = context.defs.get_def("packs.pack_types");
    for (var pack_id in packs) {
        var pack = packs[pack_id];
        res.push({
            id: pack_id,
            type: "pack",
            discount: EnergyItemListQA.format_discount_text(pack.discount),
            name: pack.name,
            image: pack.img,
            description: pack.description,
            cost: QAHelper.map_cost(pack.price),
            value: EnergyItemListQA.pack_energy_bonus(pack),
            count: EnergyItemListQA.count_pack_size(pack)
        });
    }
    return res;
}

/**
 * File: js/qa/FakePartnersListQA.js
 */
var FakePartnersListQA = {};

FakePartnersListQA.handle = function() {
    var fake_partner_defs = context.partners.fakePartner();
    var res = [];
    for (var partner_id in fake_partner_defs) {
        var partner = fake_partner_defs[partner_id];
        res.push({
            id: partner_id,
            name: partner.name,
            img: partner.img,
            level: partner.level,
            hintCount: partner.hints,
            scorePerScene: partner.scores
        });
    }
    return res;
};

/**
 * File: js/qa/GetRandomFromSeedQA.js
 */
var GetRandomFromSeedQA = {}

GetRandomFromSeedQA.handle = function(seed) {
    return context.random.generate_from_seed(seed).result;
};

/**
 * File: js/qa/HasUnfinishedMinigameQA.js
 */
var HasUnfinishedMinigameQA = {};

HasUnfinishedMinigameQA.handle = function() {
    return context.storage.has_property(context.case.activeMinigameProp);
};

/**
 * File: js/qa/HasUnfinishedSceneQA.js
 */
var HasUnfinishedSceneQA = {};

HasUnfinishedSceneQA.handle = function() {
    return context.storage.has_property(context.case.activeSceneProp);
};

/**
 * File: js/qa/InitQA.js
 */
var InitQA = function() {
    context.qa_manager = new QAManager(new QADataStorageTweak(context));

    context.qa_manager.add_handler("command_time_is_valid", CommandTimeIsValidQA);
    context.qa_manager.add_handler("map_case_info_list", MapCaseInfoListQA);
    context.qa_manager.add_handler("scene_info_list", SceneInfoListQA);
    context.qa_manager.add_handler("clue_info_list", ClueInfoListQA);
    context.qa_manager.add_handler("lab_item_info_list", LabItemInfoListQA);
    context.qa_manager.add_handler("lab_item_info", LabItemInfoQA);
    context.qa_manager.add_handler("suspect_sign_info_list", SuspectSignInfoListQA);
    context.qa_manager.add_handler("suspect_info_list", SuspectInfoListQA);
    context.qa_manager.add_handler("sign_info_list", SignInfoListQA);
    context.qa_manager.add_handler("case_info", CaseInfoQA);
    context.qa_manager.add_handler("available_action_info_list", AvailableActionInfoListQA);
    context.qa_manager.add_handler("shop_item_list", ShopItemListQA);
    context.qa_manager.add_handler("booster_list", BoosterListQA);
    context.qa_manager.add_handler("energy_item_list", EnergyItemListQA);
    context.qa_manager.add_handler("energy_increment_count", EnergyIncrementCountQA);

    context.qa_manager.add_handler("lab_item_state", LabItemStateQA);
    context.qa_manager.add_handler("lab_item_progress", LabItemProgressQA);
    context.qa_manager.add_handler("lab_item_type", LabItemTypeQA);
    context.qa_manager.add_handler("lab_item_state_button_title", LabItemStateButtonTitleQA);
    context.qa_manager.add_handler("lab_item_state_button_color", LabItemStateButtonColorQA);
    context.qa_manager.add_handler("lab_item_character_img", LabItemCharacterImgQA);
    context.qa_manager.add_handler("lab_item_character_text", LabItemCharacterTextQA);
    context.qa_manager.add_handler("lab_item_tip_text", LabItemTipTextQA);
    context.qa_manager.add_handler("lab_item_remaining_time_text", LabItemRemainingTimeTextQA);
    context.qa_manager.add_handler("lab_item_remaining_time_list", LabItemRemainingTimeListQA);

    context.qa_manager.add_handler("active_scene_item_info_list", ActiveSceneItemInfoListQA);
    context.qa_manager.add_handler("active_scene_item_count", ActiveSceneItemCountQA);
    context.qa_manager.add_handler("active_scene_info", ActiveSceneInfoQA);
    context.qa_manager.add_handler("scene_special_item_available", SceneSpecialItemAvailableQA);
    context.qa_manager.add_handler("unfinished_scene_info", UnfinishedSceneInfoQA);
    context.qa_manager.add_handler("has_unfinished_scene", HasUnfinishedSceneQA);
    context.qa_manager.add_handler("has_unfinished_minigame", HasUnfinishedMinigameQA);

    context.qa_manager.add_handler("suspect_state_property", SuspectStatePropertyQA);
    context.qa_manager.add_handler("suspect_property", SuspectPropertyQA);
    context.qa_manager.add_handler("suspect_custom_properties", SuspectCustomPropertiesQA);
    context.qa_manager.add_handler("suspect_format_clues", SuspectFormatCluesQA);

    context.qa_manager.add_handler("tutorial_current_state", TutorialCurrentStateQA);
    context.qa_manager.add_handler("tutorial_steps", TutorialStepsQA);

    context.qa_manager.add_handler("partner_list", PartnerListQA);
    context.qa_manager.add_handler("fake_partners_list", FakePartnersListQA);
    context.qa_manager.add_handler("unlock_case_info", UnlockCaseInfoQA);

    context.qa_manager.add_handler("message_list", MessageListQA);
    context.qa_manager.add_handler("reject_services_list", RejectedServicesListQA);
    context.qa_manager.add_handler("local_push_notifications", LocalPushNotificationsQA);
    context.qa_manager.add_handler("player_data_json", PlayerDataJSONQA);
};

/**
 * File: js/qa/LabItemCharacterImgQA.js
 */
var LabItemCharacterImgQA = {};

LabItemCharacterImgQA.handle = function(lab_item_id, state) {
    var lab_item_type = LabItemTypeQA.handle(lab_item_id);
    var character = lab_item_type.character
    if (typeof(character) == 'string') {
        return character;
    } else {
        return character[state];
    }
};

/**
 * File: js/qa/LabItemCharacterTextQA.js
 */
var LabItemCharacterTextQA = {};

LabItemCharacterTextQA.handle = function(lab_item_id, state) {
    var lab_item_type = LabItemTypeQA.handle(lab_item_id);
    return lab_item_type.text[state];
};

/**
 * File: js/qa/LabItemInfoListQA.js
 */
var LabItemInfoListQA = {};

LabItemInfoListQA.handle = function(time) {
    var res = [];
    var lab_items = context.case.foundLabItems();
    for (var lab_item_id in lab_items) {
        res.push(context.qa_manager.handle("lab_item_info", lab_item_id, time));
    }
    return res.sort(function(a, b) { return b.index - a.index });
};

/**
 * File: js/qa/LabItemInfoQA.js
 */
var LabItemInfoQA = {};

LabItemInfoQA.handle = function(lab_item_id, time) {
    var lab_item = context.case.foundLabItems(lab_item_id);
    var lab_item_def = context.case.labItems(lab_item_id);
    var left_time = context.case.analyzeTimeLeft(lab_item_id, time);
    var total_time = lab_item_def.analyze_time;
    var state = context.qa_manager.handle("lab_item_state", lab_item_id, time);
    return {
        index: lab_item.index,
        visible: true,
        name: lab_item_id,
        title: lab_item_def.name,
        pic: lab_item_def.img,
        progress: 1 - left_time/total_time,
        forceCost: context.case.analyzeSpeedupCost(lab_item_id, time),
        buttonTitle: context.qa_manager.handle("lab_item_state_button_title", lab_item_id, state),
        buttonColor: context.qa_manager.handle("lab_item_state_button_color", lab_item_id, state),
        persPic: context.qa_manager.handle("lab_item_character_img", lab_item_id, state),
        persText: context.qa_manager.handle("lab_item_character_text", lab_item_id, state),
        tipText: context.qa_manager.handle("lab_item_tip_text", lab_item_id, state, time)
    };
};

/**
 * File: js/qa/LabItemProgressQA.js
 */
var LabItemProgressQA = {};

LabItemProgressQA.handle = function(lab_item_id, time) {
    context.system.check_string(lab_item_id);
    context.system.check_int(time);
    return 1 - (context.case.analyzeTimeLeft(lab_item_id, time) / context.case.analyzeTime(lab_item_id));
};

/**
 * File: js/qa/LabItemRemainingTimeListQA.js
 */
var LabItemRemainingTimeListQA = {};

LabItemRemainingTimeListQA.handle = function(time) {
    context.system.check_int(time);
    var analyzed_items = context.case.analyzedItems();
    var res = {}
    for (var lab_item_id in analyzed_items) {
        res[lab_item_id] = {
            remainingText: context.qa_manager.handle("lab_item_remaining_time_text", lab_item_id, time),
            forceCost: context.case.analyzeSpeedupCost(lab_item_id, time)
        };
    }
    return res;
};

/**
 * File: js/qa/LabItemRemainingTimeTextQA.js
 */
var LabItemRemainingTimeTextQA = {};

LabItemRemainingTimeTextQA.handle = function(lab_item_id, time) {
    context.system.check_string(lab_item_id);
    context.system.check_int(time);

    return QAHelper.format_seconds(context.case.analyzeTimeLeft(lab_item_id, time));
};

/**
 * File: js/qa/LabItemStateButtonColorQA.js
 */
var LabItemStateButtonColorQA = {};

LabItemStateButtonColorQA.handle = function(lab_item_id, state) {
    context.system.check_string(lab_item_id);
    context.system.check_string(state);
    var button_color_prop = context.case.labItemsProp(lab_item_id) + ".button_color." + state;
    if (context.defs.has_def(button_color_prop)) {
        return context.defs.get_def(button_color_prop);
    } else {
        return context.defs.get_def("interface.laboratory.button_color." + state);
    }
};

/**
 * File: js/qa/LabItemStateButtonTitleQA.js
 */
var LabItemStateButtonTitleQA = {};

LabItemStateButtonTitleQA.handle = function(lab_item_id, state) {
    context.system.check_string(lab_item_id);
    context.system.check_string(state);
    var button_title_prop = context.case.labItemsProp(lab_item_id) + ".button_title." + state;
    if (context.defs.has_def(button_title_prop)) {
        return context.defs.get_def(button_title_prop);
    } else {
        return context.defs.get_def("interface.laboratory.button_title." + state);
    }
};

/**
 * File: js/qa/LabItemStateQA.js
 */
var LabItemStateQA = {};

LabItemStateQA.handle = function(lab_item_id, time) {
    context.system.check_string(lab_item_id);
    var lab_item = context.case.foundLabItems(lab_item_id);
    if (lab_item.state === "analyzing" && context.case.analyzeTimeLeft(lab_item_id, time) == 0) {
        return "analyzed";
    } else {
        return lab_item.state;
    }
};

/**
 * File: js/qa/LabItemTipTextQA.js
 */
var LabItemTipTextQA = {};

LabItemTipTextQA.handle = function(lab_item_id, state, time) {
    if (state == "done" || state == "analyzed") {
        return context.defs.get_def("interface.laboratory.tip_text")[state];
    } else {
        return context.qa_manager.handle("lab_item_remaining_time_text", lab_item_id, time);
    }
};

/**
 * File: js/qa/LabItemTypeQA.js
 */
var LabItemTypeQA = {};

LabItemTypeQA.handle = function(lab_item_id) {
    var item_type = context.case.labItems(lab_item_id).item_type;
    return context.defs.get_def("interface.laboratory.item_types." + item_type);
};

/**
 * File: js/qa/LocalPushNotificationsQA.js
 */
var LocalPushNotificationsQA = {};

LocalPushNotificationsQA.handle = function(time) {
    var notifications = [
        this.full_energy(),
        this.can_investigate()
    ].concat(this.analyze_done(time));
    return notifications.filter(function(notification) {
        return notification && notification.time && notification.time > time
    }).map(function(notification) {
        return {
            time: (notification.time - time) / 1000,
            text: notification.text
        }
    });
};

LocalPushNotificationsQA.analyze_done = function() {
    var res = [];
    var analyzed_items = context.storage.get_property("immediate_data.analyzed_items");
    for (var case_id in analyzed_items) {
        var case_analyzed_items = analyzed_items[case_id];
        for (var lab_item_id in case_analyzed_items) {
            res.push(case_analyzed_items[lab_item_id].end);
        }
    }
    return res.map(function(analyze_end_time) {
        return {
            time: analyze_end_time,
            text: context.defs.get_def("interface.local_push_notifications.analyze_done")
        };
    });
};

LocalPushNotificationsQA.full_energy = function() {
    return {
        time: context.energy.energy_restore_time(),
        text: context.defs.get_def("interface.local_push_notifications.full_energy")
    };
};

LocalPushNotificationsQA.can_investigate = function() {
    return {
        time: context.energy.energy_restore_time(this.min_investigate_cost()),
        text: context.defs.get_def("interface.local_push_notifications.can_investigate")
    };
};

LocalPushNotificationsQA.min_investigate_cost = function() {
    var investigate_cost = [];
    context.case.openCasesIds().forEach(function(case_id) {
        context.case.tasks(case_id).forEach(function(task) {
            if (task.type == "investigate") {
                investigate_cost.push(context.case.sceneEnergyCost(task.object_id, case_id))
            }
        });
    });
    if (investigate_cost.length > 0) {
        return Math.min.apply(null, investigate_cost)
    } else {
        return 0;
    }
};

/**
 * File: js/qa/MapCaseInfoListQA.js
 */
var MapCaseInfoListQA = {};

MapCaseInfoListQA.case_state = function(case_id) {
    if (context.case.isNew(case_id)) {
        return "new";
    } else if (context.case.isUnlocked(case_id)) {
        return "unlocked";
    } else if (context.case.isOpened(case_id)) {
        return "opened";
    } else {
        return "closed";
    }
};

MapCaseInfoListQA.handle = function() {
    return context.defs.get_def("map.case_order").map(function(case_id) {
        var case_def = context.case.caseDef(case_id);
        var case_map_def = context.defs.get_def("map.descriptions." + case_id);
        var state = MapCaseInfoListQA.case_state(case_id);
        if (state !== "closed") {
            return {
                state: state,
                requires_unlock: context.case.isNew(case_id),
                id: case_id,
                current: context.case.isActiveCase(case_id),
                starsEarned: context.case.totalStars(case_id),
                starsTotal: context.case.caseStarsLimit(case_id),
                medals: context.case.medals(case_id),
                text1: case_map_def.name,
                text2: case_map_def.desc,
                path: case_map_def.path,
                img: case_map_def.img
            };
        } else {
            return {
                state: state,
                requires_unlock: false,
                id: case_id,
                current: false,
                starsEarned: 0,
                starsTotal: 0,
                medals: [],
                text1: case_map_def.name,
                text2: case_map_def.desc,
                path: case_map_def.path,
                img: case_map_def.img
            };
        }
    });
}

/**
 * File: js/qa/MessageListQA.js
 */
var MessageListQA = {};

MessageListQA.handle = function(services) {
    var res = [];
    if (services.send_gift) {
        res = res.concat(MessageListQA.format_messages("send_gift", services.send_gift));
    }
    if (services.unlock_request) {
        res = res.concat(MessageListQA.format_messages("unlock_request", services.unlock_request));
    }
    return res;
};

MessageListQA.format_messages = function(service_id, operations) {
    var res = []
    for (var operation_id in operations) {
        var operation = operations[operation_id];
        var result = operation.result;
        res.push({
            service_id: service_id,
            operation_id: parseInt(operation_id),
            partner_id: result.partner_id,
            button_color: MessageListQA.get_button_color(service_id, result),
            button_title: MessageListQA.get_button_title(service_id, result),
            img: MessageListQA.get_image(service_id, operation.result),
            count_text: MessageListQA.get_count(service_id, operation.result),
            text: MessageListQA.get_text(service_id, operation.result)
        });
    }
    return res;
};

MessageListQA.get_image = function(service_id, result) {
    if (service_id === "send_gift") {
        return context.defs.get_def(["interface.messages", service_id, result.type, "img"].join('.'));
    } else if (service_id === "unlock_request") {
        return context.defs.get_def("interface.messages." + service_id + ".img");
    }
}

MessageListQA.get_count = function(service_id, result) {
    if (service_id === "send_gift") {
        return "+" + result.count;
    } else {
        return "";
    }
};

MessageListQA.get_button_color = function(service_id, result) {
    if (service_id == "send_gift") {
        return context.defs.get_def(["interface.messages", service_id, result.type, "button_color"].join('.'));
    } else {
        return context.defs.get_def("interface.messages." + service_id + ".button_color");
    }
};

MessageListQA.get_button_title = function(service_id, result) {
    var type;
    if (service_id == "unlock_request") {
        type = (result.request ? "on_request" : "on_response");
    } else {
        type = result.type;
    }
    return context.defs.get_def(["interface.messages", service_id, type, "button_title"].join('.'));
};

MessageListQA.get_text = function(service_id, result) {
    var type;
    if (service_id == "unlock_request") {
        type = (result.request ? "on_request" : "on_response");
    } else {
        type = result.type;
    }
    return context.defs.get_def(["interface.messages", service_id, type, "text"].join('.'));
};

/**
 * File: js/qa/PartnerListQA.js
 */
var PartnerListQA = {};

PartnerListQA.format_partner = function(time, partner_id, partner, is_fake) {
    var ready_time = Math.max(Math.ceil(((partner.ready_time || 0) - time) / 1000), 0);

    var ready_fraction = 0;
    if (ready_time > 0) {
        ready_fraction = (time - partner.use_time) / (partner.ready_time - partner.use_time);
    }

    return {
        id: partner_id,
        forceCost: QAHelper.map_cost({real_balance: context.partners.calculateResetCost(ready_time)}),
        isReady: (ready_time == 0),
        isFake: is_fake,
        readyTime: (ready_time == 0 ? "" : QAHelper.format_seconds(ready_time)),
        readyFraction: ready_fraction
    }
};

PartnerListQA.handle = function(time) {
    var res = [];
    var partners = context.partners.partner(null);
    for (var partner_id in partners) {
        res.push(PartnerListQA.format_partner(time, partner_id, partners[partner_id], false));
    }

    var fake_partners = context.partners.fakePartner();
    var partners = context.partners.partner(null, true);
    for (var partner_id in fake_partners) {
        var partner = partners[partner_id] || {}
        res.push(PartnerListQA.format_partner(time, partner_id, partner, true));
    }
    return res;
};

/**
 * File: js/qa/PlayerDataJSONQA.js
 */
var PlayerDataJSONQA = {};

PlayerDataJSONQA.handle = function(friend_count, active_friend_count) {
    return JSON.stringify({
        lvl: context.player.get_level(),
        xp: context.player.get_xp(),
        coins: context.player.get_game_balance(),
        bucks: context.player.get_real_balance(),
        f: friend_count,
        af: active_friend_count,
        stars: Object.keys(context.storage.get_property("open_cases")).reduce(function(memo, case_id) {
            return memo + context.case.totalStars(case_id);
        }, 0)
    });
};

/**
 * File: js/qa/QAHelper.js
 */
var QAHelper = {
    format_seconds: function(seconds) {
        var days = Math.floor(seconds / 86400);
        var times = [Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
        if (days > 0) {
            times.unshift(days);
        }
        return times.map(function(value) {
            return (value > 9 ? "" : "0") + value.toString();
        }).join(":");
    },
    map_cost: function(cost) {
        var res = []
        if (cost.star) {
            res.push(cost.star.toString() + "*");
        }
        if (cost.energy) {
            res.push(cost.energy.toString() + "#");
        }
        if (cost.real_balance) {
            res.push(cost.real_balance.toString() + "$");
        }
        if (cost.game_balance) {
            res.push(cost.game_balance.toString() + "#");
        }
        if (cost.time) {
            res.push(QAHelper.format_seconds(cost.time).toString() + "&");
        }
        return res.join(' ');
    }
};

/**
 * File: js/qa/RejectedServicesListQA.js
 */
var RejectedServicesListQA = {};

RejectedServicesListQA.handle = function(services, time) {
    var res = [];
    for (var service_id in services) {
        res = res.concat(RejectedServicesListQA.reject_services(service_id, services[service_id], time));
    };
    return res;
};

RejectedServicesListQA.reject_services = function(service_id, operations, time) {
    var self = RejectedServicesListQA;
    var filtered = self.filter_expired_services(operations, time);
    for (var operation_id in operations) {
        var operation = operations[operation_id];
        var result = operation.result;

        if (service_id == "unlock_request" && filtered.indexOf(operation_id) < 0) {
            if (self.case_already_unlocked(result) || self.request_already_accepted(result)) {
                filtered.push(operation_id);
            } else {
                filtered = self.filter_duplicate_requests(filtered, operations, operation_id);
            }
        }
    }
    return filtered.map(function(operation_id) {
        return { service_id: service_id, operation_id: parseInt(operation_id) }
    });
};

RejectedServicesListQA.filter_expired_services = function(operations, time) {
    return Object.keys(operations).filter(function(operation_id) {
        return operations[operation_id].result.expires_date <= time;
    }).map(function(operation_id) {
        return operation_id;
    });
};

RejectedServicesListQA.is_result_duplicate = function(result_1, result_2) {
    return ['partner_id', 'case_id', 'request'].every(function(id) { return result_1[id] === result_2[id] });
};

RejectedServicesListQA.select_older_result = function(operation_id_1, result_1, operation_id_2, result_2) {
    return result_1.expires_date < result_2.expires_date ? operation_id_1 : operation_id_2
};

RejectedServicesListQA.case_already_unlocked = function(result) {
    return result.request == false && !context.case.isNew(result.case_id);
};

RejectedServicesListQA.request_already_accepted = function(result) {
    return context.partners.unlockRequests(result.case_id).indexOf(result.partner_id) >= 0;
};

RejectedServicesListQA.filter_duplicate_requests = function(filtered, operations, operation_id) {
    var self = RejectedServicesListQA;
    var result = operations[operation_id].result;
    for (var other_op_id in operations) {
        if (other_op_id != operation_id && filtered.indexOf(other_op_id) < 0) {
            var other_result = operations[other_op_id].result;
            if (self.is_result_duplicate(result, other_result)) {
                filtered.push(self.select_older_result(operation_id, result, other_op_id, other_result));
            }
        }
    }
    return filtered;
}

/**
 * File: js/qa/SceneInfoListQA.js
 */
var SceneInfoListQA = {};

SceneInfoListQA.handle = function() {
    return context.case.sceneOrder().map(function(scene_id) {
        var scene_def = context.case.scenes(scene_id);
        var scene = context.case.openedScenes(scene_id);
        return {
            visible: context.case.isSceneOpened(scene_id),
            haveItemsToFind: context.qa_manager.handle("scene_special_item_available", scene_id),
            isBonus: (scene_def.type !== "hog"),
            isNew: (scene.stars == 0 && scene.score == 0),
            name: scene_id,
            title: scene_def.name,
            pic: scene_def.img,
            type: scene_def.type,
            path: scene_def.path,
            lockText: (scene_def.unlock_text || ""),
            openStars: (scene_def.unlock_star || 0),
            scores: (scene.score || 0),
            nextStarScore: (context.case.sceneStarScores(scene_id)[scene.stars || 0] || 0),
            stars: (scene.stars || 0),
            energyCost: context.case.sceneEnergyCost(scene_id),
        };
    });
};

/**
 * File: js/qa/SceneSpecialItemAvailableQA.js
 */
var SceneSpecialItemAvailableQA = {};

SceneSpecialItemAvailableQA.handle = function(scene_id) {
    if (context.case.isSceneOpened(scene_id)) {
        return (context.case.sceneCurrentState(scene_id).items || []).length > 0;
    } else {
        return false;
    }
};

/**
 * File: js/qa/ShopItemListQA.js
 */
var ShopItemListQA = {};

ShopItemListQA.handle = function() {
    var res = [];
    var products = context.defs.get_def("products");
    for (var product_id in products) {
        var product = products[product_id];
        res.push({
            name: product_id,
            type: product.group,
            flag: product.presentation.flag || "",
            value: product.presentation.base_value,
            bonus: (product.presentation.bonus ? "+ " + product.presentation.bonus + "%" : ""),
            totalValue: product.presentation.total_value
        });
    }
    return res;
};

/**
 * File: js/qa/SingInfoListQA.js
 */
var SignInfoListQA = {};

SignInfoListQA.handle = function() {
    var res = [];
    var clue_defs = context.case.clues();
    return context.case.knownClues().map(function(clue_id) {
        var img = clue_defs[clue_id].img;
        return {
            name: clue_id,
            visible: true,
            hidden: (img ? false : true),
            picPath: img
        };
    });
};

/**
 * File: js/qa/SuspectCustomPropertiesQA.js
 */
var SuspectCustomPropertiesQA = {};

SuspectCustomPropertiesQA.handle = function() {
    var property_descriptions = context.defs.get_def("interface.suspect.properties");
    var case_properties = context.case.caseDef().suspect_properties;

    var target = {};
    for (var property_index in case_properties) {
        target[property_index] = property_descriptions[case_properties[property_index]];
    }
    return target;
};

/**
 * File: js/qa/SuspectFormatCluesQA.js
 */
var SuspectFormatCluesQA = {};

SuspectFormatCluesQA.handle = function(notification) {
    var res = {
        is_killer: !notification.suspect,
        text: notification.text || "cases.suspect_format_clues"
    };

    var suspect_clues_def = null;
    var killer_clues_def = context.case.clues();

    if (notification.suspect) {
        var suspect_id = notification.suspect;
        var suspect = context.case.knownSuspects(suspect_id);
        suspect_clues_def = context.case.suspects(suspect_id).clues;
        res.img = SuspectStatePropertyQA.handle(suspect_id, suspect.state, "img");
        res.title = SuspectStatePropertyQA.handle(suspect_id, suspect.state, "title");
    } else {
        res.img = context.defs.get_def("interface.suspect.killer_clues_img");
        res.title = context.defs.get_def("interface.suspect.killer_title");
    }

    res.clues = notification.clues.all.map(function(clue) {
        return {
            img: SuspectFormatCluesQA.clue_img(suspect_clues_def, killer_clues_def, clue),
            new: notification.clues.new.indexOf(clue) >= 0
        }
    }).filter(function(e) { return e.img });

    res.alibi = notification.alibi.value;
    res.alibi_updated = notification.alibi.updated;
    res.motive = notification.motive.value;
    res.motive_updated = notification.motive.updated;

    return res;
};

SuspectFormatCluesQA.clue_img = function(suspect_clues, killer_clues, clue_id) {
    return (suspect_clues ? suspect_clues[clue_id].img : null) || (killer_clues ? killer_clues[clue_id].img : null);
};

/**
 * File: js/qa/SuspectInfoListQA.js
 */
var SuspectInfoListQA = {};

SuspectInfoListQA.handle = function() {
    var res = []
    var known_suspects = context.case.knownSuspects();
    var button_titles = context.defs.get_def("interface.suspect.button_title");
    var button_colors = context.defs.get_def("interface.suspect.button_color");
    var killer = context.case.arrestData().killer;
    for (var suspect_id in known_suspects) {
        var suspect = known_suspects[suspect_id];
        var suspect_def = context.case.suspects(suspect_id);
        var state = suspect.state;
        var button_title
        var button_color
        if (context.case.isSuspectClickable(suspect_id)) {
            button_title = context.qa_manager.handle("suspect_state_property", suspect_id, state, "button_title");
            button_color = context.qa_manager.handle("suspect_state_property", suspect_id, state, "button_color");

            var button_state = (suspect.state == "arrest" ? suspect.state :  (suspect.talked ? "repeat" : "talk"));

            button_title = button_title || button_titles[button_state];
            button_color = button_color || button_colors[button_state];
        } else {
            button_title = ""
            button_color = ""
        }

        var suspect_properties = context.qa_manager.handle("suspect_custom_properties");

        res.push({
            name: suspect_id,
            visible: true,
            alibi: suspect.alibi,
            motive: suspect.motive,
            killer: (killer == suspect_id),
            picPath: context.qa_manager.handle("suspect_state_property", suspect_id, state, "img"),
            title: context.qa_manager.handle("suspect_state_property", suspect_id, state, "title"),
            status: context.qa_manager.handle("suspect_state_property", suspect_id, state, "status"),
            text1: context.qa_manager.handle("suspect_state_property", suspect_id, state, "prop_1"),
            text2: context.qa_manager.handle("suspect_state_property", suspect_id, state, "prop_2"),
            text1Title: suspect_properties.prop_1.title,
            text1Pic: suspect_properties.prop_1.img,
            text2Title: suspect_properties.prop_2.title,
            text2Pic:  suspect_properties.prop_2.img,
            starCost: context.case.suspectClickCost(suspect_id),
            buttonText: button_title || "",
            buttonColor: button_color || "",
            signs: context.qa_manager.handle("suspect_sign_info_list", suspect_id)
        });
    };
    return res;
};

/**
 * File: js/qa/SuspectPropertyQA.js
 */
var SuspectPropertyQA = {};

SuspectPropertyQA.handle = function(suspect_id, property_name) {
    var suspect = context.case.knownSuspects(suspect_id);
    return SuspectStatePropertyQA.handle(suspect_id, suspect.state, property_name);
};

/**
 * File: js/qa/SuspectSignInfoListQA.js
 */
var SuspectSignInfoListQA = {};

SuspectSignInfoListQA.handle = function(suspect_id) {
    if (context.case.isSuspectKnown) {
        var suspect = context.case.knownSuspects(suspect_id);
        var suspect_def = context.case.suspects(suspect_id);
        var clues = suspect_def.clues;
        var res = suspect.clues.map(function(clue_id) {
            var img = clues[clue_id].img;
            return {
                link: clue_id,
                visible: true,
                match: clues[clue_id].match,
                hidden: (img ? false : true),
                picPath: (img ? img : "")
            };
        });
        return res;
    } else {
        return [];
    }
};

/**
 * File: js/qa/SuspectStatePropertyQA.js
 */
var SuspectStatePropertyQA = {};

SuspectStatePropertyQA.handle = function(suspect_id, state, property_name) {
    var suspect_prop = context.case.suspectsProp(suspect_id);
    var suspect_prop_name = [suspect_prop, "states", state, property_name].join('.');
    if (context.defs.has_def(suspect_prop_name)) {
        return context.defs.get_def(suspect_prop_name);
    } else {
        var default_prop = [suspect_prop, "states.default", property_name].join('.');
        if (context.defs.has_def(default_prop)) {
            return context.defs.get_def(default_prop);
        } else {
            return "";
        }
    }
};

/**
 * File: js/qa/TutorialCurrentStateQA.js
 */
var TutorialCurrentStateQA = {};

TutorialCurrentStateQA.handle = function() {
    if (context.storage.has_property("tutorial.state")) {
        return context.storage.get_property("tutorial.state");
    } else {
        return null;
    }
};

/**
 * File: js/qa/TutorialStepsQA.js
 */
var TutorialStepsQA = {};

TutorialStepsQA.handle = function() {
    return context.defs.get_def("tutorial.steps");
};

/**
 * File: js/qa/UnfinishedSceneInfoQA.js
 */
var UnfinishedSceneInfoQA = {};

UnfinishedSceneInfoQA.handle = function() {
    var active_scene = context.case.activeScene();
    return {
        case_id: context.case.activeCase(),
        scene_id: active_scene.scene_id,
        partner_id: active_scene.partner_id || "",
        hints: active_scene.hints,
        boosters: active_scene.active_boosters,
        start: active_scene.start
    };
};

/**
 * File: js/qa/UnlockCaseInfoQA.js
 */
var UnlockCaseInfoQA = {};

UnlockCaseInfoQA.handle = function(case_id, time) {
    return {
        can_broadcast: context.partners.hasUnsendUnlockRequests(case_id, time),
        requests_required: context.partners.requiredUnlockRequests(case_id),
        requests_accepted: context.partners.unlockRequests(case_id),
        force_cost: QAHelper.map_cost(context.partners.unlockRequestCost(case_id))
    };
};

/**
 * File: js/services/GiftService.js
 */
var GiftService = function() {}

GiftService.prototype.use_result = function(service_args, client_params, time) {
    context.system.check_key(client_params, "accept");

    if (!client_params.accept) return;

    context.system.check_key(service_args, "partner_id");
    context.system.check_key(service_args, "type");
    context.system.check_key(service_args, "count");
    context.system.check_key(service_args, "content");

    if (service_args.content.energy) {
        context.energy.add(service_args.content.energy);
    }

    if (service_args.content.items) {
        for (var item in service_args.content.items) {
            Executor.run(AddItemCommand, item, service_args.content.items[item]);
        }
    }
};

/**
 * File: js/services/PaymentService.js
 */
var PaymentService = function() { };

PaymentService.prototype.use_result = function(service_args, client_params, time) {
    context.system.check_key(client_params, "accept");
    if (!client_params.accept) return;

    context.system.check_key(service_args, "product_id");
    context.system.check_key(service_args, "store");

    var product_id = service_args.product_id;
    var product_defs = context.defs.get_def("products");
    var product = product_defs[product_id];

    var store_data = product.store[service_args.store];
    if (product) {
        Executor.run(ApplyRewardCommand, product.reward);
        context.track.in_app(product_id, product.reward);
        context.track.revenue(service_args.store, store_data.id, store_data.cost);
    } else {
        throw new LogicError("Неизвестный продукт: " + product_code);
    }
};


/**
 * File: js/services/UnlockRequestService.js
 */
var UnlockRequestService = function() {}

UnlockRequestService.prototype.use_result = function(service_args, client_params, time) {
    context.system.check_key(client_params, "accept");

    if (!client_params.accept) return;

    context.system.check_key(service_args, "partner_id");
    context.system.check_key(service_args, "case_id");
    context.system.check_key(service_args, "request");

    var case_id = service_args.case_id;
    var partner_id = service_args.partner_id;
    if (service_args.request) {
        Executor.run(SendUnlockRequestCommand, partner_id, time, case_id, false);
    } else {
        context.partners.usePartnerUnlockRequest(partner_id, case_id);
    }
};



var definitions = {
  "boosters": {
    "schema_id": "boosters",
    "interface_order": [
      "quick_lookup",
      "full_hints",
      "full_multiplier",
      "minimal_multiplier",
      "highlight_timer"
    ],
    "booster_types": {
      "quick_lookup": {
        "name": "boosters.booster_types.quick_lookup.name",
        "description": "boosters.booster_types.quick_lookup.description",
        "tablet_name": "boosters.booster_types.quick_lookup.tablet_name",
        "tablet_description": "boosters.booster_types.quick_lookup.tablet_description",
        "img": "images/icon_booster_cooldown",
        "pack_size": 3,
        "require": {
          "medal": "silver",
          "star": 1
        },
        "unsupported": [
          "puzzle",
          "hogDiff"
        ],
        "price": {
          "game_balance": 500
        }
      },
      "full_hints": {
        "name": "boosters.booster_types.full_hints.name",
        "description": "boosters.booster_types.full_hints.description",
        "tablet_name": "boosters.booster_types.full_hints.tablet_name",
        "tablet_description": "boosters.booster_types.full_hints.tablet_description",
        "img": "images/icon_booster_five",
        "pack_size": 3,
        "require": {
          "medal": "silver",
          "star": 2
        },
        "price": {
          "game_balance": 1500
        }
      },
      "full_multiplier": {
        "name": "boosters.booster_types.full_multiplier.name",
        "description": "boosters.booster_types.full_multiplier.description",
        "tablet_name": "boosters.booster_types.full_multiplier.tablet_name",
        "tablet_description": "boosters.booster_types.full_multiplier.tablet_description",
        "img": "images/icon_booster_x6",
        "pack_size": 3,
        "require": {
          "medal": "silver",
          "star": 3
        },
        "unsupported": [
          "hog",
          "puzzle",
          "hogDiff",
          "hogTime"
        ],
        "price": {
          "game_balance": 3000
        }
      },
      "minimal_multiplier": {
        "name": "boosters.booster_types.minimal_multiplier.name",
        "description": "boosters.booster_types.minimal_multiplier.description",
        "tablet_name": "boosters.booster_types.minimal_multiplier.tablet_name",
        "tablet_description": "boosters.booster_types.minimal_multiplier.tablet_description",
        "img": "images/icon_booster_x3",
        "pack_size": 3,
        "require": {
          "medal": "gold",
          "star": 4
        },
        "price": {
          "real_balance": 3
        }
      },
      "highlight_timer": {
        "name": "boosters.booster_types.highlight_timer.name",
        "description": "boosters.booster_types.highlight_timer.description",
        "tablet_name": "boosters.booster_types.highlight_timer.tablet_name",
        "tablet_description": "boosters.booster_types.highlight_timer.tablet_description",
        "img": "images/icon_booster_5sec",
        "pack_size": 3,
        "unsupported": [
          "puzzle"
        ],
        "price": {
          "real_balance": 2
        }
      }
    },
    "tooltip": "boosters.tooltip"
  },
  "case_settings": {
    "schema_id": "case_settings",
    "stars_per_scene": 5,
    "default_minigame_cost": 1,
    "default_suspect_talk_cost": 1,
    "default_suspect_arrest_cost": 1,
    "chapter_reward": {
      "progress": {
        "xp": 50,
        "game_balance": 100
      },
      "end": {
        "xp": 200,
        "game_balance": 1500
      }
    }
  },
  "cases": {
    "case_01": {
      "schema_id": "case",
      "name": "cases.case_01.name",
      "description": "cases.case_01.description",
      "scene_order": [
        "scene_1",
        "scene_2",
        "bonus_1"
      ],
      "scenes": {
        "scene_1": {
          "scores": [
            30000,
            50000,
            70000,
            90000,
            110000
          ],
          "name": "cases.case_01.scenes.scene_1.name",
          "target_text": "cases.case_01.scenes.scene_1.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "house",
          "img": "house/thumb",
          "items": {
            "body": {
              "name": "cases.case_01.scenes.scene_1.items.body.name",
              "img": "images/dead_pic",
              "layer": "victim_special_fade"
            },
            "knife": {
              "name": "cases.case_01.scenes.scene_1.items.knife.name",
              "img": "images/knife",
              "layer": "knife_normal_special",
              "linked_layer": "32"
            },
            "ritual_knife": {
              "name": "cases.case_01.scenes.scene_1.items.ritual_knife.name",
              "img": "images/ritual_knife",
              "layer": "knife_special"
            },
            "ritual": {
              "name": "cases.case_01.scenes.scene_1.items.ritual.name",
              "img": "images/ritual_symbol",
              "layer": "symbol_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "body",
                "ritual",
                "ritual_knife"
              ],
              "on_complete": [
                {
                  "progress_tutorial": null
                },
                {
                  "show_movie": "m2"
                },
                {
                  "set_info_state": {
                    "type": "victim",
                    "state": "found"
                  }
                },
                {
                  "add_lab_item": "body"
                },
                {
                  "add_forensic_item": "ritual_knife"
                },
                {
                  "add_forensic_item": "ritual_symbol"
                },
                {
                  "update_killer_state": {
                    "clues": [
                      "ritual"
                    ],
                    "text": "cases.case_01.add_clues.ritual"
                  }
                },
                {
                  "progress_tutorial": null
                }
              ]
            },
            "2": {
              "items": [
                "knife"
              ],
              "on_complete": [
                {
                  "progress_tutorial": null
                },
                {
                  "add_forensic_item": "knife"
                },
                {
                  "show_movie": "m4"
                },
                {
                  "progress_tutorial": null
                }
              ]
            },
            "default": {}
          }
        },
        "scene_2": {
          "scores": [
            200000,
            400000,
            600000,
            900000,
            1200000
          ],
          "name": "cases.case_01.scenes.scene_2.name",
          "target_text": "cases.case_01.scenes.scene_2.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "footballfan_room_03_Final",
          "img": "footballfan_room_03_Final/thumb",
          "items": {
            "note": {
              "name": "cases.case_01.scenes.scene_2.items.note.name",
              "img": "images/torn_note",
              "layer": "zapiska_special"
            },
            "smartphone": {
              "name": "cases.case_01.scenes.scene_2.items.smartphone.name",
              "img": "images/smartphone",
              "layer": "smartphone_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "note",
                "smartphone"
              ],
              "on_complete": [
                {
                  "show_movie": "m10"
                },
                {
                  "add_forensic_item": "note"
                },
                {
                  "add_lab_item": "smartphone"
                },
                {
                  "progress_chapter": "201_end_scene_2_state_1"
                },
                {
                  "progress_tutorial": null
                }
              ]
            },
            "default": {}
          }
        },
        "bonus_1": {
          "scores": [
            50000,
            100000,
            400000,
            700000,
            1000000
          ],
          "name": "cases.case_01.scenes.bonus_1.name",
          "unlock_text": "sceneLockText",
          "type": "puzzle",
          "path": "images/house_puzzle",
          "img": "images/1_puzzle",
          "states": {
            "default": {}
          }
        }
      },
      "forensic_items": {
        "ritual_symbol": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/ritual_symbol",
              "movie": "m_ritual_symbol"
            }
          }
        },
        "ritual_knife": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/ritual_knife",
              "movie": "m_ritual_knife"
            }
          }
        },
        "body": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/victim_photo",
              "wrapped": false,
              "movie": "m_body"
            }
          }
        },
        "knife": {
          "initial_state": "new",
          "target_text": "cases.case_01.forensic_items.knife.target_text",
          "states": {
            "new": {
              "img": "images/skin_mg_icon",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "path": "images/mg_skin_puzzle",
                  "back": "images/_back_minigames",
                  "completeText": "cases.case_01.forensic_items.knife.states.new.minigame.complete",
                  "linkInfo": "01:03;02:03;03:01,02"
                },
                "cost": 1,
                "img_result": "images/skin_mg_icon",
                "title": "cases.case_01.forensic_items.knife.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "progress_tutorial": null
                  },
                  {
                    "show_movie": "m5"
                  },
                  {
                    "set_info_state": {
                      "type": "weapon",
                      "state": "analyzed"
                    }
                  },
                  {
                    "add_forensic_item": "leather_piece"
                  },
                  {
                    "update_killer_state": {
                      "clues": [
                        "gloves"
                      ],
                      "text": "cases.case_01.add_clues.gloves"
                    }
                  },
                  {
                    "add_custom_task": "mother_dialog"
                  },
                  {
                    "progress_chapter": "102_explored_forensic_item_knife"
                  },
                  {
                    "progress_tutorial": null
                  }
                ]
              }
            },
            "explored": {
              "img": "images/knife",
              "movie": "m_knife"
            }
          }
        },
        "leather_piece": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/skin_mg_icon",
              "movie": "m_leather_piece"
            }
          }
        },
        "note": {
          "initial_state": "new",
          "target_text": "cases.case_01.forensic_items.note.target_text",
          "states": {
            "new": {
              "img": "images/torn_note",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "back": "images/_back_minigames",
                  "path": "images/mg_puzzl_note",
                  "completeText": "cases.case_01.forensic_items.note.states.new.minigame.complete",
                  "linkInfo": "01:02,04,07;02:01,03,04;03:02,04,05;04:01,02,03,05,06;05:03,04,06;06:05,07,08;07:01,04,06,08;08:06,07"
                },
                "title": "cases.case_01.forensic_items.note.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/note",
                "on_complete": [
                  {
                    "show_movie": "m11"
                  },
                  {
                    "add_lab_item": "note"
                  },
                  {
                    "progress_chapter": "202_explored_forensic_item_note"
                  },
                  {
                    "progress_tutorial": null
                  }
                ]
              }
            },
            "explored": {
              "img": "images/note",
              "movie": "m_torn_note"
            }
          }
        },
        "note_done": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/note",
              "movie": "m_note"
            }
          }
        },
        "smartphone": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/smartphone",
              "movie": "m_smartphone"
            }
          }
        },
        "credit_card": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/credit_card",
              "movie": "m_credit_card"
            }
          }
        }
      },
      "lab_items": {
        "body": {
          "name": "cases.case_01.lab_items.body.name",
          "target_text": "cases.case_01.lab_items.body.target_text",
          "img": "images/dead_pic",
          "item_type": "medicals",
          "analyze_time": 20,
          "analyze_movie": "m3",
          "on_analyze": [
            {
              "progress_tutorial": null
            },
            {
              "set_info_state": {
                "type": "victim",
                "state": "analyzed"
              }
            },
            {
              "update_killer_state": {
                "clues": [
                  "left_handed"
                ],
                "text": "cases.case_01.add_clues.left_handed"
              }
            },
            {
              "set_scene_state": {
                "scene": "scene_1",
                "state": "2"
              }
            },
            {
              "add_forensic_item": "body"
            },
            {
              "progress_chapter": "101_explored_lab_item_body"
            },
            {
              "progress_tutorial": null
            }
          ]
        },
        "note": {
          "name": "cases.case_01.lab_items.note.name",
          "target_text": "cases.case_01.lab_items.note.target_text",
          "img": "images/note",
          "item_type": "medicals",
          "analyze_time": 300,
          "analyze_movie": "m12",
          "on_analyze": [
            {
              "check_transition": "accuse_player"
            },
            {
              "progress_chapter": "203_explored_lab_item_note"
            },
            {
              "progress_tutorial": null
            },
            {
              "add_forensic_item": "note_done"
            }
          ]
        },
        "smartphone": {
          "name": "cases.case_01.lab_items.smartphone.name",
          "target_text": "cases.case_01.lab_items.smartphone.target_text",
          "img": "images/smartphone",
          "item_type": "technics",
          "analyze_time": 300,
          "analyze_movie": "m13",
          "on_analyze": [
            {
              "add_forensic_item": "smartphone"
            },
            {
              "check_transition": "accuse_player"
            },
            {
              "update_suspect_state": {
                "suspect": "player",
                "alibi": false,
                "text": "cases.case_01.add_alibi.player"
              }
            },
            {
              "progress_chapter": "204_explored_lab_item_smartphone"
            },
            {
              "progress_tutorial": null
            }
          ]
        },
        "credit_card": {
          "name": "cases.case_01.lab_items.credit_card.name",
          "target_text": "cases.case_01.lab_items.credit_card.target_text",
          "img": "images/credit_card",
          "item_type": "hack",
          "analyze_time": 15,
          "analyze_movie": "m7",
          "on_analyze": [
            {
              "progress_tutorial": null
            },
            {
              "add_forensic_item": "credit_card"
            },
            {
              "update_suspect_state": {
                "suspect": "player",
                "clues": [
                  "ritual"
                ],
                "text": "cases.case_01.add_suspect_clues.player.ritual"
              }
            },
            {
              "init_arrest_state": null
            },
            {
              "progress_chapter": "105_explored_lab_item_credit_card"
            },
            {
              "progress_tutorial": null
            }
          ]
        }
      },
      "clues": {
        "left_handed": {
          "img": "images/lefty"
        },
        "gloves": {
          "img": "images/gloves"
        },
        "ritual": {
          "img": "images/ritual_symbol"
        }
      },
      "suspect_properties": {
        "prop_1": "age",
        "prop_2": "weight"
      },
      "suspects": {
        "player": {
          "clues": {
            "left_handed": {
              "img": "images/lefty",
              "match": true
            },
            "ritual": {
              "img": "images/ritual_symbol",
              "match": true
            },
            "gloves": {
              "img": "images/gloves",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_football",
              "portrait": "images/football_portrait",
              "title": "cases.case_01.suspects.player.states.default.title",
              "status": "cases.case_01.suspects.player.states.default.status",
              "prop_1": "cases.case_01.suspects.player.states.default.prop_1",
              "prop_2": "cases.case_01.suspects.player.states.default.prop_2",
              "target_text": "cases.case_01.suspects.player.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m14",
              "on_talk": [
                {
                  "progress_tutorial": null
                },
                {
                  "update_suspect_state": {
                    "suspect": "player",
                    "motive": true,
                    "text": "cases.case_01.add_motive.player"
                  }
                },
                {
                  "show_movie": "m15"
                },
                {
                  "set_suspect_state": {
                    "suspect": "player",
                    "state": "default"
                  }
                },
                {
                  "progress_chapter": "205_suspect_player_dialog_1"
                },
                {
                  "add_unlock_new_case_task": {
                    "case": "case_02",
                    "cost": 0,
                    "triggers": [
                      {
                        "progress_tutorial": null
                      }
                    ]
                  }
                },
                {
                  "progress_tutorial": null
                }
              ]
            }
          }
        },
        "musician": {
          "clues": {
            "ritual": {
              "img": "images/ritual_symbol",
              "match": true
            },
            "gloves": {
              "img": "images/gloves",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_musician",
              "portrait": "images/musician_portrait",
              "title": "cases.case_01.suspects.musician.states.default.title",
              "status": "cases.case_01.suspects.musician.states.default.status",
              "prop_1": "cases.case_01.suspects.musician.states.default.prop_1",
              "prop_2": "cases.case_01.suspects.musician.states.default.prop_2",
              "target_text": "cases.case_01.suspects.musician.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m6_1",
              "on_talk": [
                {
                  "progress_tutorial": null
                },
                {
                  "add_suspect": "player"
                },
                {
                  "update_suspect_state": {
                    "suspect": "player",
                    "clues": [
                      "left_handed",
                      "gloves"
                    ],
                    "text": "cases.case_01.add_suspect_clues.player.left_handed.gloves"
                  }
                },
                {
                  "add_lab_item": "credit_card"
                },
                {
                  "show_movie": "m6_2"
                },
                {
                  "progress_chapter": "104_suspect_musician_dialog_1"
                },
                {
                  "progress_tutorial": null
                }
              ]
            }
          }
        }
      },
      "info": {
        "victim": {
          "found": {
            "name": "cases.case_01.info.victim.found.name",
            "description": "cases.case_01.info.victim.found.description",
            "img": "images/victim_portrait"
          },
          "analyzed": {
            "name": "cases.case_01.info.victim.analyzed.name",
            "description": "cases.case_01.info.victim.analyzed.description",
            "img": "images/victim_portrait"
          }
        },
        "weapon": {
          "found": {
            "name": "cases.case_01.info.weapon.found.name",
            "description": "cases.case_01.info.weapon.found.description",
            "img": "images/knife"
          },
          "analyzed": {
            "name": "cases.case_01.info.weapon.analyzed.name",
            "description": "cases.case_01.info.weapon.analyzed.description",
            "img": "images/knife"
          }
        },
        "killer": {
          "arrested": {
            "name": "cases.case_01.info.killer.arrested.name",
            "description": "cases.case_01.info.killer.arrested.description",
            "img": "images/football_portrait"
          }
        }
      },
      "chapters": [
        {
          "size": 6,
          "img": "images/chapter_11",
          "name": "cases.case_01.chapters.1.name",
          "description": "cases.case_01.chapters.1.description",
          "on_start": []
        },
        {
          "size": 5,
          "img": "images/chapter_12",
          "name": "cases.case_01.chapters.2.name",
          "description": "cases.case_01.chapters.2.description",
          "description_end": "cases.case_01.chapters.2.description_end",
          "on_start": [
            {
              "progress_tutorial": null
            },
            {
              "show_movie": "m9"
            },
            {
              "open_new_scene": "scene_2"
            },
            {
              "set_scene_state": {
                "scene": "scene_2",
                "state": "1"
              }
            },
            {
              "progress_tutorial": null
            }
          ]
        }
      ],
      "on_start": [
        {
          "progress_tutorial": null
        },
        {
          "show_movie": "m1"
        },
        {
          "show_movie": "m1_1"
        },
        {
          "open_new_scene": "scene_1"
        },
        {
          "set_scene_state": {
            "scene": "scene_1",
            "state": "1"
          }
        },
        {
          "progress_tutorial": null
        }
      ],
      "arrest": {
        "killer": "player",
        "cost": 1,
        "on_success": [
          {
            "progress_tutorial": null
          },
          {
            "show_movie": "m8"
          },
          {
            "progress_chapter": "106_arrest_suspect_player"
          },
          {
            "set_info_state": {
              "type": "killer",
              "state": "arrested"
            }
          },
          {
            "open_new_scene": "bonus_1"
          },
          {
            "add_start_next_chapter_task": {
              "cost": 2
            }
          },
          {
            "progress_tutorial": null
          },
          {
            "progress_tutorial": null
          }
        ],
        "on_fail": [
          {
            "show_movie": "m_wrong_arrest"
          }
        ]
      },
      "transitions": {
        "accuse_player": {
          "preconditions": [
            {
              "lab_item_state": {
                "note": "done"
              }
            },
            {
              "lab_item_state": {
                "smartphone": "done"
              }
            }
          ],
          "on_complete": [
            {
              "set_suspect_state": {
                "suspect": "player",
                "state": "dialog_1"
              }
            }
          ]
        }
      },
      "custom_tasks": {
        "mother_dialog": {
          "cost": 1,
          "img": "images/mother_portrait",
          "action_text": "cases.case_01.custom_tasks.mother.action_text",
          "target_text": "cases.case_01.custom_tasks.mother.target_text",
          "on_click": [
            {
              "progress_tutorial": null
            },
            {
              "show_movie": "m6"
            },
            {
              "add_suspect": "musician"
            },
            {
              "update_suspect_state": {
                "suspect": "musician",
                "clues": [
                  "ritual",
                  "gloves"
                ],
                "text": "cases.case_01.add_suspect_clues.musician.ritual.gloves"
              }
            },
            {
              "set_suspect_state": {
                "suspect": "musician",
                "state": "dialog_1"
              }
            },
            {
              "progress_chapter": "103_custom_task_mother_talk"
            },
            {
              "progress_tutorial": null
            }
          ]
        }
      }
    },
    "case_02": {
      "schema_id": "case",
      "name": "cases.case_02.name",
      "description": "cases.case_02.description",
      "scene_order": [
        "scene_1",
        "scene_2",
        "bonus_1",
        "scene_3",
        "bonus_2"
      ],
      "scenes": {
        "scene_1": {
          "scores": [
            350000,
            700000,
            1100000,
            1800000,
            2200000
          ],
          "name": "cases.case_02.scenes.scene_1.name",
          "target_text": "cases.case_02.scenes.scene_1.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "office_backstreet",
          "img": "office_backstreet/thumb",
          "items": {
            "trash": {
              "name": "cases.case_02.scenes.scene_1.items.trash.name",
              "img": "images/trash",
              "layer": "musor_special"
            },
            "doorhandle": {
              "name": "cases.case_02.scenes.scene_1.items.doorhandle.name",
              "img": "images/door_handle",
              "layer": "dvernay_rucka_special"
            },
            "videocamera": {
              "name": "cases.case_02.scenes.scene_1.items.videocamera.name",
              "img": "images/camera",
              "layer": "kamera_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "videocamera"
              ],
              "on_complete": [
                {
                  "add_lab_item": "film"
                },
                {
                  "show_movie": "m2"
                },
                {
                  "progress_chapter": "101_explored_scene_1_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "doorhandle",
                "trash"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "doorhandle"
                },
                {
                  "add_forensic_item": "trash"
                },
                {
                  "show_movie": "m3_1"
                },
                {
                  "progress_chapter": "103_explored_scene_1_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_2": {
          "scores": [
            400000,
            700000,
            1100000,
            1800000,
            2200000
          ],
          "name": "cases.case_02.scenes.scene_2.name",
          "target_text": "cases.case_02.scenes.scene_2.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "office_of_the_victim4",
          "img": "office_of_the_victim4/thumb",
          "items": {
            "dictophone": {
              "name": "cases.case_02.scenes.scene_2.items.dictophone.name",
              "img": "images/dect",
              "layer": "diktofon"
            }
          },
          "states": {
            "1": {
              "items": [
                "dictophone"
              ],
              "on_complete": [
                {
                  "show_movie": "m9"
                },
                {
                  "progress_chapter": "110_explored_scene_2_state_1"
                },
                {
                  "check_transition": "end_chapter_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_3": {
          "scores": [
            600000,
            1100000,
            1800000,
            2400000,
            2800000
          ],
          "name": "cases.case_02.scenes.scene_3.name",
          "target_text": "cases.case_02.scenes.scene_3.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "victim_apptment",
          "img": "victim_apptment/thumb",
          "items": {
            "money": {
              "name": "cases.case_02.scenes.scene_3.items.money.name",
              "img": "images/cash",
              "layer": "Ulika_Sumka_special",
              "linked_layer": "Ulika_polovik_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "money"
              ],
              "on_complete": [
                {
                  "add_lab_item": "money"
                },
                {
                  "show_movie": "m13_1"
                },
                {
                  "progress_chapter": "205_explored_scene_3_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "bonus_1": {
          "scores": [
            400000,
            800000,
            1200000,
            1800000,
            2400000
          ],
          "name": "cases.case_02.scenes.bonus_1.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 3,
          "type": "puzzle",
          "path": "images/office_backstreet_puzzle",
          "img": "images/2_puzzle",
          "states": {
            "default": {}
          }
        },
        "bonus_2": {
          "scores": [
            400000,
            800000,
            1100000,
            1600000,
            2000000
          ],
          "name": "cases.case_02.scenes.bonus_2.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 10,
          "type": "hogTime",
          "path": "victim_apptment",
          "img": "images/2_time_attack",
          "items": {
            "doormat": {
              "name": "cases.case_02.scenes.scene_3.items.doormat.name",
              "img": "images/pillow",
              "layer": "Ulika_polovik_special",
              "linked_layer": "Ulika_Sumka_special"
            },
            "money": {
              "name": "cases.case_02.scenes.scene_3.items.money.name",
              "img": "images/cash",
              "layer": "Ulika_Sumka_special"
            }
          },
          "states": {
            "default": {}
          }
        }
      },
      "forensic_items": {
        "trash": {
          "initial_state": "new",
          "target_text": "cases.case_02.forensic_items.trash.target_text",
          "states": {
            "new": {
              "img": "images/trash",
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "path": "images/garbage",
                  "target": "images/wallet",
                  "trashCount": 60,
                  "radius": 400,
                  "completeText": "cases.case_02.forensic_items.trash.states.new.minigame.complete"
                },
                "title": "cases.case_02.forensic_items.trash.states.new.minigame.title",
                "img_result": "images/wallet",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m4"
                  },
                  {
                    "set_info_state": {
                      "type": "victim",
                      "state": "analyzed"
                    }
                  },
                  {
                    "progress_chapter": "111_explored_forensic_item_trash"
                  },
                  {
                    "check_transition": "end_chapter_1"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/wallet",
              "movie": "m_wallet"
            }
          }
        },
        "doorhandle": {
          "initial_state": "new",
          "target_text": "cases.case_02.forensic_items.doorhandle.target_text",
          "states": {
            "new": {
              "img": "images/door_handle",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "path": "images/minigame_doorhandle",
                  "back": "images/_back_minigames",
                  "target": "images/fingerprint1, images/fingerprint2, images/fingerprint3",
                  "count": 3,
                  "sizeX": 6,
                  "sizeY": 6,
                  "completeText": "cases.case_02.forensic_items.doorhandle.states.new.minigame.complete"
                },
                "title": "cases.case_02.forensic_items.doorhandle.states.new.minigame.title",
                "img_result": "images/fingerprint1",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m5"
                  },
                  {
                    "add_lab_item": "fingerprint"
                  },
                  {
                    "progress_chapter": "104_explored_forensic_item_doorhandle"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/door_handle",
              "movie": "m_doorhandle"
            }
          }
        },
        "voice": {
          "initial_state": "new",
          "target_text": "cases.case_02.forensic_items.voice.target_text",
          "states": {
            "new": {
              "img": "images/voice_record",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/voice_sample01, images/voice_sample02, images/voice_sample03, images/voice_sample04, images/voice_sample05",
                  "sizeX": 5,
                  "sizeY": 2,
                  "completeText": "cases.case_02.forensic_items.voice.states.new.minigame.complete"
                },
                "title": "cases.case_02.forensic_items.voice.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m18"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "gregory_jarvi",
                      "motive": true,
                      "text": "cases.case_02.add_motive.gregory_jarvi"
                    }
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "gregory_jarvi",
                      "state": "dialog_2"
                    }
                  },
                  {
                    "progress_chapter": "303_explored_forensic_item_voice"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/voice_record",
              "movie": "m_voice"
            }
          }
        },
        "film": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/camera",
              "movie": "m_film"
            }
          }
        },
        "priest_alibi": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/surv_record",
              "movie": "m_priest_alibi"
            }
          }
        },
        "dictophone": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/dect",
              "movie": "m_dictophone"
            }
          }
        },
        "fingerprint": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/fingerprint1",
              "movie": "m_fingerprint"
            }
          }
        },
        "money": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/cash",
              "movie": "m_money"
            }
          }
        },
        "camera_recording": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/record",
              "movie": "m_camera_recording"
            }
          }
        }
      },
      "lab_items": {
        "film": {
          "name": "cases.case_02.lab_items.film.name",
          "target_text": "cases.case_02.lab_items.film.target_text",
          "img": "images/camera",
          "item_type": "technics",
          "analyze_time": 120,
          "analyze_movie": "m3",
          "on_analyze": [
            {
              "set_info_state": {
                "type": "weapon",
                "state": "found"
              }
            },
            {
              "add_forensic_item": "film"
            },
            {
              "update_killer_state": {
                "clues": [
                  "man",
                  "bruise"
                ],
                "text": "cases.case_02.add_clues.man.bruise"
              }
            },
            {
              "set_scene_state": {
                "scene": "scene_1",
                "state": "2"
              }
            },
            {
              "progress_chapter": "102_explored_lab_item_film"
            }
          ]
        },
        "priest_alibi": {
          "name": "cases.case_02.lab_items.priest_alibi.name",
          "target_text": "cases.case_02.lab_items.priest_alibi.target_text",
          "img": "images/surv_record",
          "item_type": "technics",
          "analyze_time": 3600,
          "analyze_movie": "m7",
          "on_analyze": [
            {
              "progress_chapter": "107_lab_item_check_alibi_1_stanley_priest"
            },
            {
              "set_suspect_state": {
                "suspect": "stanley_priest",
                "state": "dialog_2"
              }
            },
            {
              "add_forensic_item": "priest_alibi"
            }
          ]
        },
        "dictophone": {
          "name": "cases.case_02.lab_items.dictophone.name",
          "target_text": "cases.case_02.lab_items.dictophone.target_text",
          "img": "images/dect",
          "item_type": "technics",
          "analyze_time": 14400,
          "analyze_movie": "m10",
          "on_analyze": [
            {
              "update_killer_state": {
                "clues": [
                  "prison"
                ],
                "text": "cases.case_02.add_clues.prison"
              }
            },
            {
              "add_forensic_item": "dictophone"
            },
            {
              "progress_chapter": "201_explored_lab_item_dictophone"
            },
            {
              "add_custom_task": "prison_contacts"
            }
          ]
        },
        "fingerprint": {
          "name": "cases.case_02.lab_items.fingerprint.name",
          "target_text": "cases.case_02.lab_items.fingerprint.target_text",
          "img": "images/fingerprint1",
          "item_type": "technics",
          "analyze_time": 1200,
          "analyze_movie": "m5_1",
          "on_analyze": [
            {
              "add_suspect": "stanley_priest"
            },
            {
              "set_suspect_state": {
                "suspect": "stanley_priest",
                "state": "dialog_1"
              }
            },
            {
              "add_forensic_item": "fingerprint"
            },
            {
              "progress_chapter": "105_explored_lab_item_fingerprint"
            }
          ]
        },
        "money": {
          "name": "cases.case_02.lab_items.money.name",
          "target_text": "cases.case_02.lab_items.money.target_text",
          "img": "images/cash",
          "item_type": "docs",
          "analyze_time": 10800,
          "analyze_movie": "m13_2",
          "on_analyze": [
            {
              "progress_chapter": "206_explored_lab_item_money"
            },
            {
              "add_forensic_item": "money"
            },
            {
              "add_start_next_chapter_task": {
                "cost": 1
              }
            }
          ]
        },
        "camera_recording": {
          "name": "cases.case_02.lab_items.camera_recording.name",
          "target_text": "cases.case_02.lab_items.camera_recording.target_text",
          "img": "images/record",
          "item_type": "technics",
          "analyze_time": 25200,
          "analyze_movie": "m20",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "gregory_jarvi",
                "alibi": false,
                "text": "cases.case_02.add_alibi.gregory_jarvi"
              }
            },
            {
              "add_forensic_item": "camera_recording"
            },
            {
              "progress_chapter": "305_explored_forensic_item_camera_recording"
            },
            {
              "init_arrest_state": null
            }
          ]
        }
      },
      "clues": {
        "man": {
          "img": "images/male"
        },
        "bruise": {
          "img": "images/fingal"
        },
        "prison": {
          "img": "images/urka"
        }
      },
      "suspect_properties": {
        "prop_1": "age",
        "prop_2": "weight"
      },
      "suspects": {
        "stanley_priest": {
          "clues": {
            "man": {
              "match": true
            },
            "bruise": {
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_bookmaker",
              "portrait": "images/bookmaker_portret",
              "title": "cases.case_02.suspects.stanley_priest.states.default.title",
              "status": "cases.case_02.suspects.stanley_priest.states.default.status",
              "prop_1": "cases.case_02.suspects.stanley_priest.states.default.prop_1",
              "prop_2": "cases.case_02.suspects.stanley_priest.states.default.prop_2",
              "target_text": "cases.case_02.suspects.stanley_priest.states.default.target_text"
            },
            "dialog_1": {
              "action_text": "tasks.talk.action_text2",
              "talk_movie": "m6",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "stanley_priest",
                    "clues": [
                      "bruise",
                      "man"
                    ],
                    "motive": true,
                    "text": "cases.case_02.add_suspect_clues.stanley_priest.bruise.man"
                  }
                },
                {
                  "add_lab_item": "priest_alibi"
                },
                {
                  "progress_chapter": "106_suspect_stanley_priest_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "action_text": "tasks.talk.action_text2",
              "talk_movie": "m8",
              "on_talk": [
                {
                  "progress_chapter": "108_suspect_stanley_priest_dialog_2"
                },
                {
                  "add_custom_task": "priest_alibi_2"
                }
              ]
            }
          }
        },
        "scott_pavi": {
          "clues": {
            "man": {
              "match": true
            },
            "bruise": {
              "match": true
            },
            "prison": {
              "img": "images/urka",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_scott",
              "portrait": "images/scott_portret",
              "title": "cases.case_02.suspects.scott_pavi.states.default.title",
              "status": "cases.case_02.suspects.scott_pavi.states.default.status",
              "prop_1": "cases.case_02.suspects.scott_pavi.states.default.prop_1",
              "prop_2": "cases.case_02.suspects.scott_pavi.states.default.prop_2",
              "target_text": "cases.case_02.suspects.scott_pavi.states.default.target_text"
            },
            "dialog_1": {
              "action_text": "tasks.talk.action_text2",
              "talk_movie": "m12",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "scott_pavi",
                    "clues": [
                      "bruise"
                    ],
                    "motive": true,
                    "text": "cases.case_02.add_suspect_clues.scott_pavi.bruise"
                  }
                },
                {
                  "progress_chapter": "203_suspect_scott_pavi_dialog_1"
                },
                {
                  "add_custom_task": "pavi_alibi"
                }
              ]
            },
            "dialog_2": {
              "action_text": "tasks.talk.action_text2",
              "talk_movie": "m15",
              "on_talk": [
                {
                  "add_suspect": "gregory_jarvi"
                },
                {
                  "set_suspect_state": {
                    "suspect": "gregory_jarvi",
                    "state": "dialog_1"
                  }
                },
                {
                  "update_suspect_state": {
                    "suspect": "gregory_jarvi",
                    "clues": [
                      "prison",
                      "man"
                    ],
                    "text": "cases.case_02.add_suspect_clues.gregory_jarvi.prison.man"
                  }
                },
                {
                  "progress_chapter": "301_suspect_scott_pavi_dialog_2"
                }
              ]
            },
            "dialog_3": {
              "action_text": "tasks.talk.action_text2",
              "talk_movie": "m26",
              "on_talk": [
                {
                  "progress_chapter": "404_suspect_scott_pavi_dialog_3"
                },
                {
                  "add_custom_task": "donavan_dialog_2"
                }
              ]
            }
          }
        },
        "gregory_jarvi": {
          "clues": {
            "man": {
              "match": true
            },
            "bruise": {
              "match": true
            },
            "prison": {
              "img": "images/urka",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_bandit",
              "portrait": "images/jarvi_portret",
              "title": "cases.case_02.suspects.gregory_jarvi.states.default.title",
              "status": "cases.case_02.suspects.gregory_jarvi.states.default.status",
              "prop_1": "cases.case_02.suspects.gregory_jarvi.states.default.prop_1",
              "prop_2": "cases.case_02.suspects.gregory_jarvi.states.default.prop_2",
              "target_text": "cases.case_02.suspects.gregory_jarvi.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m16",
              "on_talk": [
                {
                  "add_forensic_item": "voice"
                },
                {
                  "update_suspect_state": {
                    "suspect": "gregory_jarvi",
                    "clues": [
                      "bruise"
                    ],
                    "text": "cases.case_02.add_suspect_clues.gregory_jarvi.bruise"
                  }
                },
                {
                  "progress_chapter": "302_suspect_gregory_jarvi_dialog_1"
                },
                {
                  "show_movie": "m17"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m19",
              "on_talk": [
                {
                  "add_lab_item": "camera_recording"
                },
                {
                  "show_movie": "m19_1"
                },
                {
                  "progress_chapter": "304_suspect_gregory_jarvi_dialog_2"
                }
              ]
            },
            "dialog_3": {
              "talk_movie": "m23",
              "on_talk": [
                {
                  "progress_chapter": "401_suspect_gregory_jarvi_dialog_3"
                },
                {
                  "add_custom_task": "donavan_dialog_1"
                }
              ]
            }
          }
        }
      },
      "info": {
        "victim": {
          "analyzed": {
            "name": "cases.case_02.info.victim.analyzed.name",
            "description": "cases.case_02.info.victim.analyzed.description",
            "img": "images/donavan_portret"
          }
        },
        "weapon": {
          "found": {
            "name": "cases.case_02.info.weapon.found.name",
            "description": "cases.case_02.info.weapon.found.description",
            "img": "images/verevka"
          }
        },
        "killer": {
          "arrested": {
            "name": "cases.case_02.info.killer.arrested.name",
            "description": "cases.case_02.info.killer.arrested.description",
            "img": "images/jarvi_portret"
          }
        }
      },
      "chapters": [
        {
          "size": 11,
          "img": "images/chapter_21",
          "name": "cases.case_02.chapters.1.name",
          "description": "cases.case_02.chapters.1.description",
          "on_start": []
        },
        {
          "size": 6,
          "img": "images/chapter_22",
          "name": "cases.case_02.chapters.2.name",
          "description": "cases.case_02.chapters.2.description",
          "on_start": [
            {
              "add_lab_item": "dictophone"
            },
            {
              "show_movie": "m9_1"
            }
          ]
        },
        {
          "size": 6,
          "img": "images/chapter_23",
          "name": "cases.case_02.chapters.3.name",
          "description": "cases.case_02.chapters.3.description",
          "on_start": [
            {
              "show_movie": "m14"
            },
            {
              "set_suspect_state": {
                "suspect": "scott_pavi",
                "state": "dialog_2"
              }
            }
          ]
        },
        {
          "size": 5,
          "img": "images/chapter_24",
          "name": "cases.case_02.chapters.4.name",
          "description": "cases.case_02.chapters.4.description",
          "description_end": "cases.case_02.chapters.4.description_end",
          "on_start": [
            {
              "show_movie": "m22"
            },
            {
              "set_suspect_state": {
                "suspect": "gregory_jarvi",
                "state": "dialog_3"
              }
            }
          ]
        }
      ],
      "on_start": [
        {
          "drop_tutorial": null
        },
        {
          "show_movie": "m1"
        },
        {
          "open_new_scene": "scene_1"
        },
        {
          "set_scene_state": {
            "scene": "scene_1",
            "state": "1"
          }
        }
      ],
      "arrest": {
        "killer": "gregory_jarvi",
        "on_success": [
          {
            "show_movie": "m21"
          },
          {
            "progress_chapter": "306_arrest_suspect_gregory_jarvi"
          },
          {
            "set_info_state": {
              "type": "killer",
              "state": "arrested"
            }
          },
          {
            "add_start_next_chapter_task": {
              "cost": 1
            }
          }
        ],
        "on_fail": [
          {
            "show_movie": "m_wrong_arrest"
          }
        ]
      },
      "transitions": {
        "end_chapter_1": {
          "preconditions": [
            {
              "scene_state": {
                "scene_2": "default"
              }
            },
            {
              "forensic_item_state": {
                "trash": "explored"
              }
            },
            {
              "suspect_state_talked": {
                "stanley_priest": "dialog_2"
              }
            }
          ],
          "on_complete": [
            {
              "add_start_next_chapter_task": {
                "cost": 1
              }
            }
          ]
        }
      },
      "deductions": {
        "donavan": {
          "suspect_img": "images/char_victim_afraid",
          "background_img": "images/_back_lab"
        }
      },
      "custom_tasks": {
        "prison_contacts": {
          "name": "prison_contacts",
          "cost": 1,
          "img": "images/donavan_portret",
          "action_text": "cases.case_02.custom_tasks.prison_contacts.action_text",
          "target_text": "cases.case_02.custom_tasks.prison_contacts.target_text",
          "on_click": [
            {
              "show_movie": "m11"
            },
            {
              "add_suspect": "scott_pavi"
            },
            {
              "set_suspect_state": {
                "suspect": "scott_pavi",
                "state": "dialog_1"
              }
            },
            {
              "update_suspect_state": {
                "suspect": "scott_pavi",
                "clues": [
                  "man",
                  "prison"
                ],
                "text": "cases.case_02.add_suspect_clues.scott_pavi.man.prison"
              }
            },
            {
              "progress_chapter": "202_custom_task_prison_contacts"
            }
          ]
        },
        "priest_alibi_2": {
          "cost": 1,
          "img": "images/bookmaker_portret",
          "action_text": "cases.case_02.custom_tasks.alibi.action_text",
          "target_text": "cases.case_02.custom_tasks.priest_alibi.target_text",
          "on_click": [
            {
              "show_movie": "m8_1"
            },
            {
              "update_suspect_state": {
                "suspect": "stanley_priest",
                "alibi": true,
                "text": "cases.case_02.add_alibi.stanley_priest"
              }
            },
            {
              "open_new_scene": "scene_2"
            },
            {
              "set_scene_state": {
                "scene": "scene_2",
                "state": "1"
              }
            },
            {
              "progress_chapter": "109_custom_task_check_alibi_2_stanley_priest"
            },
            {
              "show_movie": "m8_2"
            }
          ]
        },
        "pavi_alibi": {
          "cost": 1,
          "img": "images/scott_portret",
          "action_text": "cases.case_02.custom_tasks.alibi.action_text",
          "target_text": "cases.case_02.custom_tasks.Pavi_alibi.target_text",
          "on_click": [
            {
              "show_movie": "m13"
            },
            {
              "update_suspect_state": {
                "suspect": "scott_pavi",
                "alibi": true,
                "text": "cases.case_02.add_alibi.scott_pavi"
              }
            },
            {
              "open_new_scene": "scene_3"
            },
            {
              "set_scene_state": {
                "scene": "scene_3",
                "state": "1"
              }
            },
            {
              "progress_chapter": "204_custom_task_check_pavi_alibi"
            }
          ]
        },
        "donavan_dialog_1": {
          "cost": 1,
          "img": "images/donavan_portret",
          "action_text": "cases.case_02.custom_tasks.donavan_dialog_1.action_text",
          "target_text": "cases.case_02.custom_tasks.donavan_dialog_1.target_text",
          "on_click": [
            {
              "show_movie": "m24"
            },
            {
              "add_custom_task": "donavan_deduction"
            },
            {
              "progress_chapter": "402_custom_task_donavan_dialog_1"
            }
          ]
        },
        "donavan_dialog_2": {
          "cost": 1,
          "img": "images/donavan_portret",
          "action_text": "cases.case_02.custom_tasks.donavan_dialog_2.action_text",
          "target_text": "cases.case_02.custom_tasks.donavan_dialog_2.target_text",
          "on_click": [
            {
              "show_movie": "m27"
            },
            {
              "show_movie": "m28"
            },
            {
              "set_suspect_state": {
                "suspect": "scott_pavi",
                "state": "default"
              }
            },
            {
              "set_suspect_state": {
                "suspect": "gregory_jarvi",
                "state": "default"
              }
            },
            {
              "progress_chapter": "405_custom_task_donavan_dialog_2"
            },
            {
              "add_unlock_new_case_task": {
                "case": "case_03",
                "cost": 1
              }
            }
          ]
        },
        "donavan_deduction": {
          "cost": 1,
          "img": "images/donavan_portret",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_02.custom_tasks.donavan_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "donavan"
            },
            {
              "show_movie": "m25"
            },
            {
              "set_suspect_state": {
                "suspect": "scott_pavi",
                "state": "dialog_3"
              }
            },
            {
              "progress_chapter": "403_custom_tusk_donavan_dedution"
            }
          ]
        }
      }
    },
    "case_03": {
      "schema_id": "case",
      "name": "cases.case_03.name",
      "description": "cases.case_03.description",
      "scene_order": [
        "scene_1",
        "scene_2",
        "bonus_1",
        "scene_3",
        "scene_4",
        "scene_5",
        "scene_6",
        "bonus_3"
      ],
      "scenes": {
        "scene_1": {
          "scores": [
            800000,
            1600000,
            2200000,
            2900000,
            3700000
          ],
          "name": "cases.case_03.scenes.scene_1.name",
          "target_text": "cases.case_03.scenes.scene_1.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_swimming_pool_at_villa_final",
          "img": "hog_swimming_pool_at_villa_final/thumb",
          "items": {
            "body": {
              "name": "cases.case_03.scenes.scene_1.items.body.name",
              "img": "images/body",
              "layer": "corpse_special"
            },
            "screws": {
              "name": "cases.case_03.scenes.scene_1.items.screws.name",
              "img": "images/bolts",
              "layer": "bolty_special"
            },
            "pool_filter": {
              "name": "cases.case_03.scenes.scene_1.items.pool_filter.name",
              "img": "images/filter",
              "layer": "filter_special",
              "linked_layer": "reshetka_on_bottom"
            },
            "tree_leaves": {
              "name": "cases.case_03.scenes.scene_1.items.tree_leaves.name",
              "img": "images/leaves",
              "layer": "tree_leaves"
            }
          },
          "states": {
            "1": {
              "items": [
                "body",
                "screws"
              ],
              "on_complete": [
                {
                  "add_lab_item": "body"
                },
                {
                  "add_lab_item": "screws"
                },
                {
                  "show_movie": "m3"
                },
                {
                  "progress_chapter": "101_explored_scene_1_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "pool_filter"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "pool_filter"
                },
                {
                  "add_forensic_item": "reshetka_on_bottom"
                },
                {
                  "show_movie": "m26_1"
                },
                {
                  "progress_chapter": "210_explored_scene_1_state_2"
                }
              ]
            },
            "3": {
              "items": [
                "tree_leaves"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "tree_leaves"
                },
                {
                  "show_movie": "m36_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_2": {
          "scores": [
            700000,
            1900000,
            2500000,
            3200000,
            4000000
          ],
          "name": "cases.case_03.scenes.scene_2.name",
          "target_text": "cases.case_03.scenes.scene_2.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_livingroom_at_villa_fin",
          "img": "hog_livingroom_at_villa_fin/thumb",
          "items": {
            "briefcase": {
              "name": "cases.case_03.scenes.scene_2.items.briefcase.name",
              "img": "images/case",
              "layer": "suitcase_special"
            },
            "safe": {
              "name": "cases.case_03.scenes.scene_2.items.safe.name",
              "img": "images/safe",
              "layer": "safe_special",
              "linked_layer": "picture_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "briefcase"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "briefcase"
                },
                {
                  "show_movie": "m7_1"
                }
              ]
            },
            "2": {
              "items": [
                "safe"
              ],
              "on_complete": [
                {
                  "show_movie": "m33"
                },
                {
                  "add_lab_item": "safe"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_3": {
          "scores": [
            800000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_03.scenes.scene_3.name",
          "target_text": "cases.case_03.scenes.scene_3.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_bedroom_at_villa_Fin",
          "img": "hog_bedroom_at_villa_Fin/thumb",
          "items": {
            "bedclothes": {
              "name": "cases.case_03.scenes.scene_3.items.bedclothes.name",
              "img": "images/prostinya",
              "layer": "prostin_special"
            },
            "swimsuit": {
              "name": "cases.case_03.scenes.scene_3.items.swimsuit.name",
              "img": "images/black_kupalnik",
              "layer": "bra_special",
              "linked_layer": "pillow_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "bedclothes"
              ],
              "on_complete": [
                {
                  "show_movie": "m29_2"
                },
                {
                  "add_lab_item": "bedclothes"
                },
                {
                  "progress_chapter": "301_explored_scene_3_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "swimsuit"
              ],
              "on_complete": [
                {
                  "show_movie": "m34_1"
                },
                {
                  "add_lab_item": "swimsuit"
                },
                {
                  "progress_chapter": "305_explored_scene_3_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_4": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_03.scenes.scene_4.name",
          "target_text": "cases.case_03.scenes.scene_4.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_det_coof",
          "img": "hog_det_coof/thumb",
          "items": {
            "laptop": {
              "name": "cases.case_03.scenes.scene_4.items.laptop.name",
              "img": "images/notebook",
              "layer": "special_notebook"
            },
            "jessica_photo": {
              "name": "cases.case_03.scenes.scene_4.items.jessica_photo.name",
              "img": "images/jess_photo",
              "layer": "special_photo"
            }
          },
          "states": {
            "1": {
              "items": [
                "laptop",
                "jessica_photo"
              ],
              "on_complete": [
                {
                  "show_movie": "m10"
                },
                {
                  "add_lab_item": "laptop"
                },
                {
                  "add_forensic_item": "jessica_photo"
                },
                {
                  "progress_chapter": "107_explored_scene_4_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_5": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_03.scenes.scene_5.name",
          "target_text": "cases.case_03.scenes.scene_5.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_det_btq_fin",
          "img": "hog_det_btq_fin/thumb",
          "items": {
            "black_dress": {
              "name": "cases.case_03.scenes.scene_5.items.black_dress.name",
              "img": "images/black_dress",
              "layer": "dress_special"
            },
            "trash": {
              "name": "cases.case_03.scenes.scene_5.items.trash.name",
              "img": "images/torn_photo",
              "layer": "trash_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "trash"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "torn_photo"
                },
                {
                  "show_movie": "m20"
                },
                {
                  "progress_chapter": "202_explored_scene_5_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "black_dress"
              ],
              "on_complete": [
                {
                  "show_movie": "m27_1"
                },
                {
                  "add_forensic_item": "mirandas_dress"
                },
                {
                  "progress_chapter": "212_explored_scene_5_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_6": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_03.scenes.scene_6.name",
          "target_text": "cases.case_03.scenes.scene_6.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_cabinet_realtor",
          "img": "hog_cabinet_realtor/thumb",
          "items": {
            "pool_contract": {
              "name": "cases.case_03.scenes.scene_6.items.pool_contract.name",
              "img": "images/contract",
              "layer": "list_special"
            },
            "shredded_doc": {
              "name": "cases.case_03.scenes.scene_6.items.shredded_doc.name",
              "img": "images/shredded_doc",
              "layer": "shredder_special"
            },
            "disk_special": {
              "name": "cases.case_03.scenes.scene_6.items.disk_special.name",
              "img": "images/disk_special",
              "layer": "disk_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "pool_contract",
                "disk_special"
              ],
              "on_complete": [
                {
                  "show_movie": "m23_1"
                },
                {
                  "add_forensic_item": "pool_contract"
                },
                {
                  "add_lab_item": "disk_special"
                },
                {
                  "progress_chapter": "206_explored_scene_6_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "shredded_doc"
              ],
              "on_complete": [
                {
                  "show_movie": "m43_1"
                },
                {
                  "add_forensic_item": "shredded_doc"
                },
                {
                  "progress_chapter": "404_explored_scene_6_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "bonus_1": {
          "scores": [
            700000,
            1500000,
            2100000,
            2800000,
            3600000
          ],
          "name": "cases.case_03.scenes.bonus_1.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 3,
          "type": "puzzle",
          "path": "images/swimming_pool_puzzle",
          "img": "images/3_puzzle",
          "states": {
            "default": {}
          }
        },
        "bonus_3": {
          "scores": [
            2000000,
            2500000,
            3100000,
            3800000,
            4600000
          ],
          "name": "cases.case_03.scenes.bonus_3.name",
          "target_text": "cases.case_03.scenes.bonus_3.target_text",
          "unlock_text": "sceneLockText",
          "type": "hogDiff",
          "path": "hog_livingroom_at_villa_fin",
          "img": "images/3_diff",
          "items": {
            "briefcase": {
              "name": "cases.case_03.scenes.scene_2.items.briefcase.name",
              "img": "images/case",
              "layer": "suitcase_special"
            },
            "safe": {
              "name": "cases.case_03.scenes.scene_2.items.safe.name",
              "img": "images/safe",
              "layer": "safe_special"
            },
            "picture_special": {
              "name": "cases.case_03.scenes.scene_2.items.picture_special.name",
              "img": "images/picture",
              "layer": "picture_special"
            }
          },
          "states": {
            "1": {
              "on_complete": [
                {
                  "show_movie": "m25"
                },
                {
                  "progress_chapter": "216_explored_bonus_scene_3_state_1"
                },
                {
                  "check_transition": "end_chapter_2"
                }
              ]
            },
            "default": {}
          }
        }
      },
      "forensic_items": {
        "briefcase": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.briefcase.target_text",
          "states": {
            "new": {
              "img": "images/case",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/mg_phone_number",
                  "path": "images/stationery_mg",
                  "trashCount": 80,
                  "radius": 400,
                  "completeText": "cases.case_03.forensic_items.briefcase.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.briefcase.states.new.minigame.title",
                "img_result": "images/phone_number",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m7_2"
                  },
                  {
                    "add_lab_item": "phone_number"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/case",
              "wrapped": false,
              "movie": "m_briefcase"
            }
          }
        },
        "jessica_photo": {
          "initial_state": "explored",
          "target_text": "cases.case_03.forensic_items.jessica_photo.target_text",
          "states": {
            "explored": {
              "img": "images/jess_photo",
              "movie": "m_jessica_photo"
            }
          }
        },
        "torn_photo": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.torn_photo.target_text",
          "states": {
            "new": {
              "img": "images/torn_photo",
              "target_text": "cases.case_03.forensic_items.torn_photo.target_text",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "back": "images/_back_minigames",
                  "path": "images/porn_photo_mg",
                  "completeText": "cases.case_03.forensic_items.torn_photo.states.new.minigame.complete",
                  "linkInfo": "Layer_17:Layer_18,Layer_16;Layer_12:Layer_15,Layer_11,Layer_13;Layer_14:Layer_15,Layer_18,Layer_13,Layer_16;Layer_15:Layer_12,Layer_14,Layer_18,Layer_11,Layer_13;Layer_18:Layer_17,Layer_14,Layer_15,Layer_16;Layer_11:Layer_12,Layer_15;Layer_13:Layer_12,Layer_14,Layer_15;Layer_16:Layer_17,Layer_14,Layer_18"
                },
                "title": "cases.case_03.forensic_items.torn_photo.states.new.minigame.title",
                "img_result": "images/porno",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m21"
                  },
                  {
                    "progress_chapter": "203_explored_forensic_item_torn_photo"
                  },
                  {
                    "add_forensic_item": "porno_back"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/porno",
              "movie": "m_torn_photo"
            }
          }
        },
        "porno_back": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.torn_photo.target_text",
          "states": {
            "new": {
              "img": "images/porno_back",
              "target_text": "cases.case_03.forensic_items.miranda_photo.target_text",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/graph1, images/graph2, images/graph3, images/graph4, images/graph5",
                  "sizeX": 5,
                  "sizeY": 2,
                  "completeText": "cases.case_03.forensic_items.miranda_photo.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.miranda_photo.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m22"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "realtor",
                      "motive": true,
                      "text": "cases.case_03.add_motive.realtor"
                    }
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "realtor",
                      "state": "dialog_1"
                    }
                  },
                  {
                    "progress_chapter": "204_explored_forensic_item_porno_back"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/porno_back",
              "movie": "m_porno_back"
            }
          }
        },
        "pool_filter": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.pool_filter.target_text",
          "states": {
            "new": {
              "img": "images/filter",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/minigames_filter",
                  "target": "images/straza",
                  "count": 1,
                  "sizeX": 4,
                  "sizeY": 5,
                  "completeText": "cases.case_03.forensic_items.pool_filter.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.pool_filter.states.new.minigame.title",
                "img_result": "images/straza",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m27"
                  },
                  {
                    "update_killer_state": {
                      "clues": [
                        "termostraza"
                      ],
                      "text": "cases.case_03.add_clues.termostraza"
                    }
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "jack_white",
                      "clues": [
                        "termostraza"
                      ],
                      "text": "cases.case_03.add_suspect_clues.jack_white.termostraza"
                    }
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_5",
                      "state": "2"
                    }
                  },
                  {
                    "add_forensic_item": "straza"
                  },
                  {
                    "progress_chapter": "211_explored_forensic_item_pool_filter"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/filter",
              "movie": "m_pool_filter"
            }
          }
        },
        "reshetka_on_bottom": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/fence",
              "movie": "m_reshetka_on_bottom"
            }
          }
        },
        "mirandas_dress": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.mirandas_dress.target_text",
          "states": {
            "new": {
              "img": "images/black_dress",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_mirandas_dress",
                  "target": "images/straza",
                  "count": 1,
                  "sizeX": 5,
                  "sizeY": 5,
                  "completeText": "cases.case_03.forensic_items.mirandas_dress.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.mirandas_dress.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/straza",
                "on_complete": [
                  {
                    "show_movie": "m27_2"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "miranda",
                      "clues": [
                        "termostraza"
                      ],
                      "text": "cases.case_03.add_suspect_clues.miranda.termostraza"
                    }
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "miranda",
                      "state": "dialog_2"
                    }
                  },
                  {
                    "progress_chapter": "213_explored_forensic_item_mirandas_dress"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/black_dress",
              "movie": "m_mirandas_dress"
            }
          }
        },
        "diving_photo": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.diving_photo.target_text",
          "states": {
            "new": {
              "img": "images/mg_daiv",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_daiv_fon",
                  "target": "images/mg_daiv1, images/mg_daiv2",
                  "count": 2,
                  "sizeX": 4,
                  "sizeY": 5,
                  "completeText": "cases.case_03.forensic_items.diving_photo.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.diving_photo.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/mg_daiv",
                "on_complete": [
                  {
                    "show_movie": "m34"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "jessica",
                      "clues": [
                        "swimming_ability"
                      ],
                      "text": "cases.case_03.add_suspect_clues.jessica.swimming_ability"
                    }
                  },
                  {
                    "progress_chapter": "308_explored_forensic_item_diving_photo"
                  },
                  {
                    "check_transition": "open_scene_1_3"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/mg_daiv",
              "movie": "m_diving_photo"
            }
          }
        },
        "tree_leaves": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.tree_leaves.target_text",
          "states": {
            "new": {
              "img": "images/leaves",
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/lens_mg",
                  "path": "images/tree_leaves",
                  "trashCount": 30,
                  "radius": 400,
                  "completeText": "cases.case_03.forensic_items.tree_leaves.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.tree_leaves.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/lens",
                "on_complete": [
                  {
                    "show_movie": "m36_2"
                  },
                  {
                    "add_lab_item": "contact_lens"
                  },
                  {
                    "progress_chapter": "309_explored_forensic_item_tree_leaves"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/leaves",
              "movie": "m_tree_leaves"
            }
          }
        },
        "livingroom_photo": {
          "initial_state": "new",
          "states": {
            "new": {
              "img": "images/livingroom_photo",
              "target_text": "cases.case_03.forensic_items.livingroom_photo.target_text",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/vase, images/mask, images/statue, images/picture, images/pharao",
                  "sizeX": 5,
                  "sizeY": 2,
                  "completeText": "cases.case_03.forensic_items.livingroom_photo.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.livingroom_photo.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m43"
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_6",
                      "state": "2"
                    }
                  },
                  {
                    "progress_chapter": "402_explored_forensic_item_livingroom_photo"
                  },
                  {
                    "add_forensic_item": "opis"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/livingroom_photo",
              "movie": "m_livingroom_photo"
            }
          }
        },
        "opis": {
          "initial_state": "new",
          "states": {
            "new": {
              "img": "images/opis",
              "target_text": "cases.case_03.forensic_items.opis.target_text",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_gostinaya_fon",
                  "target": "images/vase, images/mask, images/statue",
                  "count": 3,
                  "sizeX": 15,
                  "sizeY": 15,
                  "completeText": "cases.case_03.forensic_items.opis.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.opis.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m46"
                  },
                  {
                    "progress_chapter": "403_explored_forensic_item_opis"
                  },
                  {
                    "check_transition": "end_chapter_4"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/opis",
              "movie": "m_opis"
            }
          }
        },
        "shredded_doc": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.shredded_doc.target_text",
          "states": {
            "new": {
              "img": "images/shredded_doc",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "back": "images/_back_minigames",
                  "path": "images/shredder_mg",
                  "completeText": "cases.case_03.forensic_items.shredded_doc.states.new.minigame.complete",
                  "linkInfo": "1:2;2:1,3;3:2,4;4:3,5;5:4,6;6:5,7;7:6,8;8:7,9;9:8,10;10:9,11;11:10,12;12:11"
                },
                "title": "cases.case_03.forensic_items.shredded_doc.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/houses_for_sale",
                "on_complete": [
                  {
                    "show_movie": "m44"
                  },
                  {
                    "add_lab_item": "houses_for_sale"
                  },
                  {
                    "progress_chapter": "405_explored_forensic_item_shredded_doc"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/shredded_doc",
              "movie": "m_shredded_doc"
            }
          }
        },
        "keyboard": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.keyboard.target_text",
          "states": {
            "new": {
              "img": "images/keyboard",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_keyboard_fon",
                  "target": "images/fingerprint4, images/fingerprint5, images/fingerprint6",
                  "count": 3,
                  "sizeX": 10,
                  "sizeY": 5,
                  "completeText": "cases.case_03.forensic_items.keyboard.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.keyboard.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/fingerprint4",
                "on_complete": [
                  {
                    "show_movie": "m11_1"
                  },
                  {
                    "add_lab_item": "fingerprints"
                  },
                  {
                    "progress_chapter": "109_explored_forensic_item_keyboard"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/keyboard",
              "wrapped": false,
              "movie": "m_keyboard"
            }
          }
        },
        "pool_contract": {
          "initial_state": "new",
          "target_text": "cases.case_03.forensic_items.pool_contract.target_text",
          "states": {
            "new": {
              "img": "images/contract",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_contract_fon",
                  "target": "images/mg_jack_signature",
                  "count": 1,
                  "sizeX": 8,
                  "sizeY": 8,
                  "completeText": "cases.case_03.forensic_items.pool_contract.states.new.minigame.complete"
                },
                "title": "cases.case_03.forensic_items.pool_contract.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/mg_jack_signature",
                "on_complete": [
                  {
                    "show_movie": "m24"
                  },
                  {
                    "progress_chapter": "207_explored_forensic_item_pool_contract"
                  },
                  {
                    "add_custom_task": "jack_white_deduction"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/contract",
              "movie": "m_pool_contract"
            }
          }
        },
        "body": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/body",
              "wrapped": false,
              "movie": "m_body"
            }
          }
        },
        "screws": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/bolts",
              "movie": "m_screws"
            }
          }
        },
        "fingerprints": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/fingerprint4",
              "movie": "m_fingerprints"
            }
          }
        },
        "camera_recording": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/surv_record",
              "movie": "m_camera_recording"
            }
          }
        },
        "contract": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/agreement",
              "movie": "m_contract"
            }
          }
        },
        "insurance_number": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/insurance",
              "movie": "m_insurance_number"
            }
          }
        },
        "bedclothes": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/prostinya",
              "movie": "m_bedclothes"
            }
          }
        },
        "safe": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/safe",
              "wrapped": false,
              "movie": "m_safe"
            }
          }
        },
        "swimsuit": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/black_kupalnik",
              "movie": "m_swimsuit"
            }
          }
        },
        "phone_number": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/phone_number",
              "movie": "m_phone_number"
            }
          }
        },
        "additional_laptop": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/notebook",
              "wrapped": false,
              "movie": "m_additional_laptop"
            }
          }
        },
        "case_code": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/case_code",
              "wrapped": false,
              "movie": "m_case_code"
            }
          }
        },
        "phone_number_2": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/phone_number_2",
              "movie": "m_phone_number_2"
            }
          }
        },
        "disk_special": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/disk_special",
              "movie": "m_disk_special"
            }
          }
        },
        "straza": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/straza",
              "movie": "m_straza"
            }
          }
        },
        "contact_lens": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/lens",
              "movie": "m_contact_lens"
            }
          }
        },
        "houses_for_sale": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/houses_for_sale",
              "movie": "m_houses_for_sale"
            }
          }
        },
        "laptop": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/notebook",
              "movie": "m_laptop",
              "wrapped": false
            }
          }
        }
      },
      "lab_items": {
        "body": {
          "name": "cases.case_03.lab_items.body.name",
          "target_text": "cases.case_03.lab_items.body.target_text",
          "img": "images/body",
          "item_type": "medicals",
          "analyze_time": 21600,
          "analyze_movie": "m5",
          "on_analyze": [
            {
              "set_info_state": {
                "type": "victim",
                "state": "analyzed"
              }
            },
            {
              "set_info_state": {
                "type": "weapon",
                "state": "found"
              }
            },
            {
              "update_killer_state": {
                "clues": [
                  "height",
                  "ring"
                ],
                "text": "cases.case_03.add_clues.height.ring"
              }
            },
            {
              "add_forensic_item": "body"
            },
            {
              "progress_chapter": "102_explored_lab_item_body"
            },
            {
              "check_transition": "accuse_jessica"
            }
          ]
        },
        "screws": {
          "name": "cases.case_03.lab_items.screws.name",
          "target_text": "cases.case_03.lab_items.screws.target_text",
          "img": "images/bolts",
          "item_type": "technics",
          "analyze_time": 14400,
          "analyze_movie": "m4",
          "on_analyze": [
            {
              "progress_chapter": "103_explored_lab_item_screws"
            },
            {
              "update_killer_state": {
                "clues": [
                  "swimming_ability"
                ],
                "text": "cases.case_03.add_clues.swimming_ability"
              }
            },
            {
              "add_forensic_item": "screws"
            },
            {
              "check_transition": "accuse_jessica"
            }
          ]
        },
        "laptop": {
          "name": "cases.case_03.lab_items.laptop.name",
          "target_text": "cases.case_03.lab_items.laptop.target_text",
          "img": "images/notebook",
          "item_type": "hack",
          "analyze_time": 18000,
          "analyze_movie": "m11",
          "on_analyze": [
            {
              "add_forensic_item": "keyboard"
            },
            {
              "add_forensic_item": "laptop"
            },
            {
              "progress_chapter": "108_explored_lab_item_laptop"
            }
          ]
        },
        "fingerprints": {
          "name": "cases.case_03.lab_items.fingerprints.name",
          "target_text": "cases.case_03.lab_items.fingerprints.target_text",
          "img": "images/fingerprint4",
          "item_type": "technics",
          "analyze_time": 14400,
          "analyze_movie": "m12",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "greenroad",
                "motive": true,
                "text": "cases.case_03.add_motive.greenroad"
              }
            },
            {
              "set_suspect_state": {
                "suspect": "greenroad",
                "state": "dialog_2"
              }
            },
            {
              "add_forensic_item": "fingerprints"
            },
            {
              "progress_chapter": "110_explored_lab_item_fingerprints"
            }
          ]
        },
        "camera_recording": {
          "name": "cases.case_03.lab_items.camera_recording.name",
          "target_text": "cases.case_03.lab_items.camera_recording.target_text",
          "img": "images/surv_record",
          "item_type": "technics",
          "analyze_time": 32400,
          "analyze_movie": "m14",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "greenroad",
                "alibi": true,
                "text": "cases.case_03.add_alibi.greenroad"
              }
            },
            {
              "show_movie": "m15"
            },
            {
              "set_suspect_state": {
                "suspect": "jessica",
                "state": "dialog_2"
              }
            },
            {
              "add_forensic_item": "camera_recording"
            },
            {
              "progress_chapter": "112_explored_lab_item_camera_recording"
            }
          ]
        },
        "contract": {
          "name": "cases.case_03.lab_items.contract.name",
          "target_text": "cases.case_03.lab_items.contract.target_text",
          "img": "images/agreement",
          "item_type": "docs",
          "analyze_time": 18000,
          "analyze_movie": "m17",
          "on_analyze": [
            {
              "add_forensic_item": "contract"
            },
            {
              "add_suspect": "miranda"
            },
            {
              "update_suspect_state": {
                "suspect": "miranda",
                "motive": true,
                "text": "cases.case_03.add_motive.miranda"
              }
            },
            {
              "progress_chapter": "114_explored_lab_item_contract"
            },
            {
              "add_start_next_chapter_task": {
                "cost": 2
              }
            }
          ]
        },
        "insurance_number": {
          "name": "cases.case_03.lab_items.insurance_number.name",
          "target_text": "cases.case_03.lab_items.insurance_number.target_text",
          "img": "images/insurance",
          "item_type": "docs",
          "analyze_time": 32400,
          "analyze_movie": "m29",
          "on_analyze": [
            {
              "add_forensic_item": "insurance_number"
            },
            {
              "progress_chapter": "217_explored_lab_item_insurance_number"
            },
            {
              "check_transition": "end_chapter_2"
            }
          ]
        },
        "bedclothes": {
          "name": "cases.case_03.lab_items.bedclothes.name",
          "target_text": "cases.case_03.lab_items.bedclothes.target_text",
          "img": "images/prostinya",
          "item_type": "medicals",
          "analyze_time": 50400,
          "analyze_movie": "m30",
          "on_analyze": [
            {
              "set_suspect_state": {
                "suspect": "jack_white",
                "state": "dialog_2"
              }
            },
            {
              "set_suspect_state": {
                "suspect": "jessica",
                "state": "dialog_3"
              }
            },
            {
              "add_forensic_item": "bedclothes"
            },
            {
              "progress_chapter": "302_explored_lab_item_bedclothes"
            }
          ]
        },
        "safe": {
          "name": "cases.case_03.lab_items.safe.name",
          "target_text": "cases.case_03.lab_items.safe.target_text",
          "img": "images/safe",
          "item_type": "technics",
          "analyze_time": 21600,
          "analyze_movie": "m33_1",
          "on_analyze": [
            {
              "add_forensic_item": "diving_photo"
            },
            {
              "add_forensic_item": "safe"
            },
            {
              "progress_chapter": "307_explored_lab_item_safe"
            }
          ]
        },
        "swimsuit": {
          "name": "cases.case_03.lab_items.swimsuit.name",
          "target_text": "cases.case_03.lab_items.swimsuit.target_text",
          "img": "images/black_kupalnik",
          "item_type": "medicals",
          "analyze_time": 50400,
          "analyze_movie": "m35",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "jessica",
                "clues": [
                  "termostraza"
                ],
                "text": "cases.case_03.add_suspect_clues.jessica.termostraza"
              }
            },
            {
              "add_forensic_item": "swimsuit"
            },
            {
              "check_transition": "open_scene_1_3"
            },
            {
              "progress_chapter": "306_explored_lab_item_swimsuit"
            }
          ]
        },
        "contact_lens": {
          "name": "cases.case_03.lab_items.contact_lens.name",
          "target_text": "cases.case_03.lab_items.contact_lens.target_text",
          "img": "images/lens",
          "item_type": "medicals",
          "analyze_time": 10800,
          "analyze_movie": "m37",
          "on_analyze": [
            {
              "update_killer_state": {
                "clues": [
                  "contact_lens"
                ],
                "text": "cases.case_03.add_clues.contact_lens"
              }
            },
            {
              "show_movie": "m38"
            },
            {
              "progress_chapter": "310_explored_lab_item_contact_lens"
            },
            {
              "update_suspect_state": {
                "suspect": "jessica",
                "clues": [
                  "contact_lens"
                ],
                "text": "cases.case_03.add_suspect_clues.jessica.contact_lens"
              }
            },
            {
              "init_arrest_state": null
            },
            {
              "add_forensic_item": "contact_lens"
            }
          ]
        },
        "phone_number": {
          "name": "cases.case_03.lab_items.phone_number.name",
          "target_text": "cases.case_03.lab_items.phone_number.target_text",
          "img": "images/phone_number",
          "item_type": "docs",
          "analyze_time": 10800,
          "analyze_movie": "m8",
          "on_analyze": [
            {
              "add_suspect": "greenroad"
            },
            {
              "set_suspect_state": {
                "suspect": "greenroad",
                "state": "dialog_1"
              }
            },
            {
              "add_forensic_item": "phone_number"
            },
            {
              "progress_chapter": "105_explored_lab_item_phone_number"
            }
          ]
        },
        "additional_laptop": {
          "name": "cases.case_03.lab_items.additional_laptop.name",
          "target_text": "cases.case_03.lab_items.additional_laptop.target_text",
          "img": "images/notebook",
          "item_type": "hack",
          "analyze_time": 54000,
          "analyze_movie": "m42",
          "on_analyze": [
            {
              "add_forensic_item": "livingroom_photo"
            },
            {
              "add_forensic_item": "additional_laptop"
            },
            {
              "progress_chapter": "401_explored_lab_item_additional_laptop"
            }
          ]
        },
        "houses_for_sale": {
          "name": "cases.case_03.lab_items.houses_for_sale.name",
          "target_text": "cases.case_03.lab_items.houses_for_sale.target_text",
          "img": "images/houses_for_sale",
          "item_type": "docs",
          "analyze_time": 14400,
          "analyze_movie": "m45",
          "on_analyze": [
            {
              "progress_chapter": "406_explored_lab_item_houses_for_sale"
            },
            {
              "check_transition": "end_chapter_4"
            },
            {
              "add_forensic_item": "houses_for_sale"
            }
          ]
        },
        "case_code": {
          "name": "cases.case_03.lab_items.case_code.name",
          "target_text": "cases.case_03.lab_items.case_code.target_text",
          "img": "images/case_code",
          "item_type": "hack",
          "analyze_time": 18000,
          "analyze_movie": "m48",
          "on_analyze": [
            {
              "progress_chapter": "408_explored_lab_item_case_code"
            },
            {
              "add_forensic_item": "case_code"
            },
            {
              "add_custom_task": "warehouse_owner"
            }
          ]
        },
        "phone_number_2": {
          "name": "cases.case_03.lab_items.phone_number_2.name",
          "target_text": "cases.case_03.lab_items.phone_number_2.target_text",
          "img": "images/phone_number_2",
          "item_type": "hack",
          "analyze_time": 54000,
          "analyze_movie": "m50",
          "on_analyze": [
            {
              "set_suspect_state": {
                "suspect": "realtor",
                "state": "dialog_2"
              }
            },
            {
              "add_forensic_item": "phone_number_2"
            },
            {
              "progress_chapter": "410_explored_lab_item_phone_number_2"
            }
          ]
        },
        "disk_special": {
          "name": "cases.case_03.lab_items.disk_special.name",
          "target_text": "cases.case_03.lab_items.disk_special.target_text",
          "img": "images/disk_special",
          "item_type": "technics",
          "analyze_time": 7200,
          "analyze_movie": "m23_2",
          "on_analyze": [
            {
              "open_new_scene": "bonus_3"
            },
            {
              "set_scene_state": {
                "scene": "bonus_3",
                "state": "1"
              }
            },
            {
              "add_forensic_item": "disk_special"
            },
            {
              "progress_chapter": "215_explored_lab_item_disk_special"
            }
          ]
        }
      },
      "clues": {
        "swimming_ability": {
          "img": "images/swimming"
        },
        "ring": {
          "img": "images/ring"
        },
        "height": {
          "img": "images/height"
        },
        "termostraza": {
          "img": "images/straza"
        },
        "contact_lens": {
          "img": "images/lens"
        }
      },
      "suspect_properties": {
        "prop_1": "age",
        "prop_2": "weight"
      },
      "suspects": {
        "realtor": {
          "clues": {
            "height": {
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_realtor",
              "portrait": "images/realtor_portret",
              "title": "cases.case_03.suspects.realtor.states.default.title",
              "status": "cases.case_03.suspects.realtor.states.default.status",
              "prop_1": "cases.case_03.suspects.realtor.states.default.prop_1",
              "prop_2": "cases.case_03.suspects.realtor.states.default.prop_2",
              "target_text": "cases.case_03.suspects.realtor.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m23",
              "on_talk": [
                {
                  "open_new_scene": "scene_6"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_6",
                    "state": "1"
                  }
                },
                {
                  "update_suspect_state": {
                    "suspect": "realtor",
                    "clues": [
                      "height"
                    ],
                    "text": "cases.case_03.add_suspect_clues.realtor.height"
                  }
                },
                {
                  "progress_chapter": "205_suspeect_realtor_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m51",
              "on_talk": [
                {
                  "progress_chapter": "411_suspect_realtor_dialog_2"
                },
                {
                  "add_custom_task": "special_arrest"
                }
              ]
            }
          }
        },
        "jessica": {
          "clues": {
            "height": {
              "match": true
            },
            "ring": {
              "img": "images/ring",
              "match": true
            },
            "swimming_ability": {
              "img": "images/swimming",
              "match": true
            },
            "termostraza": {
              "img": "images/straza",
              "match": true
            },
            "contact_lens": {
              "img": "images/lens",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_murderer",
              "portrait": "images/jessica_portret",
              "title": "cases.case_03.suspects.jessica.states.default.title",
              "status": "cases.case_03.suspects.jessica.states.default.status",
              "prop_1": "cases.case_03.suspects.jessica.states.default.prop_1",
              "prop_2": "cases.case_03.suspects.jessica.states.default.prop_2",
              "target_text": "cases.case_03.suspects.jessica.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m7",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "jessica",
                    "clues": [
                      "ring",
                      "height"
                    ],
                    "alibi": false,
                    "text": "cases.case_03.add_suspect_clues.jessica.ring.height"
                  }
                },
                {
                  "open_new_scene": "scene_2"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_2",
                    "state": "1"
                  }
                },
                {
                  "progress_chapter": "104_suspect_jessica__dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m16",
              "on_talk": [
                {
                  "add_lab_item": "contract"
                },
                {
                  "progress_chapter": "113_suspect_jessica_dialog_2"
                }
              ]
            },
            "dialog_3": {
              "talk_movie": "m31",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "jack_white",
                    "motive": true,
                    "text": "cases.case_03.add_motive.jack_white"
                  }
                },
                {
                  "progress_chapter": "303_suspect_jessica_dialog_3"
                },
                {
                  "check_transition": "open_scene_1_3"
                }
              ]
            }
          }
        },
        "greenroad": {
          "clues": {
            "ring": {
              "img": "images/ring",
              "match": true
            },
            "height": {
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_partner",
              "portrait": "images/greenroad_portret",
              "title": "cases.case_03.suspects.greenroad.states.default.title",
              "status": "cases.case_03.suspects.greenroad.states.default.status",
              "prop_1": "cases.case_03.suspects.greenroad.states.default.prop_1",
              "prop_2": "cases.case_03.suspects.greenroad.states.default.prop_2",
              "target_text": "cases.case_03.suspects.greenroad.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m9",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "greenroad",
                    "clues": [
                      "ring",
                      "height"
                    ],
                    "text": "cases.case_03.add_suspect_clues.greenroad.ring.height"
                  }
                },
                {
                  "open_new_scene": "scene_4"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_4",
                    "state": "1"
                  }
                },
                {
                  "progress_chapter": "106_suspect_greenroad_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m13",
              "on_talk": [
                {
                  "add_lab_item": "camera_recording"
                },
                {
                  "progress_chapter": "111_suspect_greenroad_dialog_2"
                }
              ]
            },
            "dialog_3": {
              "talk_movie": "m47",
              "on_talk": [
                {
                  "add_lab_item": "case_code"
                },
                {
                  "progress_chapter": "407_suspect_greenroad_dialog_3"
                }
              ]
            }
          }
        },
        "miranda": {
          "clues": {
            "ring": {
              "img": "images/ring",
              "match": true
            },
            "height": {
              "match": true
            },
            "swimming_ability": {
              "img": "images/swimming",
              "match": false
            },
            "termostraza": {
              "img": "images/straza",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_wife",
              "portrait": "images/wife_portrait",
              "title": "cases.case_03.suspects.miranda.states.default.title",
              "status": "cases.case_03.suspects.miranda.states.default.status",
              "prop_1": "cases.case_03.suspects.miranda.states.default.prop_1",
              "prop_2": "cases.case_03.suspects.miranda.states.default.prop_2",
              "target_text": "cases.case_03.suspects.miranda.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m19",
              "on_talk": [
                {
                  "open_new_scene": "scene_5"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_5",
                    "state": "1"
                  }
                },
                {
                  "update_suspect_state": {
                    "suspect": "miranda",
                    "clues": [
                      "ring",
                      "height"
                    ],
                    "text": "cases.case_03.add_suspect_clues.miranda.ring.height"
                  }
                },
                {
                  "progress_chapter": "201_suspect_miranda_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m28",
              "on_talk": [
                {
                  "add_lab_item": "insurance_number"
                },
                {
                  "progress_chapter": "214_suspect_miranda_dialog_2"
                }
              ]
            }
          }
        },
        "jack_white": {
          "clues": {
            "ring": {
              "img": "images/ring",
              "match": true
            },
            "height": {
              "match": true
            },
            "swimming_ability": {
              "img": "images/swimming",
              "match": true
            },
            "termostraza": {
              "img": "images/straza",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_surfer",
              "portrait": "images/surfer_portret",
              "title": "cases.case_03.suspects.jack_white.states.default.title",
              "status": "cases.case_03.suspects.jack_white.states.default.status",
              "prop_1": "cases.case_03.suspects.jack_white.states.default.prop_1",
              "prop_2": "cases.case_03.suspects.jack_white.states.default.prop_2",
              "target_text": "cases.case_03.suspects.jack_white.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m26",
              "on_talk": [
                {
                  "set_scene_state": {
                    "scene": "scene_1",
                    "state": "2"
                  }
                },
                {
                  "update_suspect_state": {
                    "suspect": "jack_white",
                    "clues": [
                      "ring",
                      "height",
                      "swimming_ability"
                    ],
                    "text": "cases.case_03.add_suspect_clues.jack_white.ring.height.swimming_ability"
                  }
                },
                {
                  "progress_chapter": "209_suspect_jack_white_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": [
                "m32",
                "m32_1"
              ],
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "jessica",
                    "motive": true,
                    "text": "cases.case_03.add_motive.jessica"
                  }
                },
                {
                  "set_scene_state": {
                    "scene": "scene_2",
                    "state": "2"
                  }
                },
                {
                  "set_scene_state": {
                    "scene": "scene_3",
                    "state": "2"
                  }
                },
                {
                  "progress_chapter": "304_suspect_jack_white_dialog_2"
                }
              ]
            }
          }
        }
      },
      "info": {
        "victim": {
          "found": {
            "name": "cases.case_03.info.victim.found.name",
            "description": "cases.case_03.info.victim.found.description",
            "img": "images/victim_portret"
          },
          "analyzed": {
            "name": "cases.case_03.info.victim.analyzed.name",
            "description": "cases.case_03.info.victim.analyzed.description",
            "img": "images/victim_portret"
          }
        },
        "weapon": {
          "found": {
            "name": "cases.case_03.info.weapon.found.name",
            "description": "cases.case_03.info.weapon.found.description",
            "img": "images/tie"
          }
        },
        "killer": {
          "arrested": {
            "name": "cases.case_03.info.killer.arrested.name",
            "description": "cases.case_03.info.killer.arrested.description",
            "img": "images/jessica_portret"
          }
        }
      },
      "chapters": [
        {
          "size": 14,
          "img": "images/chapter_31",
          "name": "cases.case_03.chapters.1.name",
          "description": "cases.case_03.chapters.1.description",
          "on_start": []
        },
        {
          "size": 17,
          "img": "images/chapter_32",
          "name": "cases.case_03.chapters.2.name",
          "description": "cases.case_03.chapters.2.description",
          "on_start": [
            {
              "show_movie": "m18"
            },
            {
              "set_suspect_state": {
                "suspect": "miranda",
                "state": "dialog_1"
              }
            }
          ]
        },
        {
          "size": 11,
          "img": "images/chapter_33",
          "name": "cases.case_03.chapters.3.name",
          "description": "cases.case_03.chapters.3.description",
          "on_start": [
            {
              "show_movie": "m29_1"
            },
            {
              "open_new_scene": "scene_3"
            },
            {
              "set_scene_state": {
                "scene": "scene_3",
                "state": "1"
              }
            }
          ]
        },
        {
          "size": 12,
          "img": "images/chapter_34",
          "name": "cases.case_03.chapters.4.name",
          "description": "cases.case_03.chapters.4.description",
          "description_end": "cases.case_03.chapters.4.description_end",
          "on_start": [
            {
              "show_movie": "m41"
            },
            {
              "add_lab_item": "additional_laptop"
            }
          ]
        }
      ],
      "on_start": [
        {
          "show_movie": "m1"
        },
        {
          "show_movie": "m2"
        },
        {
          "open_new_scene": "scene_1"
        },
        {
          "set_scene_state": {
            "scene": "scene_1",
            "state": "1"
          }
        },
        {
          "add_suspect": "realtor"
        },
        {
          "set_suspect_state": {
            "suspect": "realtor",
            "state": "default"
          }
        },
        {
          "set_info_state": {
            "type": "victim",
            "state": "found"
          }
        }
      ],
      "arrest": {
        "killer": "jessica",
        "on_success": [
          {
            "show_movie": "m39"
          },
          {
            "show_movie": "m40"
          },
          {
            "progress_chapter": "311_init_arrest_jessica"
          },
          {
            "show_movie": "m40_1"
          },
          {
            "set_info_state": {
              "type": "killer",
              "state": "arrested"
            }
          },
          {
            "add_start_next_chapter_task": {
              "cost": 2
            }
          }
        ],
        "on_fail": [
          {
            "show_movie": "m_wrong_arrest"
          }
        ]
      },
      "transitions": {
        "accuse_jessica": {
          "preconditions": [
            {
              "lab_item_state": {
                "body": "done"
              }
            },
            {
              "lab_item_state": {
                "screws": "done"
              }
            }
          ],
          "on_complete": [
            {
              "show_movie": "m6"
            },
            {
              "add_suspect": "jessica"
            },
            {
              "set_suspect_state": {
                "suspect": "jessica",
                "state": "dialog_1"
              }
            }
          ]
        },
        "end_chapter_2": {
          "preconditions": [
            {
              "scene_state": {
                "bonus_3": "default"
              }
            },
            {
              "lab_item_state": {
                "insurance_number": "done"
              }
            }
          ],
          "on_complete": [
            {
              "add_start_next_chapter_task": {
                "cost": 2
              }
            }
          ]
        },
        "open_scene_1_3": {
          "preconditions": [
            {
              "forensic_item_state": {
                "diving_photo": "explored"
              }
            },
            {
              "suspect_state_talked": {
                "jessica": "dialog_3"
              }
            },
            {
              "lab_item_state": {
                "swimsuit": "done"
              }
            }
          ],
          "on_complete": [
            {
              "show_movie": "m36"
            },
            {
              "set_scene_state": {
                "scene": "scene_1",
                "state": "3"
              }
            }
          ]
        },
        "end_chapter_4": {
          "preconditions": [
            {
              "forensic_item_state": {
                "opis": "explored"
              }
            },
            {
              "lab_item_state": {
                "houses_for_sale": "done"
              }
            }
          ],
          "on_complete": [
            {
              "set_suspect_state": {
                "suspect": "greenroad",
                "state": "dialog_3"
              }
            }
          ]
        }
      },
      "deductions": {
        "jack_white": {
          "suspect_img": "images/char_surfer",
          "background_img": "images/_back_lab"
        }
      },
      "custom_tasks": {
        "jack_white_deduction": {
          "cost": 1,
          "img": "images/surfer_portret",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_03.custom_tasks.jack_white_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "jack_white"
            },
            {
              "show_movie": "m24_1"
            },
            {
              "add_suspect": "jack_white"
            },
            {
              "set_suspect_state": {
                "suspect": "jack_white",
                "state": "dialog_1"
              }
            },
            {
              "progress_chapter": "208_custom_task_jack_white_deduction"
            }
          ]
        },
        "warehouse_owner": {
          "cost": 1,
          "img": "images/phone",
          "action_text": "cases.case_03.custom_tasks.case_code.action_text",
          "target_text": "cases.case_03.custom_tasks.case_code.target_text",
          "on_click": [
            {
              "show_movie": "m49"
            },
            {
              "add_lab_item": "phone_number_2"
            },
            {
              "progress_chapter": "409_custom_task_warehouse_owner"
            }
          ]
        },
        "special_arrest": {
          "name": "special_arrest",
          "cost": 1,
          "img": "images/realtor_portret",
          "action_text": "tasks.arrest.action_text",
          "target_text": "cases.case_03.suspects.realtor.states.special_arrest.target_text",
          "on_click": [
            {
              "show_movie": "m52"
            },
            {
              "set_suspect_state": {
                "suspect": "realtor",
                "state": "default"
              }
            },
            {
              "set_suspect_state": {
                "suspect": "greenroad",
                "state": "default"
              }
            },
            {
              "progress_chapter": "412_special_arrest_suspect_realtor"
            },
            {
              "add_unlock_new_case_task": {
                "case": "case_04",
                "cost": 1
              }
            }
          ]
        }
      }
    },
    "case_04": {
      "schema_id": "case",
      "name": "cases.case_04.name",
      "description": "cases.case_04.description",
      "scene_order": [
        "scene_1",
        "scene_2",
        "scene_3",
        "bonus_1",
        "scene_4",
        "bonus_2",
        "scene_5",
        "scene_6",
        "bonus_3"
      ],
      "scenes": {
        "scene_1": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_04.scenes.scene_1.name",
          "target_text": "cases.case_04.scenes.scene_1.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "central_room_placeMurder",
          "img": "central_room_placeMurder/thumb",
          "items": {
            "body": {
              "name": "cases.case_04.scenes.scene_1.items.body.name",
              "img": "images/dead_man",
              "layer": "corpse_special_fade"
            },
            "torn_paper": {
              "name": "cases.case_04.scenes.scene_1.items.torn_paper.name",
              "img": "images/torn_clip",
              "layer": "torn_picture_special"
            },
            "contract": {
              "name": "cases.case_04.scenes.scene_1.items.contract.name",
              "img": "images/contract",
              "layer": "contract_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "body",
                "torn_paper"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "body"
                },
                {
                  "add_forensic_item": "torn_paper"
                },
                {
                  "show_movie": "m2"
                },
                {
                  "add_suspect": "amanda_may"
                },
                {
                  "set_suspect_state": {
                    "suspect": "amanda_may",
                    "state": "hidden"
                  }
                },
                {
                  "progress_chapter": "101_explored_scene_1_state_1"
                },
                {
                  "add_custom_task": "robin_pax"
                }
              ]
            },
            "2": {
              "items": [
                "contract"
              ],
              "on_complete": [
                {
                  "set_suspect_state": {
                    "suspect": "hallowell",
                    "state": "dialog_2"
                  }
                },
                {
                  "show_movie": "m32_1"
                },
                {
                  "progress_chapter": "403_explored_scene_1_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_2": {
          "scores": [
            1400000,
            1900000,
            2500000,
            3200000,
            4000000
          ],
          "name": "cases.case_04.scenes.scene_2.name",
          "target_text": "cases.case_04.scenes.scene_2.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "corridor",
          "img": "corridor/thumb",
          "items": {
            "secret_door": {
              "name": "cases.case_04.scenes.scene_2.items.door_hole.name",
              "img": "images/door_hole",
              "layer": "door_special_fade"
            }
          },
          "states": {
            "1": {
              "items": [
                "secret_door"
              ],
              "on_complete": [
                {
                  "show_movie": "m8"
                },
                {
                  "progress_chapter": "108_explored_scene_2_state_1"
                },
                {
                  "check_transition": "end_chapter_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_3": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_04.scenes.scene_3.name",
          "target_text": "cases.case_04.scenes.scene_3.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "studio",
          "img": "studio/thumb",
          "items": {
            "baseball_bat": {
              "name": "cases.case_04.scenes.scene_3.items.baseball_bat.name",
              "img": "images/bat",
              "layer": "07"
            },
            "broken_glass": {
              "name": "cases.case_04.scenes.scene_3.items.broken_glass.name",
              "img": "images/wineglass_broken",
              "layer": "14"
            },
            "compact_disks": {
              "name": "cases.case_04.scenes.scene_3.items.compact_disks.name",
              "img": "images/stack_of_CD",
              "layer": "31"
            }
          },
          "states": {
            "1": {
              "items": [
                "baseball_bat",
                "broken_glass"
              ],
              "on_complete": [
                {
                  "add_lab_item": "baseball_bat"
                },
                {
                  "add_forensic_item": "broken_glass"
                },
                {
                  "show_movie": "m10"
                },
                {
                  "progress_chapter": "202_explored_scene_3_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "compact_disks"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "fake_contract"
                },
                {
                  "show_movie": "m31"
                },
                {
                  "progress_chapter": "401_explored_scene_3_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_4": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_04.scenes.scene_4.name",
          "target_text": "cases.case_04.scenes.scene_4.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "car",
          "img": "car/thumb",
          "items": {
            "onboard_computer": {
              "name": "cases.case_04.scenes.scene_4.items.onboard_computer.name",
              "img": "images/car_comp",
              "layer": "57"
            }
          },
          "states": {
            "1": {
              "items": [
                "onboard_computer"
              ],
              "on_complete": [
                {
                  "add_lab_item": "onboard_computer"
                },
                {
                  "show_movie": "m16_1"
                },
                {
                  "progress_chapter": "212_explored_scene_4_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_5": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_04.scenes.scene_5.name",
          "target_text": "cases.case_04.scenes.scene_5.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "drug_dealer_apartment",
          "img": "drug_dealer_apartment/thumb",
          "items": {
            "note": {
              "name": "cases.case_04.scenes.scene_5.items.note.name",
              "img": "images/note",
              "layer": "note_special"
            },
            "bloody_bandages": {
              "name": "cases.case_04.scenes.scene_5.items.bloody_bandages.name",
              "img": "images/bandage",
              "layer": "bandage_special"
            },
            "cocain": {
              "name": "cases.case_04.scenes.scene_5.items.cocain.name",
              "img": "images/drugs",
              "layer": "cocain_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "note",
                "bloody_bandages",
                "cocain"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "note"
                },
                {
                  "add_forensic_item": "cocain"
                },
                {
                  "add_lab_item": "bloody_bandages"
                },
                {
                  "show_movie": "m24_1"
                },
                {
                  "progress_chapter": "303_explored_scene_5_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_6": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_04.scenes.scene_6.name",
          "target_text": "cases.case_04.scenes.scene_6.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "bottom_of_a_river",
          "img": "bottom_of_a_river/thumb",
          "items": {
            "gun": {
              "name": "cases.case_04.scenes.scene_6.items.gun.name",
              "img": "images/gun",
              "layer": "62"
            },
            "mobile_phone": {
              "name": "cases.case_04.scenes.scene_6.items.mobile_phone.name",
              "img": "images/smartphone_n_seashells",
              "layer": "61"
            }
          },
          "states": {
            "1": {
              "items": [
                "gun",
                "mobile_phone"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "gun"
                },
                {
                  "add_forensic_item": "mobile_phone"
                },
                {
                  "show_movie": "m27_1"
                },
                {
                  "progress_chapter": "307_explored_scene_6_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "bonus_1": {
          "scores": [
            1000000,
            1500000,
            2100000,
            2800000,
            3600000
          ],
          "name": "cases.case_04.scenes.bonus_1.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 4,
          "type": "puzzle",
          "path": "images/central_room_puzzle",
          "img": "images/4_puzzle",
          "states": {
            "default": {}
          }
        },
        "bonus_2": {
          "scores": [
            2000000,
            2500000,
            3100000,
            3800000,
            4600000
          ],
          "name": "cases.case_04.scenes.bonus_2.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 10,
          "type": "hogTime",
          "path": "studio",
          "img": "images/4_time_attack",
          "items": {
            "baseball_bat": {
              "name": "cases.case_04.scenes.scene_3.items.baseball_bat.name",
              "img": "images/bat",
              "layer": "07"
            },
            "broken_glass": {
              "name": "cases.case_04.scenes.scene_3.items.broken_glass.name",
              "img": "images/wineglass_broken",
              "layer": "14"
            },
            "compact_disks": {
              "name": "cases.case_04.scenes.scene_3.items.compact_disks.name",
              "img": "images/stack_of_CD",
              "layer": "31"
            }
          },
          "states": {
            "default": {}
          }
        },
        "bonus_3": {
          "scores": [
            2000000,
            2500000,
            3100000,
            3800000,
            4600000
          ],
          "name": "cases.case_04.scenes.bonus_3.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 20,
          "type": "hogDiff",
          "path": "drug_dealer_apartment",
          "img": "images/4_diff",
          "items": {
            "note": {
              "name": "cases.case_04.scenes.scene_5.items.note.name",
              "img": "images/note",
              "layer": "note_special"
            },
            "bloody_bandages": {
              "name": "cases.case_04.scenes.scene_5.items.bloody_bandages.name",
              "img": "images/bandage",
              "layer": "bandage_special"
            },
            "cocain": {
              "name": "cases.case_04.scenes.scene_5.items.cocain.name",
              "img": "images/drugs",
              "layer": "cocain_special"
            }
          },
          "states": {
            "default": {}
          }
        }
      },
      "forensic_items": {
        "body": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.body.target_text",
          "states": {
            "new": {
              "img": "images/dead_man",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_body",
                  "target": "images/bullet",
                  "count": 1,
                  "sizeX": 10,
                  "sizeY": 10,
                  "completeText": "cases.case_04.forensic_items.body.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.body.states.new.minigame.title",
                "img_result": "images/bullet",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m3"
                  },
                  {
                    "set_info_state": {
                      "type": "victim",
                      "state": "analyzed"
                    }
                  },
                  {
                    "add_forensic_item": "bullet"
                  },
                  {
                    "add_lab_item": "victim_blood"
                  },
                  {
                    "update_killer_state": {
                      "clues": [
                        "blood_mark"
                      ],
                      "text": "cases.case_04.add_clues.blood_mark"
                    }
                  },
                  {
                    "progress_chapter": "103_explored_forensic_item_body"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/dead_man",
              "wrapped": false,
              "movie": "m_body"
            }
          }
        },
        "bullet": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.bullet.target_text",
          "states": {
            "new": {
              "img": "images/bullet",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/mg_bullet_1, images/mg_bullet_2, images/bullet, images/mg_bullet_4, images/mg_bullet_5",
                  "sizeX": 5,
                  "sizeY": 2,
                  "completeText": "cases.case_04.forensic_items.bullet.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.bullet.states.new.minigame.title",
                "img_result": "images/bullet",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m5"
                  },
                  {
                    "set_info_state": {
                      "type": "weapon",
                      "state": "found"
                    }
                  },
                  {
                    "progress_chapter": "105_explored_forensic_item_bullet"
                  },
                  {
                    "check_transition": "end_chapter_1"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/bullet",
              "movie": "m_bullet"
            }
          }
        },
        "torn_paper": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.torn_paper.target_text",
          "states": {
            "new": {
              "img": "images/torn_clip",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "back": "images/_back_minigames",
                  "path": "images/mg_puzzl_storyboard_clipl_d4",
                  "completeText": "cases.case_04.forensic_items.torn_paper.states.new.minigame.complete",
                  "linkInfo": "08:07,04,02,01;07:08,06,04;06:07,05,04;05:06,04,03,02;04:08,07,06,05,02;03:05,02;02:08,05,04,03,01;01:08,02"
                },
                "title": "cases.case_04.forensic_items.torn_paper.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/clip",
                "on_complete": [
                  {
                    "show_movie": "m4"
                  },
                  {
                    "progress_chapter": "104_explored_forensic_item_torn_paper"
                  },
                  {
                    "check_transition": "end_chapter_1"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/clip",
              "movie": "m_torn_paper"
            }
          }
        },
        "house_plan": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.house_plan.target_text",
          "states": {
            "new": {
              "img": "images/flat_plan",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/plane_1, images/plane_2, images/plane_3, images/plane_4",
                  "sizeX": 4,
                  "sizeY": 2,
                  "completeText": "cases.case_04.forensic_items.house_plan.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.house_plan.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m7"
                  },
                  {
                    "progress_chapter": "107_explored_forensic_item_house_plan"
                  },
                  {
                    "open_new_scene": "scene_2"
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_2",
                      "state": "1"
                    }
                  }
                ]
              }
            },
            "explored": {
              "img": "images/flat_plan",
              "movie": "m_house_plan"
            }
          }
        },
        "leaves": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.leaves.target_text",
          "states": {
            "new": {
              "img": "images/leaves",
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/key",
                  "path": "images/leaves_mg",
                  "trashCount": 30,
                  "radius": 400,
                  "completeText": "cases.case_04.forensic_items.leaves.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.leaves.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/key",
                "on_complete": [
                  {
                    "show_movie": "m9"
                  },
                  {
                    "open_new_scene": "scene_3"
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_3",
                      "state": "1"
                    }
                  },
                  {
                    "progress_chapter": "201_explored_forensic_item_leaves"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/key",
              "movie": "m_leaves"
            }
          }
        },
        "broken_glass": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.broken_glass.target_text",
          "states": {
            "new": {
              "img": "images/wineglass_broken",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "back": "images/_back_minigames",
                  "path": "images/bokal_mg",
                  "completeText": "cases.case_04.forensic_items.broken_glass.states.new.minigame.complete",
                  "linkInfo": "8:7;7:8,6;6:7,5,3;5:6,4,3;4:5,3,1;3:6,5,4,2,1;2:3,1;1:4,3,2"
                },
                "title": "cases.case_04.forensic_items.broken_glass.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/wineglass",
                "on_complete": [
                  {
                    "show_movie": "m11"
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "amanda_may",
                      "state": "dialog_1"
                    }
                  },
                  {
                    "progress_chapter": "203_explored_forensic_item_broken_glass"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/wineglass",
              "movie": "m_broken_glass"
            }
          }
        },
        "bank_account": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.bank_account.target_text",
          "states": {
            "new": {
              "img": "images/paybill",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/mg_account_1, images/mg_account_2, images/mg_account_3, images/mg_account_4, images/mg_account_5, images/mg_account_6",
                  "sizeX": 6,
                  "sizeY": 2,
                  "completeText": "cases.case_04.forensic_items.bank_account.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.bank_account.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m14_1"
                  },
                  {
                    "add_suspect": "hallowell"
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "hallowell",
                      "state": "dialog_1"
                    }
                  },
                  {
                    "progress_chapter": "206_explored_forensic_item_bank_account"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/paybill",
              "wrapped": false,
              "movie": "m_bank_account"
            }
          }
        },
        "model_search": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.model_search.target_text",
          "states": {
            "new": {
              "img": "images/dark_silouette",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/mg_model_1, images/mg_model_2, images/mg_model_3, images/mg_model_4",
                  "sizeX": 4,
                  "sizeY": 2,
                  "completeText": "cases.case_04.forensic_items.model_search.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.model_search.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/becky_portret",
                "on_complete": [
                  {
                    "show_movie": "m17"
                  },
                  {
                    "add_suspect": "becky_stone"
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "becky_stone",
                      "state": "dialog_1"
                    }
                  },
                  {
                    "progress_chapter": "209_explored_forensic_item_model_search"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/becky_portret",
              "wrapped": false,
              "movie": "m_model_search"
            }
          }
        },
        "camera_recording": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.camera_recording.target_text",
          "states": {
            "new": {
              "img": "images/record",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "back": "images/_back_minigames",
                  "path": "images/camera_mg",
                  "completeText": "cases.case_04.forensic_items.camera_recording.states.new.minigame.complete",
                  "linkInfo": "1:3,4,5,8;2:3,6,7,8;3:2,1,4,8;4:3,1;5:1,6,8;6:2,5,7,8;7:6,2;8:1,2,3,5,6"
                },
                "title": "cases.case_04.forensic_items.camera_recording.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m25"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "ozzy",
                      "alibi": false,
                      "text": "cases.case_04.add_alibi.ozzy"
                    }
                  },
                  {
                    "open_new_scene": "scene_6"
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_6",
                      "state": "1"
                    }
                  },
                  {
                    "progress_chapter": "304_explored_forensic_item_camera_recording"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/record",
              "movie": "m_camera_recording"
            }
          }
        },
        "note": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.note.target_text",
          "states": {
            "new": {
              "img": "images/note",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_raspiska_fon",
                  "target": "images/blood_mg",
                  "count": 3,
                  "sizeX": 8,
                  "sizeY": 6,
                  "completeText": "cases.case_04.forensic_items.note.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.note.states.new.minigame.title",
                "img_result": "images/blood_mg",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m26"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "ozzy",
                      "clues": [
                        "blood_mark"
                      ],
                      "text": "cases.case_04.add_suspect_clues.ozzy.blood_mark"
                    }
                  },
                  {
                    "progress_chapter": "305_explored_forensic_item_note"
                  },
                  {
                    "check_transition": "accuse_ozzy"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/note",
              "movie": "m_note"
            }
          }
        },
        "gun": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.gun.target_text",
          "states": {
            "new": {
              "img": "images/gun",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/gun, images/mg_gun_1, images/mg_gun_2, images/mg_gun_3",
                  "sizeX": 4,
                  "sizeY": 2,
                  "completeText": "cases.case_04.forensic_items.gun.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.gun.states.new.minigame.title",
                "img_result": "images/gun",
                "next_state": "new_2",
                "on_complete": [
                  {
                    "show_movie": "m28"
                  },
                  {
                    "update_killer_state": {
                      "clues": [
                        "fingerprint"
                      ],
                      "text": "cases.case_04.add_clues.fingerprint"
                    }
                  },
                  {
                    "set_info_state": {
                      "type": "weapon",
                      "state": "analyzed"
                    }
                  },
                  {
                    "progress_chapter": "308_explored_forensic_item_gun_state_new"
                  }
                ]
              }
            },
            "new_2": {
              "img": "images/gun",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_gun",
                  "target": "images/fingerprint",
                  "count": 1,
                  "sizeX": 6,
                  "sizeY": 8,
                  "completeText": "cases.case_04.forensic_items.gun.states.new_2.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.gun.states.new_2.minigame.title",
                "img_result": "images/fingerprint",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m28_1"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "ozzy",
                      "clues": [
                        "fingerprint"
                      ],
                      "text": "cases.case_04.add_suspect_clues.ozzy.fingerprint"
                    }
                  },
                  {
                    "progress_chapter": "309_explored_forensic_item_gun_state_new_2"
                  },
                  {
                    "check_transition": "accuse_ozzy"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/gun",
              "movie": "m_gun"
            }
          }
        },
        "mobile_phone": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.mobile_phone.target_text",
          "states": {
            "new": {
              "img": "images/smartphone_n_seashells",
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/smartphone",
                  "path": "images/river_trash_mg",
                  "trashCount": 70,
                  "radius": 400,
                  "completeText": "cases.case_04.forensic_items.mobile_phone.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.mobile_phone.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/smartphone",
                "on_complete": [
                  {
                    "show_movie": "m29"
                  },
                  {
                    "update_killer_state": {
                      "clues": [
                        "phone_ring"
                      ],
                      "text": "cases.case_04.add_clues.phone_ring"
                    }
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "ozzy",
                      "clues": [
                        "phone_ring"
                      ],
                      "text": "cases.case_04.add_suspect_clues.ozzy.phone_ring"
                    }
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "hallowell",
                      "clues": [
                        "phone_ring"
                      ],
                      "text": "cases.case_04.add_suspect_clues.hallowell.phone_ring"
                    }
                  },
                  {
                    "progress_chapter": "310_explored_forensic_item_mobile_phone"
                  },
                  {
                    "check_transition": "accuse_ozzy"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/smartphone",
              "movie": "m_mobile_phone"
            }
          }
        },
        "fake_contract": {
          "initial_state": "new",
          "target_text": "cases.case_04.forensic_items.fake_contract.target_text",
          "states": {
            "new": {
              "img": "images/contract",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_contract_fon",
                  "target": "images/6_mg, images/8_mg, images/9_mg",
                  "count": 3,
                  "sizeX": 8,
                  "sizeY": 6,
                  "completeText": "cases.case_04.forensic_items.fake_contract.states.new.minigame.complete"
                },
                "title": "cases.case_04.forensic_items.fake_contract.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/contract",
                "on_complete": [
                  {
                    "show_movie": "m32"
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_1",
                      "state": "2"
                    }
                  },
                  {
                    "progress_chapter": "402_explored_forensic_item_fake_contract"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/contract",
              "movie": "m_fake_contract"
            }
          }
        },
        "victim_blood": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/victim_blood",
              "movie": "m_victim_blood"
            }
          }
        },
        "baseball_bat": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/bat",
              "movie": "m_baseball_bat"
            }
          }
        },
        "onboard_computer": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/car_comp",
              "movie": "m_onboard_computer"
            }
          }
        },
        "model_survey": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/bekky",
              "wrapped": false,
              "movie": "m_model_survey"
            }
          }
        },
        "bloody_bandages": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/bandage",
              "movie": "m_bloody_bandages"
            }
          }
        },
        "cocain": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/drugs",
              "movie": "m_cocain"
            }
          }
        }
      },
      "lab_items": {
        "victim_blood": {
          "name": "cases.case_04.lab_items.victim_blood.name",
          "target_text": "cases.case_04.lab_items.victim_blood.target_text",
          "img": "images/victim_blood",
          "item_type": "medicals",
          "analyze_time": 14400,
          "analyze_movie": "m3_1",
          "on_analyze": [
            {
              "progress_chapter": "106_explored_lab_item_victim_blood"
            },
            {
              "add_forensic_item": "victim_blood"
            },
            {
              "check_transition": "end_chapter_1"
            }
          ]
        },
        "baseball_bat": {
          "name": "cases.case_04.lab_items.baseball_bat.name",
          "target_text": "cases.case_04.lab_items.baseball_bat.target_text",
          "img": "images/bat",
          "item_type": "chemicals",
          "analyze_time": 21600,
          "analyze_movie": "m12",
          "on_analyze": [
            {
              "update_killer_state": {
                "clues": [
                  "blood_group",
                  "head_wound"
                ],
                "text": "cases.case_04.add_clues.blood_group_head_wound"
              }
            },
            {
              "add_forensic_item": "baseball_bat"
            },
            {
              "progress_chapter": "204_explored_lab_item_baseball_bat"
            },
            {
              "check_transition": "end_chapter_2"
            }
          ]
        },
        "onboard_computer": {
          "name": "cases.case_04.lab_items.onboard_computer.name",
          "target_text": "cases.case_04.lab_items.onboard_computer.target_text",
          "img": "images/car_comp",
          "item_type": "hack",
          "analyze_time": 10800,
          "analyze_movie": "m18",
          "on_analyze": [
            {
              "check_transition": "end_chapter_2"
            },
            {
              "update_suspect_state": {
                "suspect": "hallowell",
                "alibi": true,
                "text": "cases.case_04.add_alibi.hallowell"
              }
            },
            {
              "add_forensic_item": "onboard_computer"
            },
            {
              "progress_chapter": "214_explored_lab_item_onboard_computer"
            }
          ]
        },
        "model_survey": {
          "name": "cases.case_04.lab_items.model_survey.name",
          "target_text": "cases.case_04.lab_items.model_survey.target_text",
          "img": "images/bekky",
          "item_type": "medicals",
          "analyze_time": 64800,
          "analyze_movie": "m20",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "becky_stone",
                "clues": [
                  "blood_group",
                  "head_wound"
                ],
                "text": "cases.case_04.add_suspect_clues.becky_stone.blood_group.head_wound"
              }
            },
            {
              "add_forensic_item": "model_survey"
            },
            {
              "progress_chapter": "211_explored_lab_item_model_survey"
            },
            {
              "set_suspect_state": {
                "suspect": "becky_stone",
                "state": "dialog_2"
              }
            }
          ]
        },
        "bloody_bandages": {
          "name": "cases.case_04.lab_items.bloody_bandages.name",
          "target_text": "cases.case_04.lab_items.bloody_bandages.target_text",
          "img": "images/bandage",
          "item_type": "chemicals",
          "analyze_time": 21600,
          "analyze_movie": "m27",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "ozzy",
                "clues": [
                  "blood_group"
                ],
                "text": "cases.case_04.add_suspect_clues.ozzy.blood_group"
              }
            },
            {
              "add_forensic_item": "bloody_bandages"
            },
            {
              "progress_chapter": "306_explored_lab_item_bloody_bandages"
            },
            {
              "check_transition": "accuse_ozzy"
            }
          ]
        }
      },
      "clues": {
        "head_wound": {
          "img": "images/injury"
        },
        "blood_group": {
          "img": "images/blood_drop"
        },
        "blood_mark": {
          "img": "images/blood_mark"
        },
        "phone_ring": {
          "img": "images/inc_call"
        },
        "fingerprint": {
          "img": "images/fingerprint"
        }
      },
      "suspect_properties": {
        "prop_1": "age",
        "prop_2": "blood"
      },
      "suspects": {
        "amanda_may": {
          "clues": {
            "blood_mark": {
              "img": "images/blood_mark",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_amanda_normal",
              "portrait": "images/amanda_portret",
              "title": "cases.case_04.suspects.amanda_may.states.default.title",
              "status": "cases.case_04.suspects.amanda_may.states.default.status",
              "prop_1": "cases.case_04.suspects.amanda_may.states.default.prop_1",
              "prop_2": "cases.case_04.suspects.amanda_may.states.default.prop_2",
              "target_text": "cases.case_04.suspects.amanda_may.states.default.target_text"
            },
            "hidden": {
              "img": "images/char_amanda_hidden",
              "title": "cases.case_04.suspects.amanda_may.states.hidden.title",
              "status": "cases.case_04.suspects.amanda_may.states.hidden.status",
              "prop_1": "cases.case_04.suspects.amanda_may.states.hidden.prop_1",
              "prop_2": "cases.case_04.suspects.amanda_may.states.hidden.prop_2",
              "target_text": "cases.case_04.suspects.amanda_may.states.hidden.target_text",
              "talkable": false
            },
            "dialog_1": {
              "talk_movie": [
                "m13",
                "m14"
              ],
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "amanda_may",
                    "clues": [
                      "blood_mark"
                    ],
                    "motive": true,
                    "alibi": false,
                    "text": "cases.case_04.add_suspect_clues.amanda_may.blood_mark"
                  }
                },
                {
                  "add_forensic_item": "bank_account"
                },
                {
                  "progress_chapter": "205_suspect_amanda_may_dialog_1"
                }
              ]
            }
          }
        },
        "ozzy": {
          "clues": {
            "fingerprint": {
              "img": "images/fingerprint",
              "match": true
            },
            "blood_mark": {
              "img": "images/blood_mark",
              "match": true
            },
            "head_wound": {
              "match": true
            },
            "blood_group": {
              "match": true
            },
            "phone_ring": {
              "img": "images/inc_call",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_dealer_normal",
              "portrait": "images/ozzy_portret",
              "title": "cases.case_04.suspects.ozzy.states.default.title",
              "status": "cases.case_04.suspects.ozzy.states.default.status",
              "prop_1": "cases.case_04.suspects.ozzy.states.default.prop_1",
              "prop_2": "cases.case_04.suspects.ozzy.states.default.prop_2",
              "target_text": "cases.case_04.suspects.ozzy.states.default.target_text"
            },
            "hidden": {
              "img": "images/char_dealer_hidden",
              "title": "cases.case_04.suspects.ozzy.states.hidden.title",
              "status": "cases.case_04.suspects.ozzy.states.hidden.status",
              "prop_1": "cases.case_04.suspects.ozzy.states.hidden.prop_1",
              "prop_2": "cases.case_04.suspects.ozzy.states.hidden.prop_2",
              "target_text": "cases.case_04.suspects.ozzy.states.hidden.target_text",
              "talkable": false
            },
            "dialog_1": {
              "talk_movie": "m23",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "ozzy",
                    "clues": [
                      "head_wound"
                    ],
                    "motive": true,
                    "text": "cases.case_04.add_suspect_clues.ozzy.head_wound"
                  }
                },
                {
                  "progress_chapter": "301_suspect_ozzy_dialog_1"
                },
                {
                  "add_custom_task": "ozzy_deduction"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m29_1",
              "on_talk": [
                {
                  "progress_chapter": "311_suspect_ozzy_dialog_2"
                },
                {
                  "init_arrest_state": null
                }
              ]
            }
          }
        },
        "becky_stone": {
          "clues": {
            "head_wound": {
              "match": true
            },
            "blood_group": {
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_becky",
              "portrait": "images/becky_portret",
              "title": "cases.case_04.suspects.becky_stone.states.default.title",
              "status": "cases.case_04.suspects.becky_stone.states.default.status",
              "prop_1": "cases.case_04.suspects.becky_stone.states.default.prop_1",
              "prop_2": "cases.case_04.suspects.becky_stone.states.default.prop_2",
              "target_text": "cases.case_04.suspects.becky_stone.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m19",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "becky_stone",
                    "motive": true,
                    "text": "cases.case_04.add_motive.becky_stone"
                  }
                },
                {
                  "add_lab_item": "model_survey"
                },
                {
                  "progress_chapter": "210_suspect_becky_stone_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m21",
              "on_talk": [
                {
                  "show_movie": "m22"
                },
                {
                  "update_suspect_state": {
                    "suspect": "becky_stone",
                    "alibi": true,
                    "text": "cases.case_04.add_alibi.becky_stone"
                  }
                },
                {
                  "progress_chapter": "213_suspect_becky_stone_dialog_2"
                },
                {
                  "check_transition": "end_chapter_2"
                }
              ]
            }
          }
        },
        "hallowell": {
          "clues": {
            "head_wound": {
              "match": true
            },
            "phone_ring": {
              "img": "images/inc_call",
              "match": true
            },
            "blood_group": {
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_producer",
              "portrait": "images/hallowell_portret",
              "title": "cases.case_04.suspects.hallowell.states.default.title",
              "status": "cases.case_04.suspects.hallowell.states.default.status",
              "prop_1": "cases.case_04.suspects.hallowell.states.default.prop_1",
              "prop_2": "cases.case_04.suspects.hallowell.states.default.prop_2",
              "target_text": "cases.case_04.suspects.hallowell.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m15",
              "on_talk": [
                {
                  "show_movie": "m16"
                },
                {
                  "update_suspect_state": {
                    "suspect": "hallowell",
                    "clues": [
                      "head_wound",
                      "blood_group"
                    ],
                    "text": "cases.case_04.add_suspect_clues.hallowell.head_wound_blood_group"
                  }
                },
                {
                  "add_forensic_item": "model_search"
                },
                {
                  "progress_chapter": "207_suspect_hallowell_dialog_1"
                },
                {
                  "add_custom_task": "hallowell_deduction"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m33",
              "on_talk": [
                {
                  "show_movie": "m34"
                },
                {
                  "set_suspect_state": {
                    "suspect": "hallowell",
                    "state": "default"
                  }
                },
                {
                  "progress_chapter": "404_suspect_hallowell_dialog_2"
                },
                {
                  "add_unlock_new_case_task": {
                    "case": "case_05",
                    "cost": 2
                  }
                }
              ]
            }
          }
        }
      },
      "info": {
        "victim": {
          "found": {
            "name": "cases.case_04.info.victim.found.name",
            "description": "cases.case_04.info.victim.found.description",
            "img": "images/dead_man"
          },
          "analyzed": {
            "name": "cases.case_04.info.victim.analyzed.name",
            "description": "cases.case_04.info.victim.analyzed.description",
            "img": "images/Ronnie_Hard_portrait"
          }
        },
        "weapon": {
          "found": {
            "name": "cases.case_04.info.weapon.found.name",
            "description": "cases.case_04.info.weapon.found.description",
            "img": "images/gun"
          },
          "analyzed": {
            "name": "cases.case_04.info.weapon.analyzed.name",
            "description": "cases.case_04.info.weapon.analyzed.description",
            "img": "images/gun"
          }
        },
        "killer": {
          "arrested": {
            "name": "cases.case_04.info.killer.arrested.name",
            "description": "cases.case_04.info.killer.arrested.description",
            "img": "images/ozzy_portret"
          }
        }
      },
      "chapters": [
        {
          "size": 8,
          "img": "images/chapter_41",
          "name": "cases.case_04.chapters.1.name",
          "description": "cases.case_04.chapters.1.description",
          "on_start": []
        },
        {
          "size": 14,
          "img": "images/chapter_42",
          "name": "cases.case_04.chapters.2.name",
          "description": "cases.case_04.chapters.2.description",
          "on_start": [
            {
              "add_forensic_item": "leaves"
            },
            {
              "show_movie": "m8_1"
            }
          ]
        },
        {
          "size": 12,
          "img": "images/chapter_43",
          "name": "cases.case_04.chapters.3.name",
          "description": "cases.case_04.chapters.3.description",
          "on_start": [
            {
              "show_movie": "m22_1"
            },
            {
              "set_suspect_state": {
                "suspect": "ozzy",
                "state": "dialog_1"
              }
            }
          ]
        },
        {
          "size": 4,
          "img": "images/chapter_44",
          "name": "cases.case_04.chapters.4.name",
          "description": "cases.case_04.chapters.4.description",
          "description_end": "cases.case_04.chapters.4.description_end",
          "on_start": [
            {
              "show_movie": "m30"
            },
            {
              "set_scene_state": {
                "scene": "scene_3",
                "state": "2"
              }
            }
          ]
        }
      ],
      "on_start": [
        {
          "show_movie": "m1"
        },
        {
          "open_new_scene": "scene_1"
        },
        {
          "set_scene_state": {
            "scene": "scene_1",
            "state": "1"
          }
        }
      ],
      "arrest": {
        "killer": "ozzy",
        "on_success": [
          {
            "show_movie": "m29_2"
          },
          {
            "set_info_state": {
              "type": "killer",
              "state": "arrested"
            }
          },
          {
            "progress_chapter": "312_init_arrest_state_ozzy"
          },
          {
            "add_start_next_chapter_task": {
              "cost": 2
            }
          }
        ],
        "on_fail": [
          {
            "show_movie": "m_wrong_arrest"
          }
        ]
      },
      "transitions": {
        "end_chapter_1": {
          "preconditions": [
            {
              "forensic_item_state": {
                "torn_paper": "explored",
                "bullet": "explored"
              }
            },
            {
              "lab_item_state": {
                "victim_blood": "done"
              }
            },
            {
              "scene_state": {
                "scene_2": "default"
              }
            }
          ],
          "on_complete": [
            {
              "add_start_next_chapter_task": {
                "cost": 2
              }
            }
          ]
        },
        "end_chapter_2": {
          "preconditions": [
            {
              "lab_item_state": {
                "baseball_bat": "done"
              }
            },
            {
              "lab_item_state": {
                "onboard_computer": "done"
              }
            },
            {
              "suspect_state_talked": {
                "becky_stone": "dialog_2"
              }
            }
          ],
          "on_complete": [
            {
              "add_start_next_chapter_task": {
                "cost": 2
              }
            }
          ]
        },
        "accuse_ozzy": {
          "preconditions": [
            {
              "lab_item_state": {
                "bloody_bandages": "done"
              }
            },
            {
              "forensic_item_state": {
                "note": "explored",
                "gun": "explored",
                "mobile_phone": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "set_suspect_state": {
                "suspect": "ozzy",
                "state": "dialog_2"
              }
            }
          ]
        }
      },
      "deductions": {
        "ozzy": {
          "suspect_img": "images/char_dealer_normal",
          "background_img": "images/_back_lab"
        },
        "hallowell": {
          "suspect_img": "images/char_producer_nadmenno",
          "background_img": "images/_back_lab"
        }
      },
      "custom_tasks": {
        "robin_pax": {
          "cost": 1,
          "img": "images/pax_portret",
          "action_text": "cases.case_04.custom_tasks.robin_pax.action_text",
          "target_text": "cases.case_04.custom_tasks.robin_pax.target_text",
          "on_click": [
            {
              "show_movie": "m6"
            },
            {
              "add_forensic_item": "house_plan"
            },
            {
              "add_suspect": "ozzy"
            },
            {
              "set_suspect_state": {
                "suspect": "ozzy",
                "state": "hidden"
              }
            },
            {
              "progress_chapter": "102_custom_task_robin_pax"
            }
          ]
        },
        "ozzy_deduction": {
          "cost": 1,
          "img": "images/ozzy_portret",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_04.custom_tasks.ozzy_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "ozzy"
            },
            {
              "show_movie": "m24"
            },
            {
              "add_forensic_item": "camera_recording"
            },
            {
              "open_new_scene": "scene_5"
            },
            {
              "set_scene_state": {
                "scene": "scene_5",
                "state": "1"
              }
            },
            {
              "progress_chapter": "302_custom_tusk_deduction_ozzy"
            }
          ]
        },
        "hallowell_deduction": {
          "cost": 1,
          "img": "images/hallowell_portret",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_04.custom_tasks.hallowell.target_text",
          "on_click": [
            {
              "show_deductiond": "hallowell"
            },
            {
              "show_movie": "m16_2"
            },
            {
              "progress_chapter": "208_custom_task_hallowell_deduction"
            },
            {
              "update_suspect_state": {
                "suspect": "hallowell",
                "motive": true,
                "text": "cases.case_04.add_motive.hallowell"
              }
            },
            {
              "open_new_scene": "scene_4"
            },
            {
              "set_scene_state": {
                "scene": "scene_4",
                "state": "1"
              }
            }
          ]
        }
      }
    },
    "case_05": {
      "schema_id": "case",
      "name": "cases.case_05.name",
      "description": "cases.case_05.description",
      "scene_order": [
        "scene_1",
        "scene_2",
        "bonus_1",
        "scene_3",
        "scene_4",
        "bonus_2",
        "scene_5",
        "scene_6",
        "bonus_3"
      ],
      "scenes": {
        "scene_1": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_05.scenes.scene_1.name",
          "target_text": "cases.case_05.scenes.scene_1.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_penthouse",
          "img": "hog_penthouse/thumb",
          "items": {
            "woman": {
              "name": "cases.case_05.scenes.scene_1.items.woman.name",
              "img": "images/dead_pic",
              "layer": "woman_special"
            },
            "footprint": {
              "name": "cases.case_05.scenes.scene_1.items.footprint.name",
              "img": "images/footprint",
              "layer": "footprint_special"
            },
            "torn_paper": {
              "name": "cases.case_05.scenes.scene_1.items.torn_paper.name",
              "img": "images/torn_papers",
              "layer": "torn_paper_special"
            },
            "pistol": {
              "name": "cases.case_05.scenes.scene_1.items.pistol.name",
              "img": "images/revolver",
              "layer": "gun_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "woman",
                "footprint",
                "torn_paper",
                "pistol"
              ],
              "on_complete": [
                {
                  "show_movie": "m2"
                },
                {
                  "set_info_state": {
                    "type": "victim",
                    "state": "found"
                  }
                },
                {
                  "add_forensic_item": "body"
                },
                {
                  "add_lab_item": "sled"
                },
                {
                  "add_forensic_item": "note"
                },
                {
                  "add_forensic_item": "pistol"
                },
                {
                  "update_killer_state": {
                    "clues": [
                      "man_185",
                      "tolstovka"
                    ],
                    "text": "cases.case_05.add_clues.man_185.tolstovka"
                  }
                },
                {
                  "progress_chapter": "101_explored_scene_1_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_2": {
          "scores": [
            1400000,
            1900000,
            2500000,
            3200000,
            4000000
          ],
          "name": "cases.case_05.scenes.scene_2.name",
          "target_text": "cases.case_05.scenes.scene_2.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_villa",
          "img": "hog_villa/thumb",
          "items": {
            "woman_purse": {
              "name": "cases.case_05.scenes.scene_2.items.woman_purse.name",
              "img": "images/woman_purse",
              "layer": "purse_special"
            },
            "scotch": {
              "name": "cases.case_05.scenes.scene_2.items.scotch.name",
              "img": "images/scotch",
              "layer": "scotch_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "woman_purse",
                "scotch"
              ],
              "on_complete": [
                {
                  "show_movie": "m9"
                },
                {
                  "add_forensic_item": "woman_purse"
                },
                {
                  "add_lab_item": "scotch"
                },
                {
                  "progress_chapter": "107_explored_scene_2_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_3": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_05.scenes.scene_3.name",
          "target_text": "cases.case_05.scenes.scene_3.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_club",
          "img": "hog_club/thumb",
          "items": {
            "security_cam": {
              "name": "cases.case_05.scenes.scene_3.items.security_cam.name",
              "img": "images/security_cam",
              "layer": "camera_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "security_cam"
              ],
              "on_complete": [
                {
                  "show_movie": "m14"
                },
                {
                  "add_lab_item": "security_cam"
                },
                {
                  "progress_chapter": "201_explored_scene_3_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_4": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_05.scenes.scene_4.name",
          "target_text": "cases.case_05.scenes.scene_4.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_street",
          "img": "hog_street/thumb",
          "items": {
            "cocaine_pack": {
              "name": "cases.case_05.scenes.scene_4.items.cocaine_pack.name",
              "img": "images/cock",
              "layer": "cock_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "cocaine_pack"
              ],
              "on_complete": [
                {
                  "show_movie": "m24"
                },
                {
                  "add_lab_item": "cocaine_pack"
                },
                {
                  "progress_chapter": "208_explored_scene_4_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_5": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_05.scenes.scene_5.name",
          "target_text": "cases.case_05.scenes.scene_5.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_room",
          "img": "hog_room/thumb",
          "items": {
            "scotch_2": {
              "name": "cases.case_05.scenes.scene_5.items.scotch_2.name",
              "img": "images/scotch_2",
              "layer": "scotch2_special"
            },
            "photos": {
              "name": "cases.case_05.scenes.scene_5.items.photos.name",
              "img": "images/stack_of_photos",
              "layer": "photos_special"
            },
            "drug": {
              "name": "cases.case_05.scenes.scene_5.items.drug.name",
              "img": "images/cock",
              "layer": "cock_special"
            },
            "money_bundle": {
              "name": "cases.case_05.scenes.scene_5.items.money_bundle.name",
              "img": "images/cash",
              "layer": "10"
            }
          },
          "states": {
            "1": {
              "items": [
                "scotch_2",
                "photos",
                "drug"
              ],
              "on_complete": [
                {
                  "show_movie": "m30"
                },
                {
                  "add_forensic_item": "scotch_2"
                },
                {
                  "add_forensic_item": "stack_of_photos"
                },
                {
                  "add_lab_item": "drug"
                },
                {
                  "progress_chapter": "303_explored_scene_5_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "money_bundle"
              ],
              "on_complete": [
                {
                  "show_movie": "m47"
                },
                {
                  "add_forensic_item": "money_bundle"
                },
                {
                  "progress_chapter": "412_explored_scene_5_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_6": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_05.scenes.scene_6.name",
          "target_text": "cases.case_05.scenes.scene_6.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "hog_butik",
          "img": "hog_butik/thumb",
          "items": {
            "documents": {
              "name": "cases.case_05.scenes.scene_6.items.documents.name",
              "img": "images/papers_special",
              "layer": "papers_special"
            },
            "tablet": {
              "name": "cases.case_05.scenes.scene_6.items.tablet.name",
              "img": "images/tablet",
              "layer": "tablet_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "documents"
              ],
              "on_complete": [
                {
                  "show_movie": "m37"
                },
                {
                  "add_forensic_item": "documents"
                },
                {
                  "progress_chapter": "402_scene_6_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "tablet"
              ],
              "on_complete": [
                {
                  "show_movie": "m39"
                },
                {
                  "add_forensic_item": "morgans_tablet"
                },
                {
                  "progress_chapter": "405_explored_scene_6_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "bonus_1": {
          "scores": [
            1000000,
            1500000,
            2100000,
            2800000,
            3600000
          ],
          "name": "cases.case_05.scenes.bonus_1.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 4,
          "type": "puzzle",
          "path": "images/penthouse_puzzle",
          "img": "images/5_puzzle",
          "states": {
            "default": {}
          }
        },
        "bonus_2": {
          "scores": [
            2000000,
            2500000,
            3100000,
            3800000,
            4600000
          ],
          "name": "cases.case_05.scenes.bonus_2.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 10,
          "type": "hogTime",
          "path": "hog_club",
          "img": "images/5_time_attack",
          "items": {
            "security_cam": {
              "name": "cases.case_05.scenes.scene_3.items.security_cam.name",
              "img": "images/security_cam",
              "layer": "camera_special"
            }
          },
          "states": {
            "default": {}
          }
        },
        "bonus_3": {
          "scores": [
            2000000,
            2500000,
            3100000,
            3800000,
            4600000
          ],
          "name": "cases.case_05.scenes.bonus_3.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 20,
          "type": "hogDiff",
          "path": "hog_room",
          "img": "images/5_diff",
          "items": {
            "scotch_2": {
              "name": "cases.case_05.scenes.scene_5.items.scotch_2.name",
              "img": "images/scotch_2",
              "layer": "scotch2_special"
            },
            "photos": {
              "name": "cases.case_05.scenes.scene_5.items.photos.name",
              "img": "images/stack_of_photos",
              "layer": "photos_special"
            },
            "drug": {
              "name": "cases.case_05.scenes.scene_5.items.drug.name",
              "img": "images/cock_pile",
              "layer": "cock_special"
            },
            "money_bundle": {
              "name": "cases.case_05.scenes.scene_5.items.money_bundle.name",
              "img": "images/cash",
              "layer": "010"
            }
          },
          "states": {
            "default": {}
          }
        }
      },
      "forensic_items": {
        "body": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.body.target_text",
          "states": {
            "new": {
              "img": "images/dead_pic",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_body_fon",
                  "target": "images/mg_bullet_1",
                  "count": 1,
                  "sizeX": 8,
                  "sizeY": 10,
                  "completeText": "cases.case_05.forensic_items.body.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.body.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/mg_bullet_1",
                "on_complete": [
                  {
                    "show_movie": "m3"
                  },
                  {
                    "set_info_state": {
                      "type": "victim",
                      "state": "analyzed"
                    }
                  },
                  {
                    "update_killer_state": {
                      "clues": [
                        "scotch",
                        "drug"
                      ],
                      "text": "cases.case_05.add_clues.scotch.drug"
                    }
                  },
                  {
                    "progress_chapter": "102_explored_forensic_item_body"
                  },
                  {
                    "check_transition": "accuse_tyler"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/dead_pic",
              "wrapped": false,
              "movie": "m_body"
            }
          }
        },
        "note": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.note.target_text",
          "states": {
            "new": {
              "img": "images/torn_papers",
              "minigame": {
                "data": {
                  "type": "puzzle",
                  "back": "images/_back_minigames",
                  "path": "images/Broken_item_MG",
                  "completeText": "cases.case_05.forensic_items.note.states.new.minigame.complete",
                  "linkInfo": "01:02,03,04;02:01,04;03:01,04,05,06;04:01,02,03,06;05:03,06;06:02,03,04,05"
                },
                "title": "cases.case_05.forensic_items.note.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/note_complete",
                "on_complete": [
                  {
                    "show_movie": "m5"
                  },
                  {
                    "add_suspect": "tyler"
                  },
                  {
                    "progress_chapter": "103_explored_forensic_item_note"
                  },
                  {
                    "check_transition": "accuse_tyler"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/note_complete",
              "movie": "m_note"
            }
          }
        },
        "pistol": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.pistol.target_text",
          "states": {
            "new": {
              "img": "images/revolver",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_pistol_fon",
                  "target": "images/fingerprint_mg",
                  "count": 3,
                  "sizeX": 8,
                  "sizeY": 10,
                  "completeText": "cases.case_05.forensic_items.pistol.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.pistol.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/fingerprint_mg",
                "on_complete": [
                  {
                    "show_movie": "m6"
                  },
                  {
                    "set_info_state": {
                      "type": "weapon",
                      "state": "found"
                    }
                  },
                  {
                    "progress_chapter": "105_explored_forensic_iitem_pistol"
                  },
                  {
                    "check_transition": "accuse_tyler"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/revolver",
              "movie": "m_pistol"
            }
          }
        },
        "woman_purse": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.woman_purse.target_text",
          "states": {
            "new": {
              "img": "images/woman_purse",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "path": "images/woman_trash",
                  "target": "images/smartphone_mg",
                  "trashCount": 60,
                  "radius": 400,
                  "completeText": "cases.case_05.forensic_items.woman_purse.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.woman_purse.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/smartphone",
                "on_complete": [
                  {
                    "show_movie": "m10"
                  },
                  {
                    "progress_chapter": "109_explored_forensic_item_woman_purse"
                  },
                  {
                    "add_forensic_item": "smartphone"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/woman_purse",
              "wrapped": false,
              "movie": "m_woman_purse"
            }
          }
        },
        "smartphone": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.dianas_phone.target_text",
          "states": {
            "new": {
              "img": "images/smartphone",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/1, images/2, images/3, images/4, images/5, images/6, images/7, images/8, images/9",
                  "sizeX": 6,
                  "sizeY": 3,
                  "completeText": "cases.case_05.forensic_items.dianas_phone.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.dianas_phone.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m11"
                  },
                  {
                    "add_suspect": "banksy"
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "banksy",
                      "state": "hidden"
                    }
                  },
                  {
                    "progress_chapter": "110_explored_forensic_item_smartphone"
                  },
                  {
                    "check_transition": "end_chapter_1"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/smartphone",
              "movie": "m_smartphone"
            }
          }
        },
        "club_photos": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.club_photos.target_text",
          "states": {
            "new": {
              "img": "images/club_photo",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/photo1, images/photo2, images/photo3, images/photo4, images/photo5, images/photo6, images/photo7, images/photo8, images/photo_goal",
                  "sizeX": 6,
                  "sizeY": 3,
                  "completeText": "cases.case_05.forensic_items.club_photos.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.club_photos.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/photo_goal",
                "on_complete": [
                  {
                    "show_movie": "m16"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "tyler",
                      "alibi": false,
                      "text": "cases.case_05.add_alibi.tyler"
                    }
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "tyler",
                      "state": "dialog_2"
                    }
                  },
                  {
                    "progress_chapter": "203_explored_forensic_item_club_photos"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/club_photo",
              "movie": "m_club_photos"
            }
          }
        },
        "ronsun_watch": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.ronsun_watch.target_text",
          "states": {
            "new": {
              "img": "images/female_watches",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_watch_fon",
                  "target": "images/fingerprint_mg",
                  "count": 3,
                  "sizeX": 8,
                  "sizeY": 10,
                  "completeText": "cases.case_05.forensic_items.ronsun_watch.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.ronsun_watch.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/fingerprint_mg",
                "on_complete": [
                  {
                    "show_movie": "m20"
                  },
                  {
                    "add_suspect": "bolton"
                  },
                  {
                    "show_movie": "m21"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "bolton",
                      "motive": true,
                      "text": "cases.case_05.add_motive.bolton"
                    }
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "bolton",
                      "state": "dialog_1"
                    }
                  },
                  {
                    "progress_chapter": "206_explored_forensic_item_ronsun_watch"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/female_watches",
              "movie": "m_ronsun_watch"
            }
          }
        },
        "scotch_2": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.scotch_2.target_text",
          "states": {
            "new": {
              "img": "images/scotch_2",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/scotch_mg_1, images/scotch_mg_2, images/scotch_mg_3, images/scotch_mg_4, images/scotch_mg_5, images/scotch_mg_6, images/scotch_mg_7, images/scotch_mg_8, images/scotch_mg_9, images/scotch_mg_10, images/scotch_mg_11, images/scotch_mg_12",
                  "sizeX": 6,
                  "sizeY": 3,
                  "completeText": "cases.case_05.forensic_items.scotch_2.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.scotch_2.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m31"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "banksy",
                      "clues": [
                        "scotch"
                      ],
                      "text": "cases.case_05.add_suspect_clues.banksy.scotch"
                    }
                  },
                  {
                    "progress_chapter": "304_explored_forensic_item_scotch_2"
                  },
                  {
                    "check_transition": "accuse_banksy"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/scotch_2",
              "movie": "m_scotch_2"
            }
          }
        },
        "stack_of_photos": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.stack_of_photos.target_text",
          "states": {
            "new": {
              "img": "images/stack_of_photos",
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/banksy_goal",
                  "path": "images/photo",
                  "trashCount": 30,
                  "radius": 400,
                  "completeText": "cases.case_05.forensic_items.stack_of_photos.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.stack_of_photos.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/banksy_goal",
                "on_complete": [
                  {
                    "show_movie": "m32"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "banksy",
                      "clues": [
                        "tolstovka"
                      ],
                      "text": "cases.case_05.add_suspect_clues.banksy.tolstovka"
                    }
                  },
                  {
                    "progress_chapter": "306_explored_forensic_item_stack_of_photos"
                  },
                  {
                    "check_transition": "accuse_banksy"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/banksy_explored",
              "movie": "m_stack_of_photos"
            }
          }
        },
        "morgans_tablet": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.morgans_tablet.target_text",
          "states": {
            "new": {
              "img": "images/tablet",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/1, images/2, images/3, images/4, images/5, images/6, images/7, images/8, images/9",
                  "sizeX": 6,
                  "sizeY": 3,
                  "completeText": "cases.case_05.forensic_items.morgans_tablet.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.morgans_tablet.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m40"
                  },
                  {
                    "add_forensic_item": "morgans_mail"
                  },
                  {
                    "add_forensic_item": "morgans_photos"
                  },
                  {
                    "progress_chapter": "406_explored_forensic_item_morgans_tablet"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/tablet",
              "movie": "m_morgans_tablet"
            }
          }
        },
        "money_bundle": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.money_bundle.target_text",
          "states": {
            "new": {
              "img": "images/more_money",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/1, images/2, images/3, images/4, images/5, images/6, images/7, images/8, images/9",
                  "sizeX": 6,
                  "sizeY": 3,
                  "completeText": "cases.case_05.forensic_items.money_bundle.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.money_bundle.states.new.minigame.title",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m48"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "banksy",
                      "motive": true,
                      "text": "cases.case_05.add_motive.banksy"
                    }
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "morgan",
                      "state": "dialog_2"
                    }
                  },
                  {
                    "progress_chapter": "413_explored_forensic_item_money_bundle"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/more_money",
              "wrapped": false,
              "movie": "m_money_bundle"
            }
          }
        },
        "documents": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.documents.target_text",
          "states": {
            "new": {
              "img": "images/papers_special",
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/mg_note2",
                  "path": "images/trash_minigame_case5",
                  "trashCount": 30,
                  "radius": 400,
                  "completeText": "cases.case_05.forensic_items.documents.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.documents.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/note2",
                "on_complete": [
                  {
                    "show_movie": "m37_2"
                  },
                  {
                    "add_suspect": "morgan"
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "morgan",
                      "state": "dialog_1"
                    }
                  },
                  {
                    "progress_chapter": "403_explored_forensic_item_documents"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/papers_special",
              "movie": "m_documents"
            }
          }
        },
        "morgans_mail": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.morgans_mail.target_text",
          "states": {
            "new": {
              "img": "images/mail_locked",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/mail_unlocked",
                  "path": "images/icons_mg_case5",
                  "trashCount": 30,
                  "radius": 400,
                  "completeText": "cases.case_05.forensic_items.morgans_mail.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.morgans_mail.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/mail_unlocked",
                "on_complete": [
                  {
                    "show_movie": "m41"
                  },
                  {
                    "add_lab_item": "morgans_letter"
                  },
                  {
                    "add_lab_item": "dianas_letter"
                  },
                  {
                    "progress_chapter": "408_explored_forensic_item_morgans_mail"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/mail_unlocked",
              "wrapped": false,
              "movie": "m_morgans_mail"
            }
          }
        },
        "morgans_photos": {
          "initial_state": "new",
          "target_text": "cases.case_05.forensic_items.morgans_photos.target_text",
          "states": {
            "new": {
              "img": "images/photos_locked",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/banksy_morgan_1, images/banksy_morgan_2, images/banksy_morgan_3, images/banksy_morgan_4, images/banksy_morgan_5, images/banksy_morgan_6, images/banksy_morgan_7, images/banksy_morgan_8, images/banksy_morgan_9",
                  "sizeX": 6,
                  "sizeY": 3,
                  "completeText": "cases.case_05.forensic_items.morgans_photos.states.new.minigame.complete"
                },
                "title": "cases.case_05.forensic_items.morgans_photos.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/banksy_and_morgan",
                "on_complete": [
                  {
                    "show_movie": "m44"
                  },
                  {
                    "progress_chapter": "407_explored_forensic_item_morgans_photos"
                  },
                  {
                    "check_transition": "accuse_morgan"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/photos_unlocked",
              "wrapped": false,
              "movie": "m_morgans_photos"
            }
          }
        },
        "sled": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/footprint",
              "movie": "m_sled",
              "wrapped": false
            }
          }
        },
        "scotch": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/scotch",
              "movie": "m_scotch"
            }
          }
        },
        "security_cam": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/security_cam",
              "movie": "m_security_cam"
            }
          }
        },
        "cocaine_pack": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/cock",
              "movie": "m_cocaine_pack"
            }
          }
        },
        "drug": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/cock_pile",
              "movie": "m_drug"
            }
          }
        },
        "dianas_letter": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/envelope",
              "movie": "m_dianas_letter",
              "wrapped": false
            }
          }
        },
        "morgans_letter": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/envelope2",
              "movie": "m_morgans_letter",
              "wrapped": false
            }
          }
        }
      },
      "lab_items": {
        "sled": {
          "name": "cases.case_05.lab_items.sled.name",
          "target_text": "cases.case_05.lab_items.sled.target_text",
          "img": "images/footprint",
          "item_type": "technics",
          "analyze_time": 3600,
          "analyze_movie": "m4",
          "on_analyze": [
            {
              "update_killer_state": {
                "clues": [
                  "sled_44"
                ],
                "text": "cases.case_05.add_clues.sled_44"
              }
            },
            {
              "add_forensic_item": "sled"
            },
            {
              "progress_chapter": "104_explored_lab_item_sled"
            },
            {
              "check_transition": "accuse_tyler"
            }
          ]
        },
        "scotch": {
          "name": "cases.case_05.lab_items.scotch.name",
          "target_text": "cases.case_05.lab_items.scotch.target_text",
          "img": "images/scotch",
          "item_type": "chemicals",
          "analyze_time": 21600,
          "analyze_movie": "m12",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "tyler",
                "clues": [
                  "scotch"
                ],
                "text": "cases.case_05.add_suspect_clues.tyler.scotch"
              }
            },
            {
              "add_forensic_item": "scotch"
            },
            {
              "progress_chapter": "108_explored_lab_item_scotch"
            },
            {
              "check_transition": "end_chapter_1"
            }
          ]
        },
        "security_cam": {
          "name": "cases.case_05.lab_items.security_cam.name",
          "target_text": "cases.case_05.lab_items.security_cam.target_text",
          "img": "images/security_cam",
          "item_type": "hack",
          "analyze_time": 21600,
          "analyze_movie": "m15",
          "on_analyze": [
            {
              "add_forensic_item": "club_photos"
            },
            {
              "add_forensic_item": "security_cam"
            },
            {
              "progress_chapter": "202_explored_lab_item_security_cam"
            }
          ]
        },
        "cocaine_pack": {
          "name": "cases.case_05.lab_items.cocaine_pack.name",
          "target_text": "cases.case_05.lab_items.cocaine_pack.target_text",
          "img": "images/cock",
          "item_type": "chemicals",
          "analyze_time": 14400,
          "analyze_movie": "m25",
          "on_analyze": [
            {
              "set_suspect_state": {
                "suspect": "bolton",
                "state": "dialog_2"
              }
            },
            {
              "add_forensic_item": "cocaine_pack"
            },
            {
              "progress_chapter": "209_explored_lab_item_cocaine_pack"
            }
          ]
        },
        "drug": {
          "name": "cases.case_05.lab_items.drug.name",
          "target_text": "cases.case_05.lab_items.drug.target_text",
          "img": "images/cock_pile",
          "item_type": "chemicals",
          "analyze_time": 43200,
          "analyze_movie": "m33",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "banksy",
                "clues": [
                  "drug"
                ],
                "text": "cases.case_05.add_suspect_clues.banksy.drug"
              }
            },
            {
              "set_suspect_state": {
                "suspect": "banksy",
                "state": "dialog_2"
              }
            },
            {
              "add_forensic_item": "drug"
            },
            {
              "progress_chapter": "305_explored_lab_item_drug"
            }
          ]
        },
        "dianas_letter": {
          "name": "cases.case_05.lab_items.dianas_letter.name",
          "target_text": "cases.case_05.lab_items.dianas_letter.target_text",
          "img": "images/envelope",
          "item_type": "docs",
          "analyze_time": 3600,
          "analyze_movie": "m42",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "morgan",
                "motive": true,
                "text": "cases.case_05.add_motive.morgan"
              }
            },
            {
              "add_forensic_item": "dianas_letter"
            },
            {
              "progress_chapter": "410_explored_lab_item_dianas_letter"
            },
            {
              "check_transition": "accuse_morgan"
            }
          ]
        },
        "morgans_letter": {
          "name": "cases.case_05.lab_items.morgans_letter.name",
          "target_text": "cases.case_05.lab_items.morgans_letter.target_text",
          "img": "images/envelope2",
          "item_type": "docs",
          "analyze_time": 3600,
          "analyze_movie": "m43",
          "on_analyze": [
            {
              "add_forensic_item": "morgans_letter"
            },
            {
              "progress_chapter": "409_explored_lab_item_morgans_letter"
            },
            {
              "check_transition": "accuse_morgan"
            }
          ]
        },
        "analyze_morgan_accounts": {
          "name": "cases.case_05.lab_items.analyze_morgan_accounts.name",
          "target_text": "cases.case_05.lab_items.analyze_morgan_accounts.target_text",
          "img": "images/schet",
          "item_type": "docs",
          "analyze_time": 10800,
          "analyze_movie": "m46",
          "on_analyze": [
            {
              "set_scene_state": {
                "scene": "scene_5",
                "state": "2"
              }
            },
            {
              "progress_chapter": "411_explored_lab_item_analyze_morgan_accounts"
            }
          ]
        }
      },
      "clues": {
        "man_185": {
          "img": "images/man_1-85"
        },
        "tolstovka": {
          "img": "images/tolstovka"
        },
        "scotch": {
          "img": "images/scotch"
        },
        "sled_44": {
          "img": "images/otpechatok"
        },
        "drug": {
          "img": "images/cock"
        }
      },
      "suspect_properties": {
        "prop_1": "age",
        "prop_2": "weight"
      },
      "suspects": {
        "tyler": {
          "clues": {
            "man_185": {
              "match": false
            },
            "tolstovka": {
              "img": "images/tolstovka",
              "match": true
            },
            "scotch": {
              "img": "images/scotch",
              "match": true
            },
            "sled_44": {
              "img": "images/otpechatok",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_friend",
              "portrait": "images/friend_portret",
              "title": "cases.case_05.suspects.tyler.states.default.title",
              "status": "cases.case_05.suspects.tyler.states.default.status",
              "prop_1": "cases.case_05.suspects.tyler.states.default.prop_1",
              "prop_2": "cases.case_05.suspects.tyler.states.default.prop_2",
              "target_text": "cases.case_05.suspects.tyler.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m7",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "tyler",
                    "clues": [
                      "sled_44",
                      "man_185"
                    ],
                    "text": "cases.case_05.add_suspect_clues.tyler.sled_44.man_185"
                  }
                },
                {
                  "open_new_scene": "scene_2"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_2",
                    "state": "1"
                  }
                },
                {
                  "show_movie": "m8"
                },
                {
                  "progress_chapter": "106_suspect_tyler_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m17",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "tyler",
                    "motive": true,
                    "text": "cases.case_05.add_motive.tyler"
                  }
                },
                {
                  "progress_chapter": "204_suspect_tyler_dialog_2"
                },
                {
                  "show_movie": "m18"
                },
                {
                  "add_custom_task": "informant"
                }
              ]
            },
            "dialog_3": {
              "talk_movie": "m29",
              "on_talk": [
                {
                  "open_new_scene": "scene_5"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_5",
                    "state": "1"
                  }
                },
                {
                  "progress_chapter": "302_suspect_tyler_dialog_3"
                }
              ]
            },
            "dialog_4": {
              "talk_movie": "m36",
              "on_talk": [
                {
                  "open_new_scene": "scene_6"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_6",
                    "state": "1"
                  }
                },
                {
                  "progress_chapter": "401_suspect_tyler_dialog_4"
                }
              ]
            }
          }
        },
        "banksy": {
          "clues": {
            "sled_44": {
              "img": "images/otpechatok",
              "match": true
            },
            "scotch": {
              "img": "images/scotch",
              "match": true
            },
            "tolstovka": {
              "img": "images/tolstovka",
              "match": true
            },
            "drug": {
              "img": "images/cock_pile",
              "match": true
            },
            "man_185": {
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_murderer",
              "portrait": "images/murderer_portret",
              "title": "cases.case_05.suspects.banksy.states.default.title",
              "status": "cases.case_05.suspects.banksy.states.default.status",
              "prop_1": "cases.case_05.suspects.banksy.states.default.prop_1",
              "prop_2": "cases.case_05.suspects.banksy.states.default.prop_2",
              "target_text": "cases.case_05.suspects.banksy.states.default.target_text"
            },
            "hidden": {
              "img": "images/tyler_big",
              "title": "cases.case_05.suspects.banksy.states.hidden.title",
              "status": "cases.case_05.suspects.banksy.states.hidden.status",
              "prop_1": "cases.case_05.suspects.banksy.states.hidden.prop_1",
              "prop_2": "cases.case_05.suspects.banksy.states.hidden.prop_2",
              "talkable": false
            },
            "dialog_1": {
              "talk_movie": [
                "m28",
                "m28_1"
              ],
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "banksy",
                    "clues": [
                      "sled_44",
                      "man_185"
                    ],
                    "alibi": false,
                    "text": "cases.case_05.add_suspect_clues.banksy.sled_44.man_185"
                  }
                },
                {
                  "set_suspect_state": {
                    "suspect": "tyler",
                    "state": "dialog_3"
                  }
                },
                {
                  "progress_chapter": "301_suspect_banksy_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m33_1",
              "on_talk": [
                {
                  "check_transition": "accuse_banksy"
                },
                {
                  "progress_chapter": "307_suspect_banksy_dialog_2"
                }
              ]
            }
          }
        },
        "bolton": {
          "clues": {
            "tolstovka": {
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_thieft",
              "portrait": "images/thieft_portret",
              "title": "cases.case_05.suspects.bolton.states.default.title",
              "status": "cases.case_05.suspects.bolton.states.default.status",
              "prop_1": "cases.case_05.suspects.bolton.states.default.prop_1",
              "prop_2": "cases.case_05.suspects.bolton.states.default.prop_2",
              "target_text": "cases.case_05.suspects.bolton.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": [
                "m22",
                "m22_2"
              ],
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "bolton",
                    "clues": [
                      "tolstovka"
                    ],
                    "alibi": false,
                    "text": "cases.case_05.add_suspect_clues.bolton.tolstovka.man_185"
                  }
                },
                {
                  "progress_chapter": "206_suspect_bolton_dialog_1"
                },
                {
                  "add_custom_task": "bolton_deduction"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m26",
              "on_talk": [
                {
                  "progress_chapter": "210_suspect_bolton_dialog_2"
                },
                {
                  "add_start_next_chapter_task": {
                    "cost": 2
                  }
                }
              ]
            }
          }
        },
        "morgan": {
          "states": {
            "default": {
              "img": "images/char_boutique_owner",
              "portrait": "images/boutique_owner_portret",
              "title": "cases.case_05.suspects.morgan.states.default.title",
              "status": "cases.case_05.suspects.morgan.states.default.status",
              "prop_1": "cases.case_05.suspects.morgan.states.default.prop_1",
              "prop_2": "cases.case_05.suspects.morgan.states.default.prop_2",
              "target_text": "cases.case_05.suspects.morgan.states.default.target_text"
            },
            "dialog_1": {
              "action_text": "tasks.talk.action_text2",
              "talk_movie": "m38",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "morgan",
                    "alibi": true,
                    "text": "cases.case_05.add_alibi.morgan"
                  }
                },
                {
                  "set_scene_state": {
                    "scene": "scene_6",
                    "state": "2"
                  }
                },
                {
                  "progress_chapter": "404_suspect_morgan_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "action_text": "tasks.talk.action_text2",
              "talk_movie": "m48_1",
              "on_talk": [
                {
                  "progress_chapter": "414_suspect_morgan_dialog_2"
                },
                {
                  "add_custom_task": "special_arrest"
                }
              ]
            }
          }
        }
      },
      "info": {
        "victim": {
          "found": {
            "name": "cases.case_05.info.victim.found.name",
            "description": "cases.case_05.info.victim.found.description",
            "img": "images/dead_pic"
          },
          "analyzed": {
            "name": "cases.case_05.info.victim.analyzed.name",
            "description": "cases.case_05.info.victim.analyzed.description",
            "img": "images/Diana_portret"
          }
        },
        "weapon": {
          "found": {
            "name": "cases.case_05.info.weapon.found.name",
            "description": "cases.case_05.info.weapon.found.description",
            "img": "images/revolver"
          }
        },
        "killer": {
          "arrested": {
            "name": "cases.case_05.info.killer.arrested.name",
            "description": "cases.case_05.info.killer.arrested.description",
            "img": "images/murderer_portret"
          }
        }
      },
      "chapters": [
        {
          "size": 10,
          "img": "images/chapter_51",
          "name": "cases.case_05.chapters.1.name",
          "description": "cases.case_05.chapters.1.description",
          "on_start": []
        },
        {
          "size": 11,
          "img": "images/chapter_52",
          "name": "cases.case_05.chapters.2.name",
          "description": "cases.case_05.chapters.2.description",
          "on_start": [
            {
              "show_movie": "m13"
            },
            {
              "open_new_scene": "scene_3"
            },
            {
              "set_scene_state": {
                "scene": "scene_3",
                "state": "1"
              }
            }
          ]
        },
        {
          "size": 8,
          "img": "images/chapter_54",
          "name": "cases.case_05.chapters.3.name",
          "description": "cases.case_05.chapters.3.description",
          "on_start": [
            {
              "show_movie": "m27"
            },
            {
              "set_suspect_state": {
                "suspect": "banksy",
                "state": "dialog_1"
              }
            }
          ]
        },
        {
          "size": 16,
          "img": "images/chapter_53",
          "name": "cases.case_05.chapters.4.name",
          "description": "cases.case_05.chapters.4.description",
          "description_end": "cases.case_05.chapters.4.description_end",
          "on_start": [
            {
              "show_movie": "m35"
            },
            {
              "set_suspect_state": {
                "suspect": "tyler",
                "state": "dialog_4"
              }
            }
          ]
        }
      ],
      "on_start": [
        {
          "show_movie": "m1"
        },
        {
          "open_new_scene": "scene_1"
        },
        {
          "set_scene_state": {
            "scene": "scene_1",
            "state": "1"
          }
        }
      ],
      "arrest": {
        "killer": "banksy",
        "on_success": [
          {
            "show_movie": "m34_1"
          },
          {
            "progress_chapter": "308_init_arrest_state_banksy"
          },
          {
            "set_info_state": {
              "type": "killer",
              "state": "arrested"
            }
          },
          {
            "add_start_next_chapter_task": {
              "cost": 2
            }
          }
        ],
        "on_fail": [
          {
            "show_movie": "m_wrong_arrest"
          }
        ]
      },
      "transitions": {
        "accuse_tyler": {
          "preconditions": [
            {
              "forensic_item_state": {
                "body": "explored"
              }
            },
            {
              "lab_item_state": {
                "sled": "done"
              }
            },
            {
              "forensic_item_state": {
                "note": "explored"
              }
            },
            {
              "forensic_item_state": {
                "pistol": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "show_movie": "m5_1"
            },
            {
              "set_suspect_state": {
                "suspect": "tyler",
                "state": "dialog_1"
              }
            }
          ]
        },
        "end_chapter_1": {
          "preconditions": [
            {
              "lab_item_state": {
                "scotch": "done"
              }
            },
            {
              "forensic_item_state": {
                "smartphone": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "add_start_next_chapter_task": {
                "cost": 2
              }
            }
          ]
        },
        "accuse_banksy": {
          "preconditions": [
            {
              "forensic_item_state": {
                "scotch_2": "explored"
              }
            },
            {
              "suspect_state_talked": {
                "banksy": "dialog_2"
              }
            },
            {
              "forensic_item_state": {
                "stack_of_photos": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "show_movie": "m34"
            },
            {
              "init_arrest_state": null
            }
          ]
        },
        "accuse_morgan": {
          "preconditions": [
            {
              "lab_item_state": {
                "morgans_letter": "done"
              }
            },
            {
              "lab_item_state": {
                "dianas_letter": "done"
              }
            },
            {
              "forensic_item_state": {
                "morgans_photos": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "show_movie": "m45"
            },
            {
              "add_lab_item": "analyze_morgan_accounts"
            }
          ]
        }
      },
      "deductions": {
        "bolton": {
          "suspect_img": "images/char_thieft",
          "background_img": "images/_back_lab"
        }
      },
      "custom_tasks": {
        "informant": {
          "cost": 1,
          "img": "images/jose_portret",
          "action_text": "cases.case_05.custom_tasks.informant.action_text",
          "target_text": "cases.case_05.custom_tasks.informant.target_text",
          "on_click": [
            {
              "show_movie": "m19"
            },
            {
              "add_forensic_item": "ronsun_watch"
            },
            {
              "progress_chapter": "205_custom_task_informant"
            }
          ]
        },
        "bolton_deduction": {
          "cost": 1,
          "img": "images/thieft_portret",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_05.custom_tasks.bolton_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "bolton"
            },
            {
              "show_movie": "m22_1"
            },
            {
              "progress_chapter": "207_custom_task_bolton_deduction"
            },
            {
              "show_movie": "m23"
            },
            {
              "open_new_scene": "scene_4"
            },
            {
              "set_scene_state": {
                "scene": "scene_4",
                "state": "1"
              }
            }
          ]
        },
        "special_arrest": {
          "cost": 1,
          "img": "images/boutique_owner_portret",
          "action_text": "tasks.arrest.action_text",
          "target_text": "cases.case_05.suspects.morgan.states.default.target_text",
          "on_click": [
            {
              "show_movie": "m49"
            },
            {
              "set_suspect_state": {
                "suspect": "morgan",
                "state": "default"
              }
            },
            {
              "progress_chapter": "415_custom_task_special_arrest_morgan"
            },
            {
              "add_custom_task": "cross_examination"
            }
          ]
        },
        "cross_examination": {
          "img": "images/perecrestni_dopros",
          "action_text": "cases.case_05.custom_tasks.cross_examination.action_text",
          "target_text": "cases.case_05.custom_tasks.cross_examination.target_text",
          "cost": 1,
          "on_click": [
            {
              "show_movie": "m50"
            },
            {
              "show_movie": "m51"
            },
            {
              "set_suspect_state": {
                "suspect": "tyler",
                "state": "default"
              }
            },
            {
              "progress_chapter": "416_custom_task_cross_examination"
            },
            {
              "add_unlock_new_case_task": {
                "case": "case_06",
                "cost": 2
              }
            }
          ]
        }
      }
    },
    "case_06": {
      "schema_id": "case",
      "name": "cases.case_06.name",
      "description": "cases.case_06.description",
      "scene_order": [
        "scene_1",
        "scene_2",
        "scene_3",
        "bonus_1",
        "scene_4",
        "bonus_2",
        "scene_5",
        "scene_6",
        "bonus_3"
      ],
      "scenes": {
        "scene_1": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_06.scenes.scene_1.name",
          "target_text": "cases.case_06.scenes.scene_1.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "cats_room",
          "img": "cats_room/thumb",
          "items": {
            "vanish_blood_drop": {
              "name": "cases.case_06.scenes.scene_1.items.vanish_blood_drop.name",
              "img": "images/blood",
              "layer": "blood_special"
            },
            "cctv_camera": {
              "name": "cases.case_06.scenes.scene_1.items.cctv_camera.name",
              "img": "images/camera",
              "layer": "camera_special"
            },
            "hacked_lock": {
              "name": "cases.case_06.scenes.scene_1.items.hacked_lock.name",
              "img": "images/lock",
              "layer": "lock_special"
            },
            "torn_curtains": {
              "name": "cases.case_06.scenes.scene_1.items.torn_curtains.name",
              "img": "images/shtora",
              "layer": "scratch_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "vanish_blood_drop",
                "cctv_camera",
                "hacked_lock",
                "torn_curtains"
              ],
              "on_complete": [
                {
                  "show_movie": "m2"
                },
                {
                  "add_lab_item": "vanish_blood_drop"
                },
                {
                  "add_forensic_item": "cctv_camera"
                },
                {
                  "progress_chapter": "101_explored_scene_1_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_2": {
          "scores": [
            1400000,
            1900000,
            2500000,
            3200000,
            4000000
          ],
          "name": "cases.case_06.scenes.scene_2.name",
          "target_text": "cases.case_06.scenes.scene_2.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "maids_room",
          "img": "maids_room/thumb",
          "items": {
            "drug": {
              "name": "cases.case_06.scenes.scene_2.items.drug.name",
              "img": "images/drug",
              "layer": "drugs_special"
            },
            "lacky_photos": {
              "name": "cases.case_06.scenes.scene_2.items.lacky_photos.name",
              "img": "images/cats",
              "layer": "cats_special"
            },
            "cat_collar": {
              "name": "cases.case_06.scenes.scene_2.items.cat_collar.name",
              "img": "images/cat_collar",
              "layer": "collar_special"
            },
            "gel": {
              "name": "cases.case_06.scenes.scene_2.items.gel.name",
              "img": "images/gel_02",
              "layer": "gel_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "drug",
                "lacky_photos"
              ],
              "on_complete": [
                {
                  "show_movie": "m6"
                },
                {
                  "add_forensic_item": "drug"
                },
                {
                  "progress_chapter": "105_explored_scene_2_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "cat_collar",
                "gel"
              ],
              "on_complete": [
                {
                  "show_movie": "m24"
                },
                {
                  "add_forensic_item": "diamonds"
                },
                {
                  "add_lab_item": "spot"
                },
                {
                  "update_suspect_state": {
                    "suspect": "vanessa_thomas",
                    "clues": [
                      "gel"
                    ],
                    "text": "case.case_06.add_clues.vanessa_thomas.gel"
                  }
                },
                {
                  "progress_chapter": "213_explored_scene_2_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_3": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_06.scenes.scene_3.name",
          "target_text": "cases.case_06.scenes.scene_3.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "corridor",
          "img": "corridor/thumb",
          "items": {
            "spy": {
              "name": "cases.case_06.scenes.scene_3.items.spy.name",
              "img": "images/bug_02",
              "layer": "bug_special"
            },
            "gel": {
              "name": "cases.case_06.scenes.scene_3.items.gel.name",
              "img": "images/gel",
              "layer": "gel_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "spy",
                "gel"
              ],
              "on_complete": [
                {
                  "add_lab_item": "spy"
                },
                {
                  "add_forensic_item": "gel_trace"
                },
                {
                  "show_movie": "m9"
                },
                {
                  "progress_chapter": "108_explored_scene_3_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_4": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_06.scenes.scene_4.name",
          "target_text": "cases.case_06.scenes.scene_4.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "cat_shelter",
          "img": "cat_shelter/thumb",
          "items": {
            "cat_photo": {
              "name": "cases.case_06.scenes.scene_4.items.cat_photo.name",
              "img": "images/cat_laky3",
              "layer": "foto_special"
            },
            "lacky_cat": {
              "name": "cases.case_06.scenes.scene_4.items.lacky_cat.name",
              "img": "images/cat_03",
              "layer": "cat_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "cat_photo"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "cat_photo"
                },
                {
                  "show_movie": "m18"
                },
                {
                  "progress_chapter": "205_explored_scene_4_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "lacky_cat"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "lacky_cat"
                },
                {
                  "show_movie": "m41"
                },
                {
                  "progress_chapter": "406_explored_scene_4_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_5": {
          "scores": [
            1200000,
            1700000,
            2300000,
            3000000,
            3800000
          ],
          "name": "cases.case_06.scenes.scene_5.name",
          "target_text": "cases.case_06.scenes.scene_5.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "room",
          "img": "room/thumb",
          "items": {
            "note": {
              "name": "cases.case_06.scenes.scene_5.items.note.name",
              "img": "images/note",
              "layer": "note_special"
            },
            "allergy_spray": {
              "name": "cases.case_06.scenes.scene_5.items.allergy_spray.name",
              "img": "images/spray",
              "layer": "sprey_special"
            },
            "bloody_dress": {
              "name": "cases.case_06.scenes.scene_5.items.bloody_dress.name",
              "img": "images/cloth",
              "layer": "clothes_special"
            },
            "cat_tranquilizer": {
              "name": "cases.case_06.scenes.scene_5.items.cat_tranquilizer.name",
              "img": "images/lecarstvo_02",
              "layer": "sedative_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "note",
                "allergy_spray",
                "bloody_dress",
                "cat_tranquilizer"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "bloody_dress"
                },
                {
                  "add_forensic_item": "cat_tranquilizer"
                },
                {
                  "show_movie": "m29"
                },
                {
                  "update_suspect_state": {
                    "suspect": "kelvin_blum",
                    "motive": true,
                    "clues": [
                      "allergy_spray"
                    ],
                    "text": "cases.case_06.add_clues.kelvin_blum.allergy_spray_motive"
                  }
                },
                {
                  "progress_chapter": "218_explored_scene_5_state_1"
                }
              ]
            },
            "default": {}
          }
        },
        "scene_6": {
          "scores": [
            1500000,
            2000000,
            2600000,
            3300000,
            4100000
          ],
          "name": "cases.case_06.scenes.scene_6.name",
          "target_text": "cases.case_06.scenes.scene_6.target_text",
          "unlock_text": "sceneLockText",
          "type": "hog",
          "path": "alley",
          "img": "alley/thumb",
          "items": {
            "backpack": {
              "name": "cases.case_06.scenes.scene_6.items.backpack.name",
              "img": "images/backpack",
              "layer": "bbag_special"
            },
            "cats": {
              "name": "cases.case_06.scenes.scene_6.items.cats.name",
              "img": "images/street_cats",
              "layer": "cat_01_special"
            }
          },
          "states": {
            "1": {
              "items": [
                "backpack"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "backpack"
                },
                {
                  "show_movie": "m32_1"
                },
                {
                  "progress_chapter": "302_explored_scene_6_state_1"
                }
              ]
            },
            "2": {
              "items": [
                "cats"
              ],
              "on_complete": [
                {
                  "add_forensic_item": "cats"
                },
                {
                  "show_movie": "m36_1"
                },
                {
                  "progress_chapter": "402_explored_scene_6_state_2"
                }
              ]
            },
            "default": {}
          }
        },
        "bonus_1": {
          "scores": [
            1000000,
            1500000,
            2100000,
            2800000,
            3600000
          ],
          "name": "cases.case_06.scenes.scene_1.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 4,
          "type": "puzzle",
          "path": "images/cats_room_puzzle",
          "img": "images/6_puzzle",
          "states": {
            "default": {}
          }
        },
        "bonus_2": {
          "scores": [
            2000000,
            2500000,
            3100000,
            3800000,
            4600000
          ],
          "name": "cases.case_06.scenes.scene_3.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 16,
          "type": "hogTime",
          "path": "corridor",
          "img": "images/6_time_attack",
          "items": {
            "spy": {
              "name": "cases.case_06.scenes.scene_3.items.spy.name",
              "img": "images/bug_02",
              "layer": "bug_special"
            },
            "gel": {
              "name": "cases.case_06.scenes.scene_3.items.gel.name",
              "img": "images/gel",
              "layer": "gel_special"
            }
          },
          "states": {
            "default": {}
          }
        },
        "bonus_3": {
          "scores": [
            2000000,
            2500000,
            3100000,
            3800000,
            4600000
          ],
          "name": "cases.case_06.scenes.scene_5.name",
          "unlock_text": "sceneLockTextBonus",
          "unlock_star": 31,
          "type": "hogDiff",
          "path": "room",
          "img": "images/6_diff",
          "items": {
            "note": {
              "name": "cases.case_06.scenes.scene_5.items.note.name",
              "img": "images/note",
              "layer": "note_special"
            },
            "allergy_spray": {
              "name": "cases.case_06.scenes.scene_5.items.allergy_spray.name",
              "img": "images/spray",
              "layer": "sprey_special"
            },
            "bloody_dress": {
              "name": "cases.case_06.scenes.scene_5.items.bloody_dress.name",
              "img": "images/cloth",
              "layer": "clothes_special"
            },
            "cat_tranquilizer": {
              "name": "cases.case_06.scenes.scene_5.items.cat_tranquilizer.name",
              "img": "images/lecarstvo_02",
              "layer": "sedative_special"
            }
          },
          "states": {
            "default": {}
          }
        }
      },
      "forensic_items": {
        "cctv_camera": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.cctv_camera.target_text",
          "states": {
            "new": {
              "img": "images/camera",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/corridor_mg/1, images/corridor_mg/2, images/corridor_mg/3, images/corridor_mg/4, images/corridor_mg/5",
                  "sizeX": 5,
                  "sizeY": 2,
                  "completeText": "cases.case_06.forensic_items.cctv_camera.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.cctv_camera.states.new.minigame.title",
                "img_result": "",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m5"
                  },
                  {
                    "add_forensic_item": "break_in"
                  },
                  {
                    "progress_chapter": "104_explored_forensic_item_cctv_camera"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/camera",
              "wrapped": false,
              "movie": "m_cctv_camera"
            }
          }
        },
        "break_in": {
          "initial_state": "new",
          "action_text": "cases.case_06.forensic_items.break_in.action_text",
          "target_text": "cases.case_06.forensic_items.break_in.target_text",
          "states": {
            "new": {
              "img": "images/bug_ico",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/camera_bg",
                  "target": "corridor/thumb",
                  "count": 1,
                  "sizeX": 10,
                  "sizeY": 10,
                  "completeText": "cases.case_06.forensic_items.break_in.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.break_in.states.new.minigame.title",
                "img_result": "corridor/thumb",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m7"
                  },
                  {
                    "open_new_scene": "scene_3"
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_3",
                      "state": "1"
                    }
                  },
                  {
                    "progress_chapter": "106_explored_forensic_item_break_in"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/bug_ico",
              "wrapped": false,
              "movie": "m_break_in"
            }
          }
        },
        "drug": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.drug.target_text",
          "states": {
            "new": {
              "img": "images/drug",
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "path": "images/drugs_mg",
                  "target": "images/drug",
                  "trashCount": 60,
                  "radius": 250,
                  "completeText": "cases.case_06.forensic_items.drug.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.drug.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/drug",
                "on_complete": [
                  {
                    "show_movie": "m8"
                  },
                  {
                    "add_suspect": "vanessa_thomas"
                  },
                  {
                    "set_suspect_state": {
                      "suspect": "vanessa_thomas",
                      "state": "dialog_1"
                    }
                  },
                  {
                    "progress_chapter": "107_explored_forensic_item_drug"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/drug",
              "movie": "m_drug"
            }
          }
        },
        "gel_trace": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.gel_trace.target_text",
          "states": {
            "new": {
              "img": "images/gel",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/gel_bg",
                  "target": "images/gel_mg_icon",
                  "count": 3,
                  "sizeX": 12,
                  "sizeY": 12,
                  "completeText": "cases.case_06.forensic_items.gel_trace.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.gel_trace.states.new.minigame.title",
                "img_result": "images/gel_02",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m11"
                  },
                  {
                    "update_killer_state": {
                      "clues": [
                        "gel"
                      ],
                      "text": "cases.case_06.add_clues.gel"
                    }
                  },
                  {
                    "progress_chapter": "110_explored_forensic_item_gel_trace"
                  },
                  {
                    "check_transition": "accuse_exit_camera"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/gel",
              "movie": "m_gel_trace"
            }
          }
        },
        "street_camera": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.street_camera.target_text",
          "states": {
            "new": {
              "img": "images/camera_03",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/cameras_mg/1, images/cameras_mg/2, images/cameras_mg/3, images/cameras_mg/4, images/cameras_mg/5",
                  "sizeX": 4,
                  "sizeY": 2,
                  "completeText": "cases.case_06.forensic_items.street_camera.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.street_camera.states.new.minigame.title",
                "img_result": "images/camera_03",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m16"
                  },
                  {
                    "open_new_scene": "scene_4"
                  },
                  {
                    "set_scene_state": {
                      "scene": "scene_4",
                      "state": "1"
                    }
                  },
                  {
                    "progress_chapter": "203_explored_forensic_item_street_camera"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/camera_03",
              "movie": "m_street_camera"
            }
          }
        },
        "mark_doil_check": {
          "initial_state": "new",
          "action_text": "cases.case_06.forensic_items.mark_doil_check.action_text",
          "target_text": "cases.case_06.forensic_items.mark_doil_check.target_text",
          "states": {
            "new": {
              "img": "images/folder_case",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "target": "images/case",
                  "path": "images/book_mg",
                  "trashCount": 50,
                  "radius": 400,
                  "completeText": "cases.case_06.forensic_items.mark_doil_check.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.mark_doil_check.states.new.minigame.title",
                "img_result": "images/case",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m17"
                  },
                  {
                    "check_transition": "accuse_mark_doil"
                  },
                  {
                    "progress_chapter": "204_explored_forensic_item_mark_doil_check"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/folder_case",
              "movie": "m_mark_doil_check"
            }
          }
        },
        "cat_photo": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.cat_photo.target_text",
          "states": {
            "new": {
              "img": "images/cat_laky",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/cats_mg/6, images/cats_mg/7, images/cats_mg/8, images/cats_mg/9, images/cats_mg/10",
                  "sizeX": 5,
                  "sizeY": 2,
                  "completeText": "cases.case_06.forensic_items.cat_photo.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.cat_photo.states.new.minigame.title",
                "img_result": "images/cat_laky",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m19"
                  },
                  {
                    "check_transition": "accuse_mark_doil"
                  },
                  {
                    "progress_chapter": "206_explored_forensic_item_cat_photo"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/cat_laky",
              "movie": "m_cat_photo"
            }
          }
        },
        "briefcase": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.briefcase.target_text",
          "states": {
            "new": {
              "img": "images/bag",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/bag_mg",
                  "target": "images/spray",
                  "count": 1,
                  "sizeX": 8,
                  "sizeY": 8,
                  "completeText": "cases.case_06.forensic_items.briefcase.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.briefcase.states.new.minigame.title",
                "img_result": "images/spray",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m21"
                  },
                  {
                    "check_transition": "accuse_kelvin_blum"
                  },
                  {
                    "progress_chapter": "209_explored_forensic_item_briefcase"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/bag",
              "movie": "m_briefcase"
            }
          }
        },
        "email": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.email.target_text",
          "states": {
            "new": {
              "img": "images/message",
              "wrapped": false,
              "minigame": {
                "data": {
                  "type": "trash",
                  "back": "images/_back_minigames",
                  "path": "images/icons_mg",
                  "target": "images/message",
                  "trashCount": 50,
                  "radius": 400,
                  "completeText": "cases.case_06.forensic_items.email.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.email.states.new.minigame.title",
                "next_state": "explored",
                "img_result": "images/message",
                "on_complete": [
                  {
                    "show_movie": "m22"
                  },
                  {
                    "check_transition": "accuse_kelvin_blum"
                  },
                  {
                    "progress_chapter": "210_explored_forensic_item_email"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/message",
              "movie": "m_email"
            }
          }
        },
        "diamonds": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.diamonds.target_text",
          "states": {
            "new": {
              "img": "images/Gems",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/gems_mg/01, images/gems_mg/02, images/gems_mg/03, images/gems_mg/04, images/gems_mg/05, images/gems_mg/06, images/gems_mg/07",
                  "sizeX": 7,
                  "sizeY": 2,
                  "completeText": "cases.case_06.forensic_items.diamonds.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.diamonds.states.new.minigame.title",
                "img_result": "images/Gems",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m25"
                  },
                  {
                    "check_transition": "accuse_vanessa_thomas"
                  },
                  {
                    "progress_chapter": "214_explored_forensic_item_diamonds"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/Gems",
              "movie": "m_diamonds"
            }
          }
        },
        "bloody_dress": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.bloody_dress.target_text",
          "states": {
            "new": {
              "img": "images/cloth",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/cloth_mg",
                  "target": "images/blood_mg",
                  "count": 3,
                  "sizeX": 12,
                  "sizeY": 12,
                  "completeText": "cases.case_06.forensic_items.bloody_dress.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.bloody_dress.states.new.minigame.title",
                "img_result": "images/blood_mark",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m30"
                  },
                  {
                    "check_transition": "end_chapter_2"
                  },
                  {
                    "progress_chapter": "219_explored_forensic_item_bloody_dress"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/cloth",
              "movie": "m_bloody_dress"
            }
          }
        },
        "cat_tranquilizer": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.cat_tranquilizer.target_text",
          "states": {
            "new": {
              "img": "images/lecarstvo_02",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/drugs_mg/01, images/drugs_mg/02, images/drugs_mg/03, images/drugs_mg/04, images/drugs_mg/05, images/drugs_mg/06, images/drug",
                  "sizeX": 7,
                  "sizeY": 2,
                  "completeText": "cases.case_06.forensic_items.cat_tranquilizer.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.cat_tranquilizer.states.new.minigame.title",
                "img_result": "images/lecarstvo_02",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m31"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "kelvin_blum",
                      "clues": [
                        "cat_tranquilizer"
                      ],
                      "text": "cases.case_06.add_clues.kelvin_blum.cat_tranquilizer"
                    }
                  },
                  {
                    "check_transition": "end_chapter_2"
                  },
                  {
                    "progress_chapter": "220_explored_forensic_item_cat_tranquilizer"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/lecarstvo_02",
              "movie": "m_cat_tranquilizer"
            }
          }
        },
        "backpack": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.backpack.target_text",
          "states": {
            "new": {
              "img": "images/backpack",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/bag_02_mg",
                  "target": "images/volos",
                  "count": 4,
                  "sizeX": 14,
                  "sizeY": 14,
                  "completeText": "cases.case_06.forensic_items.backpack.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.backpack.states.new.minigame.title",
                "img_result": "images/volos",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m35"
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "robert_merphy",
                      "clues": [
                        "wool"
                      ],
                      "text": "cases.case_06.add_clues.robert_merphy.wool"
                    }
                  },
                  {
                    "update_suspect_state": {
                      "suspect": "kelvin_blum",
                      "alibi": false,
                      "text": "cases.case_06.add_clues.kelvin_blum.alibi_false"
                    }
                  },
                  {
                    "check_transition": "arrest_kelvin_blum"
                  },
                  {
                    "progress_chapter": "304_explored_forensic_item_backpack"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/backpack",
              "movie": "m_backpack"
            }
          }
        },
        "insurance": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.insurance.target_text",
          "states": {
            "new": {
              "img": "images/contract",
              "minigame": {
                "data": {
                  "type": "hotCold",
                  "back": "images/_back_minigames",
                  "path": "images/mg_contract_fon.png",
                  "target": "images/01, images/02, images/03",
                  "count": 3,
                  "sizeX": 8,
                  "sizeY": 8,
                  "completeText": "cases.case_06.forensic_items.insurance.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.insurance.states.new.minigame.title",
                "img_result": "images/01_03",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m37"
                  },
                  {
                    "check_transition": "accuse_adeliada_blum"
                  },
                  {
                    "progress_chapter": "403_explored_forensic_item_insurance"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/contract",
              "movie": "m_insurance"
            }
          }
        },
        "cats": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.cats.target_text",
          "states": {
            "new": {
              "img": "images/street_cats",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/cat_icon_1, images/cat_icon_2, images/cat_icon_3, images/cat_icon_4",
                  "sizeX": 4,
                  "sizeY": 2,
                  "completeText": "cases.case_06.forensic_items.cats.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.cats.states.new.minigame.title",
                "img_result": "images/cat_laky",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m38"
                  },
                  {
                    "check_transition": "accuse_adeliada_blum"
                  },
                  {
                    "progress_chapter": "404_explored_forensic_item_cats"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/street_cats",
              "movie": "m_cats"
            }
          }
        },
        "lacky_cat": {
          "initial_state": "new",
          "target_text": "cases.case_06.forensic_items.lacky_cat.target_text",
          "states": {
            "new": {
              "img": "images/cat_laky",
              "minigame": {
                "data": {
                  "type": "findPair",
                  "back": "images/_back_minigames",
                  "images": "images/cat_icon_5, images/cat_icon_6, images/cat_icon_7, images/cat_03",
                  "sizeX": 4,
                  "sizeY": 2,
                  "completeText": "cases.case_06.forensic_items.lacky_cat.states.new.minigame.complete"
                },
                "title": "cases.case_06.forensic_items.lacky_cat.states.new.minigame.title",
                "img_result": "",
                "next_state": "explored",
                "on_complete": [
                  {
                    "show_movie": "m41_1"
                  },
                  {
                    "progress_chapter": "407_explored_forensic_item_lacky_cat"
                  },
                  {
                    "show_movie": "m41_2"
                  },
                  {
                    "add_custom_task": "go_to_sud"
                  }
                ]
              }
            },
            "explored": {
              "img": "images/cat_laky",
              "movie": "m_lacky_cat"
            }
          }
        },
        "vanish_blood_drop": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/blood_on_slide",
              "movie": "m_vanish_blood_drop"
            }
          }
        },
        "spy": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/bug_02",
              "movie": "m_spy"
            }
          }
        },
        "exit_camera": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/camera_02",
              "movie": "m_exit_camera"
            }
          }
        },
        "spot": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/gem",
              "movie": "m_spot"
            }
          }
        },
        "merphy_survey": {
          "initial_state": "explored",
          "states": {
            "explored": {
              "img": "images/water_worker",
              "wrapped": false,
              "movie": "m_merphy_survey"
            }
          }
        }
      },
      "lab_items": {
        "vanish_blood_drop": {
          "name": "cases.case_06.lab_items.vanish_blood_drop.name",
          "target_text": "cases.case_06.lab_items.vanish_blood_drop.target_text",
          "img": "images/blood_on_slide",
          "item_type": "chemicals",
          "analyze_time": 10800,
          "analyze_movie": "m4",
          "on_analyze": [
            {
              "update_killer_state": {
                "clues": [
                  "scratch"
                ],
                "text": "cases.case_06.add_clues.scratch"
              }
            },
            {
              "add_forensic_item": "vanish_blood_drop"
            },
            {
              "progress_chapter": "103_explored_lab_item_vanish_blood_drop"
            },
            {
              "check_transition": "accuse_exit_camera"
            }
          ]
        },
        "spy": {
          "name": "cases.case_06.lab_items.spy.name",
          "target_text": "cases.case_06.lab_items.spy.target_text",
          "img": "images/bug_02",
          "item_type": "hack",
          "analyze_time": 3600,
          "analyze_movie": "m10",
          "on_analyze": [
            {
              "add_forensic_item": "spy"
            },
            {
              "progress_chapter": "109_explored_lab_item_spy"
            },
            {
              "check_transition": "accuse_exit_camera"
            }
          ]
        },
        "exit_camera": {
          "name": "cases.case_06.lab_items.exit_camera.name",
          "target_text": "cases.case_06.lab_items.exit_camera.target_text",
          "img": "images/camera_02",
          "item_type": "hack",
          "analyze_time": 21600,
          "analyze_movie": "m13",
          "on_analyze": [
            {
              "set_info_state": {
                "type": "weapon",
                "state": "analyzed"
              }
            },
            {
              "update_killer_state": {
                "clues": [
                  "wool",
                  "cat_tranquilizer"
                ],
                "text": "cases.case_06.add_clues.wool_cat_tranquilizer"
              }
            },
            {
              "update_suspect_state": {
                "suspect": "vanessa_thomas",
                "alibi": false,
                "clues": [
                  "cat_tranquilizer"
                ],
                "text": "cases.case_06.add_clues.vanessa_thomas.cat_tranquilizer"
              }
            },
            {
              "add_suspect": "lilian_covalsky"
            },
            {
              "set_suspect_state": {
                "suspect": "lilian_covalsky",
                "state": "default"
              }
            },
            {
              "update_suspect_state": {
                "suspect": "lilian_covalsky",
                "alibi": false,
                "text": "cases.case_06.add_clues.lilian_covalsky.alibi_false"
              }
            },
            {
              "add_suspect": "mark_doil"
            },
            {
              "set_suspect_state": {
                "suspect": "mark_doil",
                "state": "default"
              }
            },
            {
              "update_suspect_state": {
                "suspect": "mark_doil",
                "alibi": false,
                "text": "cases.case_06.add_clues.mark_doil.alibi_false"
              }
            },
            {
              "add_suspect": "robert_merphy"
            },
            {
              "set_suspect_state": {
                "suspect": "robert_merphy",
                "state": "healthy"
              }
            },
            {
              "update_suspect_state": {
                "suspect": "robert_merphy",
                "alibi": false,
                "text": "cases.case_06.add_clues.robert_merphy.alibi_false"
              }
            },
            {
              "add_forensic_item": "exit_camera"
            },
            {
              "progress_chapter": "113_explored_lab_item_exit_camera"
            },
            {
              "add_start_next_chapter_task": {
                "cost": 2
              }
            }
          ]
        },
        "spot": {
          "name": "cases.case_06.lab_items.spot.name",
          "target_text": "cases.case_06.lab_items.spot.target_text",
          "img": "images/gem",
          "item_type": "chemicals",
          "analyze_time": 10800,
          "analyze_movie": "m26",
          "on_analyze": [
            {
              "update_killer_state": {
                "clues": [
                  "allergy_spray"
                ],
                "text": "case.case_06.add_clues.allergy_spray"
              }
            },
            {
              "update_suspect_state": {
                "suspect": "mark_doil",
                "clues": [
                  "allergy_spray"
                ],
                "text": "case.case_06.add_clues.mark_doil.allergy_spray"
              }
            },
            {
              "check_transition": "accuse_vanessa_thomas"
            },
            {
              "add_forensic_item": "spot"
            },
            {
              "progress_chapter": "215_explored_lab_item_spot"
            }
          ]
        },
        "merphy_survey": {
          "name": "cases.case_06.lab_items.merphy_survey.name",
          "target_text": "cases.case_06.lab_items.merphy_survey.target_text",
          "img": "images/water_worker",
          "item_type": "medicals",
          "analyze_time": 21600,
          "analyze_movie": "m34",
          "on_analyze": [
            {
              "update_suspect_state": {
                "suspect": "robert_merphy",
                "clues": [
                  "scratch",
                  "allergy_spray"
                ],
                "text": "case.case_06.add_clues.robert_merphy.scratch_allergy_spray"
              }
            },
            {
              "check_transition": "arrest_kelvin_blum"
            },
            {
              "add_forensic_item": "merphy_survey"
            },
            {
              "progress_chapter": "303_explored_lab_item_merphy_survey"
            }
          ]
        }
      },
      "clues": {
        "scratch": {
          "img": "images/cat_wounds"
        },
        "wool": {
          "img": "images/volos"
        },
        "gel": {
          "img": "images/gel_02"
        },
        "allergy_spray": {
          "img": "images/spray"
        },
        "cat_tranquilizer": {
          "img": "images/drug"
        }
      },
      "suspect_properties": {
        "prop_1": "age",
        "prop_2": "weight"
      },
      "suspects": {
        "vanessa_thomas": {
          "clues": {
            "scratch": {
              "match": true
            },
            "wool": {
              "img": "images/volos",
              "match": true
            },
            "gel": {
              "img": "images/gel_02",
              "match": true
            },
            "cat_tranquilizer": {
              "img": "images/drug",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_maid",
              "portrait": "images/char_maid_portrait",
              "title": "cases.case_06.suspects.vanessa_thomas.states.default.title",
              "status": "cases.case_06.suspects.vanessa_thomas.states.default.status",
              "prop_1": "cases.case_06.suspects.vanessa_thomas.states.default.prop_1",
              "prop_2": "cases.case_06.suspects.vanessa_thomas.states.default.prop_2",
              "target_text": "cases.case_06.suspects.vanessa_thomas.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m12",
              "on_talk": [
                {
                  "update_suspect_state": {
                    "suspect": "vanessa_thomas",
                    "motive": true,
                    "text": "cases.case_06.add_suspect_clues.vanessa_thomas.motive"
                  }
                },
                {
                  "add_custom_task": "vanessa_thomas_deduction"
                },
                {
                  "progress_chapter": "111_suspect_vanessa_thomas_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": "m27",
              "on_talk": [
                {
                  "add_custom_task": "vanessa_thomas_deduction_2"
                },
                {
                  "progress_chapter": "216_suspect_vanessa_thomas_dialog_1"
                }
              ]
            }
          }
        },
        "lilian_covalsky": {
          "clues": {
            "scratch": {
              "match": true
            },
            "wool": {
              "img": "images/volos",
              "match": true
            },
            "gel": {
              "img": "images/gel_02",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_visage",
              "portrait": "images/char_visage_portrait",
              "title": "cases.case_06.suspects.lilian_covalsky.states.default.title",
              "status": "cases.case_06.suspects.lilian_covalsky.states.default.status",
              "prop_1": "cases.case_06.suspects.lilian_covalsky.states.default.prop_1",
              "prop_2": "cases.case_06.suspects.lilian_covalsky.states.default.prop_2",
              "target_text": "cases.case_06.suspects.lilian_covalsky.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m15",
              "on_talk": [
                {
                  "add_custom_task": "lilian_covalsky_deduction"
                },
                {
                  "progress_chapter": "201_suspect_lilian_covalsky_dialog_1"
                }
              ]
            }
          }
        },
        "mark_doil": {
          "clues": {
            "scratch": {
              "match": true
            },
            "wool": {
              "img": "images/volos",
              "match": true
            },
            "allergy_spray": {
              "img": "images/spray",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_investor_angry",
              "portrait": "images/char_investor_portrait",
              "title": "cases.case_06.suspects.mark_doil.states.default.title",
              "status": "cases.case_06.suspects.mark_doil.states.default.status",
              "prop_1": "cases.case_06.suspects.mark_doil.states.default.prop_1",
              "prop_2": "cases.case_06.suspects.mark_doil.states.default.prop_2",
              "target_text": "cases.case_06.suspects.mark_doil.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m20",
              "on_talk": [
                {
                  "add_custom_task": "mark_doil_deduction"
                },
                {
                  "update_suspect_state": {
                    "suspect": "mark_doil",
                    "motive": true,
                    "text": "cases.case_06.add_clues.mark_doil.motive_true"
                  }
                },
                {
                  "progress_chapter": "207_suspect_mark_doil_dialog_1"
                }
              ]
            }
          }
        },
        "kelvin_blum": {
          "clues": {
            "scratch": {
              "match": true
            },
            "wool": {
              "img": "images/volos",
              "match": true
            },
            "gel": {
              "img": "images/gel_02",
              "match": true
            },
            "allergy_spray": {
              "img": "images/spray",
              "match": true
            },
            "cat_tranquilizer": {
              "img": "images/drug",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_murder",
              "portrait": "images/char_murder_portrait",
              "title": "cases.case_06.suspects.kelvin_blum.states.default.title",
              "status": "cases.case_06.suspects.kelvin_blum.states.default.status",
              "prop_1": "cases.case_06.suspects.kelvin_blum.states.default.prop_1",
              "prop_2": "cases.case_06.suspects.kelvin_blum.states.default.prop_2",
              "target_text": "cases.case_06.suspects.kelvin_blum.states.default.target_text"
            },
            "dialog_1": {
              "talk_movie": "m23",
              "on_talk": [
                {
                  "add_custom_task": "kelvin_blum_deduction"
                },
                {
                  "progress_chapter": "211_suspect_kelvin_blum_dialog_1"
                }
              ]
            },
            "dialog_2": {
              "talk_movie": [
                "m36",
                "m36_2"
              ],
              "on_talk": [
                {
                  "set_scene_state": {
                    "scene": "scene_6",
                    "state": "2"
                  }
                },
                {
                  "add_forensic_item": "insurance"
                },
                {
                  "progress_chapter": "401_suspect_kelvin_blum_dialog_2"
                }
              ]
            }
          }
        },
        "robert_merphy": {
          "clues": {
            "scratch": {
              "match": true
            },
            "wool": {
              "img": "images/volos",
              "match": true
            },
            "allergy_spray": {
              "img": "images/spray",
              "match": true
            }
          },
          "states": {
            "default": {
              "img": "images/char_plumber_hurt",
              "portrait": "images/char_plumber_hurt_portrait",
              "title": "cases.case_06.suspects.robert_merphy.states.default.title",
              "status": "cases.case_06.suspects.robert_merphy.states.default.status",
              "prop_1": "cases.case_06.suspects.robert_merphy.states.default.prop_1",
              "prop_2": "cases.case_06.suspects.robert_merphy.states.default.prop_2",
              "target_text": "cases.case_06.suspects.robert_merphy.states.default.target_text"
            },
            "healthy": {
              "img": "images/char_plumber_brute",
              "title": "cases.case_06.suspects.robert_merphy.states.default.title",
              "status": "cases.case_06.suspects.robert_merphy.states.default.status",
              "prop_1": "cases.case_06.suspects.robert_merphy.states.default.prop_1",
              "prop_2": "cases.case_06.suspects.robert_merphy.states.default.prop_2",
              "talkable": false
            },
            "dialog_1": {
              "talk_movie": "m32",
              "on_talk": [
                {
                  "open_new_scene": "scene_6"
                },
                {
                  "set_scene_state": {
                    "scene": "scene_6",
                    "state": "1"
                  }
                },
                {
                  "add_lab_item": "merphy_survey"
                },
                {
                  "update_suspect_state": {
                    "suspect": "robert_merphy",
                    "motive": true,
                    "text": "cases.case_06.add_clues.robert_merphy.motive_true"
                  }
                },
                {
                  "progress_chapter": "301_suspect_robert_merphy_dialog_1"
                }
              ]
            }
          }
        }
      },
      "info": {
        "victim": {
          "found": {
            "name": "cases.case_06.info.victim.found.name",
            "description": "cases.case_06.info.victim.found.description",
            "img": "images/char_adelaida_portrait"
          },
          "analyzed": {
            "name": "cases.case_06.info.victim.analyzed.name",
            "description": "cases.case_06.info.victim.analyzed.description",
            "img": "images/char_adelaida_portrait"
          }
        },
        "weapon": {
          "found": {
            "name": "cases.case_06.info.weapon.found.name",
            "description": "cases.case_06.info.weapon.found.description",
            "img": "images/drug"
          },
          "analyzed": {
            "name": "cases.case_06.info.weapon.analyzed.name",
            "description": "cases.case_06.info.weapon.analyzed.description",
            "img": "images/drug"
          }
        },
        "killer": {
          "arrested": {
            "name": "cases.case_06.info.killer.arrested.name",
            "description": "cases.case_06.info.killer.arrested.description",
            "img": "images/char_murder_portrait"
          }
        }
      },
      "chapters": [
        {
          "size": 13,
          "img": "images/chapter_61",
          "name": "cases.case_06.chapters.1.name",
          "description": "cases.case_06.chapters.1.description",
          "on_start": []
        },
        {
          "size": 20,
          "img": "images/chapter_62",
          "name": "cases.case_06.chapters.2.name",
          "description": "cases.case_06.chapters.2.description",
          "on_start": [
            {
              "show_movie": "m14"
            },
            {
              "set_suspect_state": {
                "suspect": "lilian_covalsky",
                "state": "dialog_1"
              }
            },
            {
              "add_forensic_item": "street_camera"
            }
          ]
        },
        {
          "size": 5,
          "img": "images/chapter_63",
          "name": "cases.case_06.chapters.3.name",
          "description": "cases.case_06.chapters.3.description",
          "on_start": [
            {
              "show_movie": "m31_1"
            },
            {
              "set_suspect_state": {
                "suspect": "robert_merphy",
                "state": "dialog_1"
              }
            }
          ]
        },
        {
          "size": 8,
          "img": "images/chapter_64",
          "name": "cases.case_06.chapters.4.name",
          "description": "cases.case_06.chapters.4.description",
          "description_end": "cases.case_06.chapters.4.description_end",
          "on_start": [
            {
              "show_movie": "m35_2"
            },
            {
              "set_suspect_state": {
                "suspect": "kelvin_blum",
                "state": "dialog_2"
              }
            }
          ]
        }
      ],
      "on_start": [
        {
          "show_movie": "m1"
        },
        {
          "open_new_scene": "scene_1"
        },
        {
          "set_scene_state": {
            "scene": "scene_1",
            "state": "1"
          }
        },
        {
          "add_custom_task": "adeliada_blum_talk_1"
        },
        {
          "set_info_state": {
            "type": "victim",
            "state": "found"
          }
        }
      ],
      "arrest": {
        "killer": "kelvin_blum",
        "on_success": [
          {
            "show_movie": "m35_1"
          },
          {
            "set_info_state": {
              "type": "killer",
              "state": "arrested"
            }
          },
          {
            "progress_chapter": "305_init_arrest_state_kelvin_blum"
          },
          {
            "add_start_next_chapter_task": {
              "cost": 2
            }
          }
        ],
        "on_fail": [
          {
            "show_movie": "m_wrong_arrest"
          }
        ]
      },
      "transitions": {
        "accuse_exit_camera": {
          "preconditions": [
            {
              "custom_task_completed": "vanessa_thomas_deduction"
            },
            {
              "lab_item_state": {
                "vanish_blood_drop": "done",
                "spy": "done"
              }
            },
            {
              "forensic_item_state": {
                "gel_trace": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "add_lab_item": "exit_camera"
            }
          ]
        },
        "accuse_mark_doil": {
          "preconditions": [
            {
              "forensic_item_state": {
                "mark_doil_check": "explored",
                "cat_photo": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "set_suspect_state": {
                "suspect": "mark_doil",
                "state": "dialog_1"
              }
            }
          ]
        },
        "accuse_kelvin_blum": {
          "preconditions": [
            {
              "forensic_item_state": {
                "briefcase": "explored",
                "email": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "add_suspect": "kelvin_blum"
            },
            {
              "set_suspect_state": {
                "suspect": "kelvin_blum",
                "state": "dialog_1"
              }
            }
          ]
        },
        "accuse_vanessa_thomas": {
          "preconditions": [
            {
              "forensic_item_state": {
                "diamonds": "explored"
              }
            },
            {
              "lab_item_state": {
                "spot": "done"
              }
            }
          ],
          "on_complete": [
            {
              "set_suspect_state": {
                "suspect": "vanessa_thomas",
                "state": "dialog_2"
              }
            }
          ]
        },
        "end_chapter_2": {
          "preconditions": [
            {
              "forensic_item_state": {
                "bloody_dress": "explored",
                "cat_tranquilizer": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "add_start_next_chapter_task": {
                "cost": 2
              }
            }
          ]
        },
        "arrest_kelvin_blum": {
          "preconditions": [
            {
              "forensic_item_state": {
                "backpack": "explored"
              },
              "lab_item_state": {
                "merphy_survey": "done"
              }
            }
          ],
          "on_complete": [
            {
              "init_arrest_state": null
            }
          ]
        },
        "accuse_adeliada_blum": {
          "preconditions": [
            {
              "forensic_item_state": {
                "insurance": "explored",
                "cats": "explored"
              }
            }
          ],
          "on_complete": [
            {
              "add_custom_task": "adeliada_blum_talk_2"
            }
          ]
        }
      },
      "deductions": {
        "vanessa": {
          "suspect_img": "images/char_maid",
          "background_img": "images/_back_lab"
        },
        "lilian": {
          "suspect_img": "images/char_visage",
          "background_img": "images/_back_lab"
        },
        "doyl": {
          "suspect_img": "images/char_investor_angry",
          "background_img": "images/_back_lab"
        },
        "kelvin": {
          "suspect_img": "images/char_murder",
          "background_img": "images/_back_lab"
        },
        "vanessa2": {
          "suspect_img": "images/char_maid",
          "background_img": "images/_back_lab"
        }
      },
      "custom_tasks": {
        "adeliada_blum_talk_1": {
          "cost": 1,
          "img": "images/char_adelaida_portrait",
          "action_text": "cases.case_06.custom_tasks.adeliada_blum_talk_1.action_text",
          "target_text": "cases.case_06.custom_tasks.adeliada_blum_talk_1.target_text",
          "on_click": [
            {
              "show_movie": "m3"
            },
            {
              "open_new_scene": "scene_2"
            },
            {
              "set_scene_state": {
                "scene": "scene_2",
                "state": "1"
              }
            },
            {
              "progress_chapter": "102_custom_task_adeliada_blum_talk_1"
            }
          ]
        },
        "vanessa_thomas_deduction": {
          "cost": 1,
          "img": "images/char_maid_portrait",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_06.custom_tasks.vanessa_thomas_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "vanessa"
            },
            {
              "update_suspect_state": {
                "suspect": "vanessa_thomas",
                "clues": [
                  "wool",
                  "scratch"
                ],
                "text": "cases.case_06.add_clues.vanessa_thomas.scratch_wool"
              }
            },
            {
              "show_movie": "m12_1"
            },
            {
              "check_transition": "accuse_exit_camera"
            },
            {
              "progress_chapter": "112_custom_task_vanessa_thomas_deduction"
            }
          ]
        },
        "lilian_covalsky_deduction": {
          "cost": 1,
          "img": "images/char_visage_portrait",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_06.custom_tasks.lilian_covalsky_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "lilian"
            },
            {
              "update_suspect_state": {
                "suspect": "lilian_covalsky",
                "clues": [
                  "scratch",
                  "wool",
                  "gel"
                ],
                "text": "cases.case_06.add_clues.lilian_covalsky.scratch_wool_gel"
              }
            },
            {
              "show_movie": "m15_1"
            },
            {
              "add_forensic_item": "mark_doil_check"
            },
            {
              "progress_chapter": "202_custom_task_lilian_covalsky_deduction"
            }
          ]
        },
        "mark_doil_deduction": {
          "cost": 1,
          "img": "images/char_investor_portrait",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_06.custom_tasks.mark_doil_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "doyl"
            },
            {
              "update_suspect_state": {
                "suspect": "mark_doil",
                "clues": [
                  "scratch",
                  "wool"
                ],
                "text": "cases.case_06.add_clues.mark_doil.scratch_wool"
              }
            },
            {
              "show_movie": "m20_1"
            },
            {
              "add_forensic_item": "briefcase"
            },
            {
              "add_forensic_item": "email"
            },
            {
              "progress_chapter": "208_custom_task_mark_doil_deduction"
            }
          ]
        },
        "kelvin_blum_deduction": {
          "cost": 1,
          "img": "images/char_murder_portrait",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_06.custom_tasks.kelvin_blum_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "kelvin"
            },
            {
              "update_suspect_state": {
                "suspect": "kelvin_blum",
                "clues": [
                  "scratch",
                  "wool",
                  "gel"
                ],
                "text": "cases.case_06.add_clues.kelvin_blum.scratch_wool_gel"
              }
            },
            {
              "show_movie": "m23_1"
            },
            {
              "set_scene_state": {
                "scene": "scene_2",
                "state": "2"
              }
            },
            {
              "progress_chapter": "212_custom_task_kelvin_blum_deduction"
            }
          ]
        },
        "vanessa_thomas_deduction_2": {
          "cost": 1,
          "img": "images/char_maid_portrait",
          "action_text": "tasks.deduction.action_text",
          "target_text": "cases.case_06.custom_tasks.vanessa_thomas_deduction.target_text",
          "on_click": [
            {
              "show_deductiond": "vanessa2"
            },
            {
              "update_suspect_state": {
                "suspect": "vanessa_thomas",
                "alibi": true,
                "text": "cases.case_06.add_clues.vanessa_thomas.alibi_true"
              }
            },
            {
              "show_movie": "m27_1"
            },
            {
              "open_new_scene": "scene_5"
            },
            {
              "set_scene_state": {
                "scene": "scene_5",
                "state": "1"
              }
            },
            {
              "progress_chapter": "217_custom_task_vanessa_thomas_deduction_2"
            }
          ]
        },
        "adeliada_blum_talk_2": {
          "cost": 1,
          "img": "images/char_adelaida_portrait",
          "action_text": "cases.case_06.custom_tasks.adeliada_blum_talk_1.action_text",
          "target_text": "cases.case_06.custom_tasks.adeliada_blum_talk_1.target_text",
          "on_click": [
            {
              "show_movie": "m39"
            },
            {
              "show_movie": "m39_1"
            },
            {
              "set_scene_state": {
                "scene": "scene_4",
                "state": "2"
              }
            },
            {
              "progress_chapter": "405_custom_task_adeliada_blum_talk_2"
            },
            {
              "show_movie": "m40"
            }
          ]
        },
        "go_to_sud": {
          "cost": 0,
          "img": "images/char_murder_portrait",
          "action_text": "cases.case_06.custom_tasks.go_to_sud.action_text",
          "target_text": "cases.case_06.custom_tasks.go_to_sud.target_text",
          "on_click": [
            {
              "show_movie": "m42"
            },
            {
              "progress_chapter": "408_go_to_sud"
            },
            {
              "set_suspect_state": {
                "suspect": "kelvin_blum",
                "state": "default"
              }
            }
          ]
        }
      }
    }
  },
  "cash_settings": {
    "schema_id": "cash_settings",
    "analyze_speedup_base_cash_per_hour": 12
  },
  "energy_settings": {
    "schema_id": "energy_settings",
    "max_energy": 110,
    "energy_restore_time": 180,
    "scene_cost": 20,
    "full_scene_cost": 5,
    "minigame_fade_time": 6,
    "minigame_start_energy": 9
  },
  "hog_settings": {
    "schema_id": "hog_settings",
    "ScoresComboMultiplierMin": 1,
    "ScoresComboMultiplierMax": 6,
    "ScoresComboMultiplierFadeTime": 3,
    "ScoresComboMultiplierIncrement": 1,
    "HogMissClickPenalityTime": 3,
    "HogMissClickPenalityCount": 3,
    "HogMissClickPenality": 3,
    "HogHintReloadTime": 20,
    "HogHintReloadCount": 1,
    "HogItemRepeatRate": 0.4,
    "ScoreForMult": {
      "hog": [
        25000,
        30000,
        35000,
        40000,
        50000,
        60000
      ],
      "hogDiff": [
        30000,
        35000,
        40000,
        45000,
        55000,
        65000
      ],
      "hogTime": [
        5500,
        7500,
        9500,
        11500,
        13500,
        15500
      ],
      "puzzle": [
        25000,
        30000,
        35000,
        40000,
        50000,
        60000
      ]
    },
    "PuzzleGridSize": [
      {
        "width": 6,
        "height": 4
      },
      {
        "width": 7,
        "height": 5
      },
      {
        "width": 8,
        "height": 6
      },
      {
        "width": 9,
        "height": 7
      },
      {
        "width": 10,
        "height": 8
      },
      {
        "width": 10,
        "height": 8
      }
    ],
    "ItemsToFind": {
      "hog": [
        6,
        8,
        9,
        10,
        11,
        11
      ],
      "hogDiff": [
        5,
        6,
        7,
        8,
        9,
        9
      ],
      "puzzle": [
        6,
        8,
        9,
        10,
        11,
        11
      ]
    },
    "TimeLimit": {
      "hogTime": [
        40,
        45,
        50,
        60,
        70,
        70
      ]
    },
    "ExpAward": [
      11,
      12,
      13,
      14,
      15,
      15
    ],
    "TimeMaxBonus": 300000,
    "TimeMinBonus": 1000,
    "ScorePerHint": 20000,
    "HintMaxCount": 5,
    "star_base_scores": [
      100000,
      200000,
      300000,
      400000,
      500000
    ]
  },
  "info": {
    "schema_id": "info",
    "default_states": {
      "weapon": {
        "img": "",
        "name": "info.default_states.weapon.name",
        "description": "info.default_states.weapon.description"
      },
      "victim": {
        "img": "",
        "name": "info.default_states.victim.name",
        "description": "info.default_states.victim.description"
      },
      "killer": {
        "img": "",
        "name": "info.default_states.killer.name",
        "description": "info.default_states.killer.description"
      }
    }
  },
  "interface": {
    "schema_id": "interface",
    "tablet": {
      "cost_text": {
        "lab_analyzed": "interface.tablet.cost_text.lab_analyzed",
        "lab_speedup": "interface.tablet.cost_text.lab_speedup",
        "cost": "interface.tablet.cost_text.cost"
      }
    },
    "suspect": {
      "button_title": {
        "arrest": "interface.suspect.button_title.arrest",
        "repeat": "interface.suspect.button_title.repeat",
        "talk": "interface.suspect.button_title.talk"
      },
      "button_color": {
        "talk": "green",
        "repeat": "blue",
        "arrest": "red"
      },
      "properties": {
        "age": {
          "title": "interface.suspect.properties.age.title",
          "img": "images/age_icon.png"
        },
        "weight": {
          "title": "interface.suspect.properties.weight.title",
          "img": "images/weight_icon.png"
        },
        "eye": {
          "title": "interface.suspect.properties.eye.title",
          "img": "images/weight_icon.png"
        },
        "blood": {
          "title": "interface.suspect.properties.blood.title",
          "img": "images/weight_icon.png"
        }
      },
      "killer_clues_img": "images/some_man.png",
      "killer_title": "interface.suspect.killer_title"
    },
    "forensics": {
      "button_title": {
        "minigame": "interface.forensics.button_title.minigame",
        "repeat": "interface.forensics.button_title.repeat"
      },
      "button_color": {
        "minigame": "green",
        "repeat": "blue"
      }
    },
    "laboratory": {
      "button_title": {
        "new": "interface.laboratory.button_title.new",
        "analyzing": "interface.laboratory.button_title.analyzing",
        "analyzed": "interface.laboratory.button_title.analyzed",
        "done": "interface.laboratory.button_title.done"
      },
      "button_color": {
        "new": "green",
        "analyzing": "blue",
        "analyzed": "green",
        "done": "gray"
      },
      "tip_text": {
        "analyzed": "interface.laboratory.tip_text.analyzed",
        "done": "interface.laboratory.tip_text.done"
      },
      "item_types": {
        "medicals": {
          "character": "images/char_expert_medik.png",
          "text": {
            "new": "interface.laboratory.item_types.text.new",
            "analyzing": "interface.laboratory.item_types.text.analyzing",
            "analyzed": "interface.laboratory.item_types.text.analyzed",
            "done": "interface.laboratory.item_types.text.done"
          }
        },
        "chemicals": {
          "character": "images/char_expert_himik.png",
          "text": {
            "new": "interface.laboratory.item_types.text.new",
            "analyzing": "interface.laboratory.item_types.text.analyzing",
            "analyzed": "interface.laboratory.item_types.text.analyzed",
            "done": "interface.laboratory.item_types.text.done"
          }
        },
        "technics": {
          "character": "images/char_tehnik.png",
          "text": {
            "new": "interface.laboratory.item_types.text.new",
            "analyzing": "interface.laboratory.item_types.text.analyzing",
            "analyzed": "interface.laboratory.item_types.text.analyzed",
            "done": "interface.laboratory.item_types.text.done"
          }
        },
        "docs": {
          "character": "images/char_secretary.png",
          "text": {
            "new": "interface.laboratory.item_types.text.new",
            "analyzing": "interface.laboratory.item_types.text.analyzing",
            "analyzed": "interface.laboratory.item_types.text.analyzed",
            "done": "interface.laboratory.item_types.text.done"
          }
        },
        "hack": {
          "character": "images/char_hacker.png",
          "text": {
            "new": "interface.laboratory.item_types.text.new",
            "analyzing": "interface.laboratory.item_types.text.analyzing",
            "analyzed": "interface.laboratory.item_types.text.analyzed",
            "done": "interface.laboratory.item_types.text.done"
          }
        }
      }
    },
    "messages": {
      "send_gift": {
        "hog_usage": {
          "button_title": "interface.messages.send_gift.button_title",
          "button_color": "blue",
          "text": "interface.messages.send_gift.hog_usage.text",
          "img": "images/energy_big"
        },
        "levelup": {
          "button_title": "interface.messages.send_gift.button_title",
          "button_color": "blue",
          "text": "interface.messages.send_gift.levelup.text",
          "img": "images/icon_coffee_cup_01"
        }
      },
      "unlock_request": {
        "button_color": "blue",
        "img": "images/icon_request",
        "on_request": {
          "button_title": "interface.messages.unlock_request.on_request.button_title",
          "text": "interface.messages.unlock_request.on_request.text"
        },
        "on_response": {
          "button_title": "interface.messages.unlock_request.on_response.button_title",
          "text": "interface.messages.unlock_request.on_response.text"
        }
      }
    },
    "settings": {
      "loadscreen_tip_show_time": 10
    },
    "local_push_notifications": {
      "analyze_done": "interface.local_push_notifications.analyze_done",
      "full_energy": "interface.local_push_notifications.full_energy",
      "can_investigate": "interface.local_push_notifications.can_investigate"
    }
  },
  "items": {
    "schema_id": "items",
    "item_types": {
      "item_1": {
        "name": "items.item_1.name",
        "description": "items.item_1.description",
        "img": "images/icon_coffee_cup_01",
        "energy": 20
      },
      "item_2": {
        "name": "items.item_2.name",
        "description": "items.item_2.description",
        "img": "images/icon_coffee_cup_02",
        "energy": 50
      },
      "item_3": {
        "name": "items.item_3.name",
        "description": "items.item_3.description",
        "img": "images/icon_coffee_cup_03",
        "energy": 120
      },
      "item_4": {
        "name": "items.item_4.name",
        "description": "items.item_4.description",
        "img": "images/icon_coffee_cup_04",
        "energy": 250
      }
    }
  },
  "levels": {
    "schema_id": "levels",
    "levels_list": [
      {
        "required_xp": 0,
        "reward": {}
      },
      {
        "required_xp": 22,
        "reward": {}
      },
      {
        "required_xp": 245,
        "reward": {}
      },
      {
        "required_xp": 256,
        "reward": {}
      },
      {
        "required_xp": 337,
        "reward": {}
      },
      {
        "required_xp": 416,
        "reward": {}
      },
      {
        "required_xp": 495,
        "reward": {}
      },
      {
        "required_xp": 574,
        "reward": {}
      },
      {
        "required_xp": 652,
        "reward": {}
      },
      {
        "required_xp": 729,
        "reward": {}
      },
      {
        "required_xp": 806,
        "reward": {}
      },
      {
        "required_xp": 883,
        "reward": {}
      },
      {
        "required_xp": 959,
        "reward": {}
      },
      {
        "required_xp": 1035,
        "reward": {}
      },
      {
        "required_xp": 1111,
        "reward": {}
      },
      {
        "required_xp": 1186,
        "reward": {}
      },
      {
        "required_xp": 1261,
        "reward": {}
      },
      {
        "required_xp": 1336,
        "reward": {}
      },
      {
        "required_xp": 1372,
        "reward": {}
      },
      {
        "required_xp": 1395,
        "reward": {}
      },
      {
        "required_xp": 1414,
        "reward": {}
      },
      {
        "required_xp": 1432,
        "reward": {}
      },
      {
        "required_xp": 1446,
        "reward": {}
      },
      {
        "required_xp": 1460,
        "reward": {}
      },
      {
        "required_xp": 1474,
        "reward": {}
      },
      {
        "required_xp": 1488,
        "reward": {}
      }
    ]
  },
  "map": {
    "schema_id": "map",
    "case_order": [
      "case_01",
      "case_02",
      "case_03",
      "case_04",
      "case_05",
      "case_06"
    ],
    "descriptions": {
      "case_01": {
        "img": "images/chapter_11",
        "path": "Data/cases/case_01/",
        "name": "map.descriptions.case_01.name",
        "desc": "map.descriptions.case_01.desc"
      },
      "case_02": {
        "img": "images/chapter_21",
        "path": "Data/cases/case_02/",
        "name": "map.descriptions.case_02.name",
        "desc": "map.descriptions.case_02.desc"
      },
      "case_03": {
        "img": "images/chapter_31",
        "path": "Data/cases/case_03/",
        "name": "map.descriptions.case_03.name",
        "desc": "map.descriptions.case_03.desc"
      },
      "case_04": {
        "img": "images/chapter_41",
        "path": "Data/cases/case_04/",
        "name": "map.descriptions.case_04.name",
        "desc": "map.descriptions.case_04.desc"
      },
      "case_05": {
        "img": "images/chapter_51",
        "path": "Data/cases/case_05/",
        "name": "map.descriptions.case_05.name",
        "desc": "map.descriptions.case_05.desc"
      },
      "case_06": {
        "img": "images/chapter_61",
        "path": "Data/cases/case_06/",
        "name": "map.descriptions.case_06.name",
        "desc": "map.descriptions.case_06.desc"
      }
    }
  },
  "packs": {
    "schema_id": "packs",
    "pack_types": {
      "item_1_single": {
        "name": "items.item_1.name",
        "description": "items.item_1.description",
        "img": "images/icon_coffee_cup_01",
        "discount": 0,
        "price": {
          "real_balance": 10
        },
        "content": {
          "item_1": 1
        }
      },
      "item_1_pack": {
        "name": "items.item_1.name",
        "description": "items.item_1.description",
        "img": "images/icon_coffee_cup_01",
        "discount": 5,
        "price": {
          "real_balance": 28
        },
        "content": {
          "item_1": 3
        }
      },
      "item_2_single": {
        "name": "items.item_2.name",
        "description": "items.item_2.description",
        "img": "images/icon_coffee_cup_02",
        "discount": 0,
        "price": {
          "real_balance": 25
        },
        "content": {
          "item_2": 1
        }
      },
      "item_2_pack": {
        "name": "items.item_2.name",
        "description": "items.item_2.description",
        "discount": 10,
        "img": "images/icon_coffee_cup_02",
        "price": {
          "real_balance": 68
        },
        "content": {
          "item_2": 3
        }
      },
      "item_3_single": {
        "name": "items.item_3.name",
        "description": "items.item_3.description",
        "img": "images/icon_coffee_cup_03",
        "discount": 0,
        "price": {
          "real_balance": 50
        },
        "content": {
          "item_3": 1
        }
      },
      "item_3_pack": {
        "name": "items.item_3.name",
        "description": "items.item_3.description",
        "img": "images/icon_coffee_cup_03",
        "discount": 15,
        "price": {
          "real_balance": 128
        },
        "content": {
          "item_3": 3
        }
      },
      "item_4_single": {
        "name": "items.item_4.name",
        "description": "items.item_4.description",
        "img": "images/icon_coffee_cup_04",
        "discount": 0,
        "price": {
          "real_balance": 80
        },
        "content": {
          "item_4": 1
        }
      },
      "item_4_pack": {
        "name": "items.item_4.name",
        "description": "items.item_4.description",
        "img": "images/icon_coffee_cup_04",
        "discount": 25,
        "price": {
          "real_balance": 180
        },
        "content": {
          "item_4": 3
        }
      }
    }
  },
  "partner_fakes": {
    "schema_id": "partner_fakes",
    "partners": {
      "detective": {
        "reset_time": 0,
        "hints": 1,
        "scores": 400000,
        "level": 86,
        "img": "images/detective_portrait",
        "name": "mov_detective"
      },
      "secretary": {
        "reset_time": 21600,
        "hints": 2,
        "scores": 550000,
        "level": 45,
        "img": "images/secretary_portrait",
        "name": "mov_sec"
      },
      "hacker": {
        "reset_time": 21600,
        "hints": 2,
        "scores": 600000,
        "level": 64,
        "img": "images/hacker_portrait",
        "name": "mov_hacker"
      },
      "informer": {
        "reset_time": 21600,
        "hints": 2,
        "scores": 300000,
        "level": 36,
        "img": "images/informer_portrait",
        "name": "mov_informator"
      }
    }
  },
  "partner_settings": {
    "schema_id": "partner_settings",
    "reset_time": 21600,
    "reset_partner_seconds_per_cash": 300,
    "unlock_repeat_interval": 86400,
    "unlock_requests_required": 3,
    "unlock_cost_per_request": 7
  },
  "products": {
    "10bucks": {
      "group": "real_balance",
      "presentation": {
        "base_value": 10,
        "bonus": 0,
        "total_value": 10,
        "name": "product.10bucks.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 0.99,
          "id": "com.socialquantum.detective.10bucks"
        }
      },
      "reward": {
        "real_balance": 10,
        "game_balance": 0
      }
    },
    "50bucks": {
      "group": "real_balance",
      "presentation": {
        "base_value": 50,
        "bonus": 0,
        "total_value": 50,
        "name": "product.50bucks.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 4.99,
          "id": "com.socialquantum.detective.50bucks"
        }
      },
      "reward": {
        "real_balance": 50,
        "game_balance": 0
      }
    },
    "100bucks": {
      "group": "real_balance",
      "presentation": {
        "base_value": 100,
        "bonus": 10,
        "total_value": 110,
        "name": "product.100bucks.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 9.99,
          "id": "com.socialquantum.detective.100bucks"
        }
      },
      "reward": {
        "real_balance": 110,
        "game_balance": 0
      }
    },
    "200bucks": {
      "group": "real_balance",
      "presentation": {
        "base_value": 200,
        "bonus": 15,
        "total_value": 230,
        "name": "product.200bucks.presentation.name",
        "flag": "hit_offer"
      },
      "store": {
        "appstore": {
          "cost": 19.99,
          "id": "com.socialquantum.detective.200bucks"
        }
      },
      "reward": {
        "real_balance": 230,
        "game_balance": 0
      }
    },
    "500bucks": {
      "group": "real_balance",
      "presentation": {
        "base_value": 500,
        "bonus": 20,
        "total_value": 600,
        "name": "product.500bucks.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 45.99,
          "id": "com.socialquantum.detective.500bucks"
        }
      },
      "reward": {
        "real_balance": 600,
        "game_balance": 0
      }
    },
    "1000bucks": {
      "group": "real_balance",
      "presentation": {
        "base_value": 1000,
        "bonus": 25,
        "total_value": 1250,
        "name": "product.1000bucks.presentation.name",
        "flag": "best_offer"
      },
      "store": {
        "appstore": {
          "cost": 89.99,
          "id": "com.socialquantum.detective.1000bucks"
        }
      },
      "reward": {
        "real_balance": 1250,
        "game_balance": 0
      }
    },
    "10kdimes": {
      "group": "game_balance",
      "presentation": {
        "base_value": 10000,
        "bonus": 0,
        "total_value": 10000,
        "name": "product.10kdimes.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 0.99,
          "id": "com.socialquantum.detective.10kdimes"
        }
      },
      "reward": {
        "real_balance": 0,
        "game_balance": 10000
      }
    },
    "50kdimes": {
      "group": "game_balance",
      "presentation": {
        "base_value": 50000,
        "bonus": 0,
        "total_value": 50000,
        "name": "product.50kdimes.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 4.99,
          "id": "com.socialquantum.detective.50kdimes"
        }
      },
      "reward": {
        "real_balance": 0,
        "game_balance": 50000
      }
    },
    "100kdimes": {
      "group": "game_balance",
      "presentation": {
        "base_value": 100000,
        "bonus": 10,
        "total_value": 110000,
        "name": "product.100kdimes.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 9.99,
          "id": "com.socialquantum.detective.100kdimes"
        }
      },
      "reward": {
        "real_balance": 0,
        "game_balance": 110000
      }
    },
    "200kdimes": {
      "group": "game_balance",
      "presentation": {
        "base_value": 200000,
        "bonus": 15,
        "total_value": 230000,
        "flag": "hit_offer",
        "name": "product.200kdimes.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 19.99,
          "id": "com.socialquantum.detective.200kdimes"
        }
      },
      "reward": {
        "real_balance": 0,
        "game_balance": 230000
      }
    },
    "500kdimes": {
      "group": "game_balance",
      "presentation": {
        "base_value": 500000,
        "bonus": 20,
        "total_value": 600000,
        "name": "product.500kdimes.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 45.99,
          "id": "com.socialquantum.detective.500kdimes"
        }
      },
      "reward": {
        "real_balance": 0,
        "game_balance": 600000
      }
    },
    "1000kdimes": {
      "group": "game_balance",
      "presentation": {
        "base_value": 1000000,
        "bonus": 25,
        "total_value": 1250000,
        "flag": "best_offer",
        "name": "product.1000kdimes.presentation.name"
      },
      "store": {
        "appstore": {
          "cost": 89.99,
          "id": "com.socialquantum.detective.1000kdimes"
        }
      },
      "reward": {
        "real_balance": 0,
        "game_balance": 1250000
      }
    }
  },
  "service_settings": {
    "expire_interval": 604800
  },
  "tasks": {
    "schema_id": "tasks",
    "examine": {
      "action_text": "tasks.examine.action_text"
    },
    "investigate": {
      "action_text": "tasks.investigate.action_text"
    },
    "analyze": {
      "action_text": "tasks.analyze.action_text",
      "analyzed_action_text": "tasks.analyzed.action_text",
      "target_text": "tasks.analyzed.target_text"
    },
    "talk": {
      "action_text": "tasks.talk.action_text"
    },
    "arrest": {
      "action_text": "tasks.arrest.action_text",
      "target_text": "tasks.arrest.target_text",
      "tablet_img": "images/some_man.png"
    },
    "start_next_chapter": {
      "default_cost": 2,
      "default_img": "images/next_chapter.png",
      "action_text": "tasks.start_next_chapter.action_text",
      "target_text": "tasks.start_next_chapter.target_text"
    },
    "unlock_new_case": {
      "default_cost": 2,
      "default_img": "images/next_case.png",
      "action_text": "tasks.unlock_new_case.action_text",
      "target_text": "tasks.unlock_new_case.target_text"
    },
    "buy_item": {},
    "buy_booster": {},
    "earn_stars": {
      "default_img": "images/star.png",
      "action_text": "tasks.earn_stars.action_text",
      "target_text": "tasks.earn_stars.target_text",
      "tablet_img": "images/icon_medal_gold.png"
    }
  },
  "tutorial": {
    "schema_id": "tutorial",
    "steps": [
      "tutor_start",
      "tutor_step_1",
      "tutor_step_2",
      "tutor_step_3",
      "tutor_step_4",
      "tutor_step_5",
      "tutor_step_6",
      "tutor_step_7",
      "tutor_step_8",
      "tutor_step_9",
      "tutor_step_10",
      "tutor_step_11",
      "tutor_step_12",
      "tutor_step_13",
      "tutor_step_14",
      "tutor_step_15",
      "tutor_step_16",
      "tutor_step_17",
      "tutor_step_18",
      "tutor_step_19",
      "tutor_step_20",
      "tutor_step_21",
      "tutor_step_22",
      "tutor_step_23",
      "tutor_step_24",
      "tutor_step_25",
      "tutor_step_26",
      "tutor_step_27",
      "tutor_step_28"
    ]
  }
}


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
exports.createContext = createContext;