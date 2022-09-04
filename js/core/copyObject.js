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
