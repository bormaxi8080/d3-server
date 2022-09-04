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
