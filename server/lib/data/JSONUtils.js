/**
 *
 * Набор статических методов для отображения данных объектов на json-хранилище
 */

var clone = require('node-v8-clone').clone;
var zlib = require('zlib');

var JSONUtils = {};

/**
 * возвращает установленное значение в json-хранилище по заданному пути
 *
 * @param hash json-хранилище
 * @param path путь к значению
 * @return {*} установленное значение
 */
JSONUtils.get = function(hash, path) {
    var prop = JSONUtils.find(hash, path, false);
    if (!prop || !prop.exists)
        throw new Error("Свойство [" + path + "] не найдено!");
    return prop.holder[prop.name];
};

/**
 * устанавливает в json-хранилище новое значение по заданному пути
 *
 * @param hash json-хранилище
 * @param path путь к значению
 * @param value новое значение
 */
JSONUtils.set = function(hash, path, value) {
    var prop = JSONUtils.find(hash, path, true);
    if ((value === null) || (value === undefined))
        delete prop.holder[prop.name];
    else
        prop.holder[prop.name] = value;
};

/**
 * ищет в json-хранилище значение по заданному пути
 *
 * @param hash json-хранилище
 * @param path путь к значению
 * @return {findResult} результат поиска
 */
JSONUtils.find = function(hash, path, create) {
    var parts = path.split(".");
    var currentTarget = hash;
    var currentProp;
    var propName = parts.pop(); // последнее в массиве - это имя свойства

    while (parts.length) {
        currentProp = parts.shift(); // имя следующего объекта в цепочке
        if (!(currentProp in currentTarget)) {
            if (create)
                currentTarget[currentProp] = {};
            else
                return null;
        }
        currentTarget = currentTarget[currentProp];
    }

    return {holder: currentTarget, name: propName, exists: (propName in currentTarget)};
};

/**
 * устанавливает inplace в json-хранилище новые значения по заданным путям
 *
 * @param hash json-хранилище
 * @param changes масстив путь/значение
 * @return {*} измененное json-хранилище
 */
JSONUtils.setArray = function(hash, changes) {
    for (var i = 0; i < changes.length; i++) {
        var change = changes[i];
        JSONUtils.set(hash, change.name, change.value);
    }
    return hash;
};
/**
 * устанавливает inplace в json-хранилище данные из объекта согласно схеме
 *
 * @param hash json-хранилище
 * @param object отображаемый объект
 * @param map схема отображения
 * @return {*} измененное json-хранилище
 */
JSONUtils.map = function(hash, object, map) {
    for (var field in map) {
        var fieldMap = map[field];
        if (typeof(fieldMap) != 'object')
            fieldMap = {data: fieldMap, object: false};

        if (fieldMap.extract_only || (!object[field] && !fieldMap.map_null)) {
            continue;
        }

        var value = (fieldMap.object ? JSON.parse(object[field]) : object[field]);

        if (typeof(fieldMap.data) != 'object')
            JSONUtils.set(hash, fieldMap.data, value);
        else if (value) {
            for (var subField in fieldMap.data) {
                if (value[subField])
                    JSONUtils.set(hash, fieldMap.data[subField], value[subField]);
            }
        }
    }
    return hash;
};

/**
 * Извлекает из json-хранилища данные в объект согласно схеме
 *
 * @param hash json-хранилище
 * @param object отображаемый объект
 * @param map схема отображения
 * @param clean удаление отображаемых данных из json-хранилища
 * @param inplace удаление отображаемых данных в исходном json-хранилище
 * @return {*} измененное json-хранилище
 */
JSONUtils.unmap = function(hash, object, map, clean, inplace) {
    if (clean && !inplace)
        hash = JSONUtils.clone(hash);
    for (var field in map) {
        var fieldMap = map[field];
        if (typeof(fieldMap) != 'object')
            fieldMap = {data: fieldMap, object: false};

        if (fieldMap.extract_only || !fieldMap.unmap) {
            continue;
        }

        var prop = null;
        var val = null;
        if (typeof(fieldMap.data) != 'object') {
            prop = JSONUtils.find(hash, fieldMap.data, false);
            val = (prop.exists ? prop.holder[prop.name] : null);
            if (clean && prop.exists && prop.holder)
                delete prop.holder[prop.name];
        }
        else {
            val = {};
            for (var subField in fieldMap.data) {
                prop = JSONUtils.find(hash, fieldMap.data[subField], false);
                val[subField] = (prop.exists ? prop.holder[prop.name] : null);
                if (clean && prop.exists && prop.holder)
                    delete prop.holder[prop.name];
            }
        }

        if (fieldMap.object && val) {
            val = JSON.stringify(val);
        }

        object[field] = val;
    }
    return hash;
};

JSONUtils.extract = function(hash, object, map) {
    for (var field in map) {
        var fieldMap = map[field];
        if (typeof(fieldMap) != 'object') {
            fieldMap = {data: fieldMap, object: false};
        }
        if (fieldMap.extract_only || fieldMap.extract) {
            var prop = JSONUtils.find(hash, fieldMap.data, false);
            var val = (prop.exists ? prop.holder[prop.name] : null);
            object[field] = (fieldMap.object ? JSON.stringify(val || {}) : val);
        }
    }
};

/**
 * Копирует объект (без копирования вложенных)
 *
 * @param obj исходный объект
 * @return {*} скоприованный json-объект
 */
JSONUtils.copy = function(obj) {
    return clone(obj, false);
};

/**
 * Клонирует объект (с рекурсивным клонированием вложенных)
 *
 * @param obj исходный объект
 * @return {*} скоприованный json-объект
 */
JSONUtils.clone = function(obj) {
    return clone(obj, true);
};

JSONUtils.pack = function(hash, cb) {
    zlib.deflate(JSON.stringify(hash), function(err, buff) {
        if (err)
            cb(err, null);
        else
            cb(null, buff.toString('base64'));
    })
};

JSONUtils.unpack = function(data, cb) {
    zlib.inflate(new Buffer(data, 'base64'), function(err, buff) {
        try {
            data = JSON.parse(err ? data : buff.toString());
            cb(null, data);
        }
        catch (e) {
            cb(e.message, null);
        }
    })
};

module.exports = JSONUtils;
