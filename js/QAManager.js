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