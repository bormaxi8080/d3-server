/**
 * Утилита для проверки соответствия объекта
 * какому-либо интерфейсу. Фактически проверяется
 * наличие и тип полей.
 */
var interfaceChecker = new (function()
{
    /**
     * Хэш, хранящий шаблоны интерфейсов
     */
    var _templates = {};

    this.createTemplate = function(name, template)
    {
        if (!name) throw new Error("Параметр не должен быть нулевым!");
        if (typeof(name) !== "string") throw new Error("Имя шаблона должно быть строкой!");
        if (name in _templates) throw new Error("Шаблон с таким именем уже зарегистрирован!");

        if (!template) new Error("Параметр не должен быть нулевым!");

        _templates[name] = template;
    };

    /**
     * Проверить, удовлетворяет ли объект интерфейсу шаблона
     *
     * @param templateName  {String}
     * @param target        {Object}
     *
     * @return {Boolean}
     */
    this.kindOf = function(templateName, target)
    {
        if (templateName === null) throw new Error("Параметр не должен быть нулевым!");
        if (typeof(templateName) != "string") throw new Error("Имя шаблона должно быть строкой!");
        if (!_templates.hasOwnProperty(templateName)) throw new Error("Шаблон с таким именем не зарегистрирован!");

        // 0. null
        if ((_templates[templateName] == null) || (_templates[templateName] == undefined))
        {
            return (target === _templates[templateName]);
        }

        // 1. Простые типы
        var t = typeof(_templates[templateName])
        if (t !== 'object')
        {
            return (t === typeof(target));
        }

        if (typeof(target) !== 'object') return false;

        // 2. Массив
        if (_templates[templateName] instanceof Array)
        {
            return (target instanceof Array);
        }

        if (target instanceof Array) return false;

        // и то и другое является объектом, дальше не проверяем
        return true;
    };

    /**
    *
    */
    this.validate = function(templateName, target)
    {
        if (!this.kindOf(templateName, target)) throw new Error("Объект не соответствует интерфейсу!");
    };

})();

/**
 * Добавить шаблон интерфейса
 *
 * @param   name        {String}    Имя шаблона
 * @param   template    {Object}    Шаблонный объект
 */
exports.createTemplate = interfaceChecker.createTemplate;

/**
 * Проверить, удовлетворяет ли объект интерфейсу шаблона
 *
 * @param templateName  {String}    Имя шаблона для сравнения
 * @param target        {Object}    Объект для сравнения
 *
 * @return {Boolean}
 */
exports.kindOf = interfaceChecker.kindOf;

/**
 * Проверить наличие полей и соответствие их типа
 * типу полей шаблона. В случае несоответствия
 * выкидывается исключение
 *
 * @param templateName  {String}    Имя шаблона для сравнения
 * @param target        {Object}    Объект для сравнения
 *
 * @trows {Error}
 */
exports.validate = interfaceChecker.validate;
